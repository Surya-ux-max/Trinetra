import cv2
import time
import os
import json
import threading
import asyncio
from app.object_detection import detect_objects
from app.motion_detection import detect_motion
from app.config import FRAMES_DIR
from app.redis_client import redis_client

# Per-sector state
sector_states = {
    "alpha": {"active": False, "progress": 0, "total": 0, "detections": 0, "status": "idle", "threat": "NONE"},
    "bravo": {"active": False, "progress": 0, "total": 0, "detections": 0, "status": "idle", "threat": "NONE"},
    "charlie": {"active": False, "progress": 0, "total": 0, "detections": 0, "status": "idle", "threat": "NONE"},
}

# Holds the latest JPEG frame per sector for MJPEG streaming
live_frames: dict[str, bytes] = {}

# Tracks running live stream threads
live_stream_threads: dict[str, threading.Thread] = {}

# Computer vision based threat analysis
def analyze_with_cv(objects: list, location: str) -> str:
    analysis_parts = []
    
    # Threat assessment based on detected objects
    if "person" in objects and "vehicle" in objects:
        analysis_parts.append("THREAT_LEVEL: HIGH")
        analysis_parts.append(f"Multiple entities detected at {location}.")
        analysis_parts.append("Person and vehicle detected together - potential unauthorized access.")
        analysis_parts.append("RECOMMENDATION: Dispatch security team immediately.")
    elif "person" in objects:
        if "animal" in objects:
            analysis_parts.append("THREAT_LEVEL: MEDIUM")
            analysis_parts.append(f"Person with animal detected at {location}.")
            analysis_parts.append("Possible civilian activity - monitor closely.")
        else:
            analysis_parts.append("THREAT_LEVEL: HIGH")
            analysis_parts.append(f"Unauthorized person detected at {location}.")
            analysis_parts.append("Single individual in restricted zone.")
            analysis_parts.append("RECOMMENDATION: Investigate immediately.")
    elif "vehicle" in objects:
        analysis_parts.append("THREAT_LEVEL: MEDIUM")
        analysis_parts.append(f"Unidentified vehicle detected at {location}.")
        analysis_parts.append("Vehicle movement in monitored area.")
        analysis_parts.append("RECOMMENDATION: Verify vehicle authorization.")
    elif "animal" in objects:
        analysis_parts.append("THREAT_LEVEL: LOW")
        analysis_parts.append(f"Animal movement detected at {location}.")
        analysis_parts.append("Wildlife activity - no immediate threat.")
    else:
        analysis_parts.append("THREAT_LEVEL: LOW")
        analysis_parts.append(f"Unknown object detected at {location}.")
        analysis_parts.append("Monitoring situation.")
    
    return "\n".join(analysis_parts)

# Confidence scoring based on detected objects
def compute_confidence(objects: list, analysis: str) -> tuple:
    score = 0
    if "person" in objects:   score += 40
    if "vehicle" in objects:  score += 30
    if "animal" in objects:   score += 10
    if len(objects) > 1:      score += 15

    if "HIGH"   in analysis: score += 30
    elif "MEDIUM" in analysis: score += 15
    elif "LOW"  in analysis: score += 5

    score = min(score, 99)

    if score >= 70:   threat = "HIGH"
    elif score >= 40: threat = "MEDIUM"
    else:             threat = "LOW"

    return score, threat



def _run_live_stream(sector_id: str, stream_url: str, location: str, loop, broadcast_fn):
    """Runs in a background thread — reads RTSP/webcam frames continuously."""
    from app.motion_detection import detect_motion, reset_sector

    state = sector_states[sector_id]
    state.update({"active": True, "progress": 0, "detections": 0, "status": "live", "threat": "NONE"})

    reset_sector(sector_id)  # clear stale frame for this sector

    cap = cv2.VideoCapture(stream_url)
    if not cap.isOpened():
        print(f"[{sector_id}] ERROR: Cannot open stream: {stream_url}")
        state.update({"active": False, "status": "error"})
        return

    print(f"[{sector_id}] Stream opened: {stream_url}")
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    last_sample = 0
    SAMPLE_INTERVAL = 2

    os.makedirs(FRAMES_DIR, exist_ok=True)

    while state.get("active"):
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue

        _, jpeg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        live_frames[sector_id] = jpeg.tobytes()

        now = time.time()
        if now - last_sample < SAMPLE_INTERVAL:
            continue
        last_sample = now

        if not detect_motion(frame, sector_id):  # pass sector_id
            continue

        objects = detect_objects(frame)
        if not objects:
            continue

        ts = time.strftime("%Y%m%d_%H%M%S")
        frame_path = os.path.join(FRAMES_DIR, f"{sector_id}_{ts}.jpg")
        cv2.imwrite(frame_path, frame)

        analysis = analyze_with_cv(objects, location)
        confidence, threat = compute_confidence(objects, analysis)

        state["detections"] += 1
        state["threat"] = threat

        alert = {
            "type":       "alert",
            "sector":     sector_id,
            "timestamp":  time.strftime("%Y-%m-%d %H:%M:%S"),
            "location":   location,
            "objects":    objects,
            "analysis":   analysis,
            "confidence": confidence,
            "threat":     threat,
            "frame":      frame_path,
        }

        payload = json.dumps({k: v for k, v in alert.items() if k != "type"})
        redis_client.lpush("alert_history", payload)
        redis_client.ltrim("alert_history", 0, 99)

        asyncio.run_coroutine_threadsafe(broadcast_fn(json.dumps(alert)), loop)

    cap.release()
    live_frames.pop(sector_id, None)
    reset_sector(sector_id)
    state.update({"active": False, "status": "idle"})


def start_live_stream(sector_id: str, stream_url: str, location: str, loop, broadcast_fn):
    """Start a live stream for a sector in a background thread."""
    # Convert numeric string to int for webcam device index
    source = int(stream_url) if stream_url.strip().lstrip('-').isdigit() else stream_url
    t = threading.Thread(
        target=_run_live_stream,
        args=(sector_id, source, location, loop, broadcast_fn),
        daemon=True,
    )
    live_stream_threads[sector_id] = t
    t.start()


def stop_live_stream(sector_id: str):
    """Signal the live stream thread to stop."""
    if sector_id in sector_states:
        sector_states[sector_id]["active"] = False
