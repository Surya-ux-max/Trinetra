# TRINETRA — AI Border Surveillance System

> त्रिनेत्र · The Third Eye of India

Real-time border surveillance system using computer vision and AI to detect unauthorized movement and instantly alert field troops.

---

## How It Works

1. Each border sector streams live video via RTSP (IP camera) or webcam
2. YOLOv8 detects persons, vehicles, and animals in every frame
3. Motion detection filters out static frames to reduce false positives
4. Threat level is assessed (HIGH / MEDIUM / LOW) based on detected objects
5. Alerts are pushed instantly to the dashboard via WebSocket and to soldiers' phones via ntfy.sh

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite |
| Backend | FastAPI, Uvicorn |
| Detection | YOLOv8s (Ultralytics) |
| Streaming | RTSP via OpenCV, MJPEG feed |
| Real-time | WebSocket |
| Alerts | ntfy.sh (free push notifications) |
| Storage | Redis (alert history) |

---

## Project Structure

```
Trinetra/
├── client-react/        # React dashboard
│   └── src/
│       ├── pages/       # Landing, Login, Dashboard
│       ├── components/  # AlertFeed, SectorPanel, CommandPanel, etc.
│       ├── hooks/       # useWebSocket
│       └── utils/       # api.js
└── server/
    └── app/
        ├── main.py              # FastAPI routes
        ├── video_processor.py   # Live stream + detection pipeline
        ├── object_detection.py  # YOLOv8 wrapper
        ├── motion_detection.py  # Frame diff motion detection
        ├── alert_engine.py      # Per-sector alert cooldown + Redis
        ├── websocket_manager.py # WebSocket broadcast
        └── whatsapp_service.py  # ntfy.sh push notifications
```

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (running on localhost:6379)
- YOLOv8s model: download `yolov8s.pt` from [Ultralytics](https://github.com/ultralytics/assets/releases) and place it in `server/`

### Backend

```bash
cd server
pip install -r requirements.txt
cp .env.example .env        # fill in your NTFY_TOPIC
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd client-react
npm install
npm run dev
```

Open `http://localhost:5173` — login PIN is `000000`.

---

## Live Stream Setup

In the dashboard, enter a stream URL for each sector:

| Source | URL format |
|---|---|
| Webcam (test) | `0` |
| IP Camera (RTSP) | `rtsp://username:password@192.168.1.x:554/stream` |
| Hikvision | `rtsp://admin:pass@ip:554/Streaming/Channels/101` |
| Dahua | `rtsp://admin:pass@ip:554/cam/realmonitor?channel=1&subtype=0` |

---

## Push Notifications

Alerts are sent to your phone via [ntfy.sh](https://ntfy.sh) — no account needed.

1. Install the ntfy app on your phone
2. Subscribe to your topic (set in `.env` as `NTFY_TOPIC`)
3. Receive instant alerts with threat level and detected objects

---

## Sectors

| Sector | Location |
|---|---|
| Alpha | North Border |
| Bravo | East Perimeter |
| Charlie | South Gate |

---

## Note on Model File

`yolov8s.pt` is not included in this repo (too large). Download it:

```bash
pip install ultralytics
yolo export model=yolov8s.pt  # or just let ultralytics auto-download on first run
```
