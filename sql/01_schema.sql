PRAGMA foreign_keys = ON;

CREATE TABLE suppliers (
  supplier_id INTEGER PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  approved INTEGER NOT NULL CHECK (approved IN (0,1))
);
CREATE TABLE materials (
  material_id INTEGER PRIMARY KEY,
  material_name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_unit TEXT NOT NULL,
  storage_type TEXT NOT NULL,
  min_temperature REAL,
  max_temperature REAL
);
CREATE TABLE storage_bins (
  bin_id TEXT PRIMARY KEY,
  zone TEXT NOT NULL,
  capacity_kg REAL NOT NULL,
  temperature_zone TEXT NOT NULL
);
CREATE TABLE batches (
  batch_id TEXT PRIMARY KEY,
  material_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL,
  bin_id TEXT NOT NULL,
  received_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  available_quantity REAL NOT NULL,
  quality_status TEXT NOT NULL CHECK (quality_status IN ('RELEASED','HOLD','REJECTED')),
  FOREIGN KEY(material_id) REFERENCES materials(material_id),
  FOREIGN KEY(supplier_id) REFERENCES suppliers(supplier_id),
  FOREIGN KEY(bin_id) REFERENCES storage_bins(bin_id)
);
CREATE TABLE temperature_readings (
  reading_id INTEGER PRIMARY KEY,
  batch_id TEXT NOT NULL,
  measured_at TEXT NOT NULL,
  temperature_c REAL NOT NULL,
  FOREIGN KEY(batch_id) REFERENCES batches(batch_id)
);
CREATE TABLE production_orders (
  production_order_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  production_line TEXT NOT NULL,
  planned_date DATE NOT NULL,
  planned_portions INTEGER NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE material_requirements (
  production_order_id TEXT NOT NULL,
  material_id INTEGER NOT NULL,
  required_quantity REAL NOT NULL,
  PRIMARY KEY(production_order_id, material_id),
  FOREIGN KEY(production_order_id) REFERENCES production_orders(production_order_id),
  FOREIGN KEY(material_id) REFERENCES materials(material_id)
);
CREATE TABLE batch_allocations (
  production_order_id TEXT NOT NULL,
  material_id INTEGER NOT NULL,
  batch_id TEXT NOT NULL,
  allocated_quantity REAL NOT NULL,
  PRIMARY KEY(production_order_id, material_id, batch_id),
  FOREIGN KEY(production_order_id, material_id) REFERENCES material_requirements(production_order_id, material_id),
  FOREIGN KEY(batch_id) REFERENCES batches(batch_id)
);
CREATE TABLE warehouse_tasks (
  task_id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  source_bin TEXT NOT NULL,
  destination TEXT NOT NULL,
  planned_start TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  FOREIGN KEY(batch_id) REFERENCES batches(batch_id)
);

CREATE INDEX idx_batches_fefo ON batches(material_id, quality_status, expiry_date);
CREATE INDEX idx_temperature_batch_time ON temperature_readings(batch_id, measured_at);
CREATE INDEX idx_tasks_open ON warehouse_tasks(status, planned_start) WHERE status <> 'COMPLETED';
PRAGMA optimize;

