export type Kpis = {
  plant_status: string;
  total_assets: number;
  active_scenario: string | null;
  avg_quality_score: number;
  avg_energy_usage: number;
  avg_production_rate: number;
  anomaly_count: number;
  open_incidents: number;
};

export type Asset = {
  asset_id: string;
  name: string;
  asset_type: string;
};

export type Incident = {
  incident_id: string;
  title: string;
  severity: string;
  asset_id: string;
  status: string;
  summary?: string;
};

export type TimeseriesPoint = {
  timestamp: string;
  asset_id: string;
  temperature: number;
  pressure: number;
  flow: number;
  energy_usage: number;
  production_rate: number;
  quality_score: number;
};
