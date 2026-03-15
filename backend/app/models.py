from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Asset(BaseModel):
    asset_id: str
    name: str
    asset_type: str


class SignalPoint(BaseModel):
    timestamp: datetime
    asset_id: str
    temperature: float
    pressure: float
    flow: float
    energy_usage: float
    production_rate: float
    quality_score: float


class KPIResponse(BaseModel):
    plant_status: Literal["healthy", "warning", "degraded"]
    total_assets: int
    active_scenario: str | None
    avg_quality_score: float
    avg_energy_usage: float
    avg_production_rate: float
    anomaly_count: int
    open_incidents: int


class Anomaly(BaseModel):
    anomaly_id: str
    timestamp: datetime
    asset_id: str
    metric: str
    value: float
    reason: str
    severity: Literal["low", "medium", "high"]


class Incident(BaseModel):
    incident_id: str
    title: str
    asset_id: str
    status: Literal["open", "resolved"]
    severity: Literal["low", "medium", "high"]
    started_at: datetime
    summary: str
    linked_anomalies: list[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    service: str


class DemoActionResponse(BaseModel):
    status: str
    active_scenario: str | None
    message: str
