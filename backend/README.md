# PlantOps Maestro Lite - Backend

FastAPI backend for the interview demo. It exposes deterministic synthetic data for a tiny plant with four assets:

- Reactor-1
- Cooling Loop
- Feed Pump
- Storage Tank

## Features

- Healthy, stable default state
- Simple in-memory scenario injection/reset
- Lightweight anomaly detection (rolling z-score + a few rules)
- Incident roll-up from detected anomalies

## API Endpoints

- `GET /health`
- `GET /kpis`
- `GET /assets`
- `GET /timeseries`
- `GET /anomalies`
- `GET /incidents`
- `GET /incidents/{incident_id}`
- `POST /demo/reset`
- `POST /demo/inject/{scenario_name}`

Supported scenarios:

- `cooling_valve_stiction`
- `sensor_drift`
- `pump_degradation`

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open docs at: `http://localhost:8000/docs`

## Quick smoke test

```bash
curl http://localhost:8000/health
curl http://localhost:8000/kpis
curl -X POST http://localhost:8000/demo/inject/pump_degradation
curl http://localhost:8000/anomalies
```
