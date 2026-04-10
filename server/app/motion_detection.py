import cv2

# Per-sector previous frame — prevents cross-sector false motion
_sector_frames: dict = {}


def detect_motion(frame, sector_id: str = "default"):
    global _sector_frames

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (21, 21), 0)

    prev = _sector_frames.get(sector_id)
    if prev is None:
        _sector_frames[sector_id] = gray
        return False

    frame_delta = cv2.absdiff(prev, gray)
    thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
    motion = thresh.sum() > 50000

    _sector_frames[sector_id] = gray
    return motion


def reset_sector(sector_id: str):
    _sector_frames.pop(sector_id, None)