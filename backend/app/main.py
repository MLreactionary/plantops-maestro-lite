from __future__ import annotations

from fastapi import FastAPI, HTTPException

from .data import DemoState
from .models import DemoActionResponse, HealthResponse, Incident

app = FastAPI(title="PlantOps Maestro Lite API", version="0.1.0")
state = DemoState()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="plantops-maestro-lite-backend")


@app.get("/kpis")
def get_kpis():
    return state.get_kpis()


@app.get("/assets")
def get_assets():
    return state.get_assets()


@app.get("/timeseries")
def get_timeseries():
    return state.get_timeseries()


@app.get("/anomalies")
def get_anomalies():
    return state.get_anomalies()


@app.get("/incidents")
def get_incidents() -> list[Incident]:
    return state.get_incidents()


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str) -> Incident:
    incident = state.get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@app.post("/demo/reset", response_model=DemoActionResponse)
def reset_demo() -> DemoActionResponse:
    state.reset()
    return DemoActionResponse(
        status="ok",
        active_scenario=state.active_scenario,
        message="Demo state reset to healthy baseline",
    )


@app.post("/demo/inject/{scenario_name}", response_model=DemoActionResponse)
def inject_scenario(scenario_name: str) -> DemoActionResponse:
    try:
        state.inject(scenario_name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return DemoActionResponse(
        status="ok",
        active_scenario=state.active_scenario,
        message=f"Scenario '{scenario_name}' injected",
    )
