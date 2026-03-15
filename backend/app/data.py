from __future__ import annotations

import math
import statistics
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from .models import Anomaly, Asset, Incident, KPIResponse, SignalPoint


@dataclass(frozen=True)
class ScenarioDefinition:
    name: str
    description: str


class DemoState:
    """In-memory deterministic synthetic demo state."""

    SCENARIOS = {
        "cooling_valve_stiction": ScenarioDefinition(
            name="cooling_valve_stiction",
            description="Cooling loop flow drops and reactor temperature rises in pulses.",
        ),
        "sensor_drift": ScenarioDefinition(
            name="sensor_drift",
            description="Storage tank quality sensor drifts downward over time.",
        ),
        "pump_degradation": ScenarioDefinition(
            name="pump_degradation",
            description="Feed pump gradually loses flow efficiency and uses more energy.",
        ),
    }

    # Nominal operating points and healthy ranges for each asset/metric.
    BASELINES = {
        "reactor_1": {
            "temperature": {"nominal": 92.0, "min": 89.0, "max": 95.0, "amp": 0.25},
            "pressure": {"nominal": 3.6, "min": 3.3, "max": 3.9, "amp": 0.03},
            "flow": {"nominal": 80.0, "min": 74.0, "max": 86.0, "amp": 0.6},
            "energy_usage": {"nominal": 120.0, "min": 112.0, "max": 128.0, "amp": 0.7},
            "production_rate": {"nominal": 55.0, "min": 51.0, "max": 59.0, "amp": 0.45},
            "quality_score": {"nominal": 98.0, "min": 96.0, "max": 100.0, "amp": 0.12},
        },
        "cooling_loop": {
            "temperature": {"nominal": 28.0, "min": 26.0, "max": 30.0, "amp": 0.2},
            "pressure": {"nominal": 2.7, "min": 2.4, "max": 3.0, "amp": 0.025},
            "flow": {"nominal": 95.0, "min": 88.0, "max": 102.0, "amp": 0.55},
            "energy_usage": {"nominal": 45.0, "min": 40.0, "max": 50.0, "amp": 0.45},
            "production_rate": {"nominal": 0.0, "min": -0.5, "max": 0.5, "amp": 0.05},
            "quality_score": {"nominal": 100.0, "min": 99.0, "max": 100.0, "amp": 0.08},
        },
        "feed_pump": {
            "temperature": {"nominal": 41.0, "min": 38.0, "max": 44.0, "amp": 0.2},
            "pressure": {"nominal": 4.2, "min": 3.9, "max": 4.5, "amp": 0.03},
            "flow": {"nominal": 75.0, "min": 70.0, "max": 80.0, "amp": 0.55},
            "energy_usage": {"nominal": 38.0, "min": 34.0, "max": 42.0, "amp": 0.45},
            "production_rate": {"nominal": 52.0, "min": 48.0, "max": 56.0, "amp": 0.4},
            "quality_score": {"nominal": 99.0, "min": 97.0, "max": 100.0, "amp": 0.1},
        },
        "storage_tank": {
            "temperature": {"nominal": 33.0, "min": 31.0, "max": 35.0, "amp": 0.18},
            "pressure": {"nominal": 1.4, "min": 1.2, "max": 1.6, "amp": 0.02},
            "flow": {"nominal": 40.0, "min": 36.0, "max": 44.0, "amp": 0.4},
            "energy_usage": {"nominal": 22.0, "min": 19.0, "max": 25.0, "amp": 0.25},
            "production_rate": {"nominal": 50.0, "min": 46.0, "max": 54.0, "amp": 0.35},
            "quality_score": {"nominal": 97.0, "min": 95.0, "max": 100.0, "amp": 0.12},
        },
    }

    ZSCORE_MIN_DELTA = {
        "temperature": 1.0,
        "pressure": 0.12,
        "flow": 3.5,
        "energy_usage": 3.0,
        "production_rate": 2.5,
        "quality_score": 1.4,
    }

    def __init__(self) -> None:
        self.assets = [
            Asset(asset_id="reactor_1", name="Reactor-1", asset_type="reactor"),
            Asset(asset_id="cooling_loop", name="Cooling Loop", asset_type="utility"),
            Asset(asset_id="feed_pump", name="Feed Pump", asset_type="pump"),
            Asset(asset_id="storage_tank", name="Storage Tank", asset_type="tank"),
        ]
        self.reset()

    def reset(self) -> None:
        self.active_scenario: str | None = None
        self._timeseries = self._build_healthy_timeseries()
        self._anomalies = self._detect_anomalies(self._timeseries)
        self._incidents = self._build_incidents(self._anomalies)

    def inject(self, scenario_name: str) -> None:
        if scenario_name not in self.SCENARIOS:
            raise ValueError(f"Unknown scenario: {scenario_name}")

        self.active_scenario = scenario_name
        self._timeseries = self._build_healthy_timeseries()
        self._apply_scenario(scenario_name, self._timeseries)
        self._anomalies = self._detect_anomalies(self._timeseries)
        self._incidents = self._build_incidents(self._anomalies)

    def get_assets(self) -> list[Asset]:
        return self.assets

    def get_timeseries(self) -> list[SignalPoint]:
        return self._timeseries

    def get_anomalies(self) -> list[Anomaly]:
        return self._anomalies

    def get_incidents(self) -> list[Incident]:
        return self._incidents

    def get_incident_by_id(self, incident_id: str) -> Incident | None:
        return next((inc for inc in self._incidents if inc.incident_id == incident_id), None)

    def get_kpis(self) -> KPIResponse:
        quality = statistics.fmean(p.quality_score for p in self._timeseries)
        energy = statistics.fmean(p.energy_usage for p in self._timeseries)
        production = statistics.fmean(p.production_rate for p in self._timeseries)

        if self._incidents:
            plant_status = "degraded"
        elif self._anomalies:
            plant_status = "warning"
        else:
            plant_status = "healthy"

        return KPIResponse(
            plant_status=plant_status,
            total_assets=len(self.assets),
            active_scenario=self.active_scenario,
            avg_quality_score=round(quality, 2),
            avg_energy_usage=round(energy, 2),
            avg_production_rate=round(production, 2),
            anomaly_count=len(self._anomalies),
            open_incidents=len(self._incidents),
        )

    def _build_healthy_timeseries(self) -> list[SignalPoint]:
        # Deterministic 12 points spaced 5 minutes apart.
        base_ts = datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc)
        points: list[SignalPoint] = []

        for i in range(12):
            ts = base_ts + timedelta(minutes=5 * i)
            wave = math.sin(i / 3)
            for asset in self.assets:
                baseline = self.BASELINES[asset.asset_id]
                points.append(
                    SignalPoint(
                        timestamp=ts,
                        asset_id=asset.asset_id,
                        temperature=round(self._healthy_value(baseline, "temperature", wave), 2),
                        pressure=round(self._healthy_value(baseline, "pressure", wave), 3),
                        flow=round(self._healthy_value(baseline, "flow", wave), 2),
                        energy_usage=round(self._healthy_value(baseline, "energy_usage", wave), 2),
                        production_rate=round(self._healthy_value(baseline, "production_rate", wave), 2),
                        quality_score=round(self._healthy_value(baseline, "quality_score", wave, inverse=True), 2),
                    )
                )

        return points

    def _healthy_value(self, baseline: dict[str, dict[str, float]], metric: str, wave: float, inverse: bool = False) -> float:
        cfg = baseline[metric]
        value = cfg["nominal"] + (wave * cfg["amp"] * (-1 if inverse else 1))
        return max(cfg["min"], min(cfg["max"], value))

    def _apply_scenario(self, scenario_name: str, points: list[SignalPoint]) -> None:
        if scenario_name == "cooling_valve_stiction":
            for p in points:
                tick = (p.timestamp.minute // 5) % 6
                if p.asset_id == "cooling_loop" and tick in {2, 3}:
                    p.flow = round(p.flow - 20.0, 2)
                    p.pressure = round(p.pressure + 0.30, 3)
                if p.asset_id == "reactor_1" and tick >= 3:
                    p.temperature = round(p.temperature + 5.2, 2)
                    p.energy_usage = round(p.energy_usage + 6.8, 2)

        elif scenario_name == "sensor_drift":
            drift_step = 0
            for p in points:
                if p.asset_id == "storage_tank":
                    p.quality_score = round(p.quality_score - drift_step * 0.9, 2)
                    drift_step += 1

        elif scenario_name == "pump_degradation":
            drift_step = 0
            for p in points:
                if p.asset_id == "feed_pump":
                    p.flow = round(p.flow - drift_step * 1.6, 2)
                    p.energy_usage = round(p.energy_usage + drift_step * 1.3, 2)
                    p.production_rate = round(p.production_rate - drift_step * 1.1, 2)
                    drift_step += 1

    def _detect_anomalies(self, points: list[SignalPoint]) -> list[Anomaly]:
        anomalies: list[Anomaly] = []
        metrics = ["temperature", "pressure", "flow", "quality_score", "energy_usage", "production_rate"]

        for asset in self.assets:
            baseline = self.BASELINES[asset.asset_id]
            asset_points = [p for p in points if p.asset_id == asset.asset_id]
            for metric in metrics:
                values = [getattr(p, metric) for p in asset_points]
                for i, value in enumerate(values):
                    point = asset_points[i]
                    cfg = baseline[metric]

                    if value < cfg["min"] or value > cfg["max"]:
                        direction = "below" if value < cfg["min"] else "above"
                        anomalies.append(
                            self._make_anomaly(
                                point,
                                metric,
                                value,
                                f"{metric} {direction} healthy range [{cfg['min']}, {cfg['max']}]",
                                "high",
                            )
                        )
                        continue

                    if i < 5:
                        continue

                    window = values[i - 5 : i]
                    mean = statistics.fmean(window)
                    std_dev = statistics.pstdev(window)
                    abs_delta = abs(value - cfg["nominal"])
                    min_delta = self.ZSCORE_MIN_DELTA[metric]

                    if std_dev > 0.05 and abs_delta >= min_delta:
                        z = abs((value - mean) / std_dev)
                        if z >= 3.5:
                            anomalies.append(
                                self._make_anomaly(
                                    point,
                                    metric,
                                    value,
                                    f"rolling z-score {z:.2f} >= 3.5 with delta {abs_delta:.2f}",
                                    "medium",
                                )
                            )

        return self._dedupe_anomalies(anomalies)

    def _dedupe_anomalies(self, anomalies: list[Anomaly]) -> list[Anomaly]:
        seen: set[tuple[datetime, str, str]] = set()
        unique: list[Anomaly] = []
        for anomaly in anomalies:
            key = (anomaly.timestamp, anomaly.asset_id, anomaly.metric)
            if key in seen:
                continue
            seen.add(key)
            unique.append(anomaly)
        return unique

    def _make_anomaly(self, point: SignalPoint, metric: str, value: float, reason: str, severity: str) -> Anomaly:
        anomaly_id = f"anom-{point.asset_id}-{metric}-{point.timestamp.strftime('%H%M')}"
        return Anomaly(
            anomaly_id=anomaly_id,
            timestamp=point.timestamp,
            asset_id=point.asset_id,
            metric=metric,
            value=round(value, 3),
            reason=reason,
            severity=severity,
        )

    def _build_incidents(self, anomalies: list[Anomaly]) -> list[Incident]:
        if not anomalies:
            return []

        by_asset: dict[str, list[Anomaly]] = {}
        for anomaly in anomalies:
            by_asset.setdefault(anomaly.asset_id, []).append(anomaly)

        incidents: list[Incident] = []
        for idx, (asset_id, items) in enumerate(by_asset.items(), start=1):
            highest = "low"
            if any(i.severity == "high" for i in items):
                highest = "high"
            elif any(i.severity == "medium" for i in items):
                highest = "medium"

            incidents.append(
                Incident(
                    incident_id=f"inc-{idx:03d}",
                    title=f"Operational deviation on {asset_id}",
                    asset_id=asset_id,
                    status="open",
                    severity=highest,
                    started_at=min(i.timestamp for i in items),
                    summary=f"{len(items)} anomalies detected for {asset_id} in current scenario.",
                    linked_anomalies=[i.anomaly_id for i in items],
                )
            )

        return incidents