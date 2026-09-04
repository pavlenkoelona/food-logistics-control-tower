import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class LogisticsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.connection = sqlite3.connect(":memory:")
        cls.connection.executescript((ROOT / "sql/01_schema.sql").read_text(encoding="utf-8"))
        cls.connection.executescript((ROOT / "sql/02_seed_data.sql").read_text(encoding="utf-8"))

    @classmethod
    def tearDownClass(cls):
        cls.connection.close()

    def test_temperature_exception_is_detected(self):
        rows = self.connection.execute("""
          SELECT b.batch_id FROM temperature_readings tr
          JOIN batches b ON b.batch_id=tr.batch_id
          JOIN materials m ON m.material_id=b.material_id
          WHERE tr.temperature_c NOT BETWEEN m.min_temperature AND m.max_temperature
        """).fetchall()
        self.assertEqual(rows, [('B-260904-17',)])

    def test_shortage_is_detected(self):
        row = self.connection.execute("""
          SELECT mr.required_quantity-SUM(ba.allocated_quantity)
          FROM material_requirements mr JOIN batch_allocations ba
            ON ba.production_order_id=mr.production_order_id AND ba.material_id=mr.material_id
          WHERE mr.production_order_id='PO-46018' AND mr.material_id=2004
        """).fetchone()
        self.assertEqual(row[0], 120)

    def test_recall_trace_reaches_finished_product(self):
        row = self.connection.execute("""
          SELECT po.product_name FROM batch_allocations ba JOIN production_orders po
            ON po.production_order_id=ba.production_order_id
          WHERE ba.batch_id='B-260826-04'
        """).fetchone()
        self.assertEqual(row[0], 'Chicken fricassee')

    def test_fefo_index_exists(self):
        names = {row[0] for row in self.connection.execute(
            "SELECT name FROM sqlite_schema WHERE type='index'"
        )}
        self.assertIn('idx_batches_fefo', names)


if __name__ == "__main__":
    unittest.main()

