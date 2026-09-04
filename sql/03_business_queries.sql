-- FEFO proposal: released batches with the earliest expiry first
SELECT m.material_name, b.batch_id, b.available_quantity, b.expiry_date,
       ROW_NUMBER() OVER (PARTITION BY b.material_id ORDER BY b.expiry_date) AS fefo_priority
FROM batches b JOIN materials m ON m.material_id=b.material_id
WHERE b.quality_status='RELEASED'
ORDER BY b.expiry_date;

-- Cold-chain exceptions
SELECT b.batch_id, m.material_name, tr.temperature_c, m.min_temperature, m.max_temperature,
       CASE WHEN tr.temperature_c BETWEEN m.min_temperature AND m.max_temperature
            THEN 'COMPLIANT' ELSE 'BLOCK_AND_REVIEW' END AS decision
FROM temperature_readings tr
JOIN batches b ON b.batch_id=tr.batch_id JOIN materials m ON m.material_id=b.material_id
WHERE tr.temperature_c NOT BETWEEN m.min_temperature AND m.max_temperature;

-- Shortage risk by production order and material
SELECT po.production_order_id, po.product_name, m.material_name, mr.required_quantity,
       COALESCE(SUM(ba.allocated_quantity),0) AS allocated_quantity,
       mr.required_quantity-COALESCE(SUM(ba.allocated_quantity),0) AS shortage_quantity
FROM production_orders po
JOIN material_requirements mr ON mr.production_order_id=po.production_order_id
JOIN materials m ON m.material_id=mr.material_id
LEFT JOIN batch_allocations ba ON ba.production_order_id=mr.production_order_id AND ba.material_id=mr.material_id
GROUP BY po.production_order_id,po.product_name,m.material_id,m.material_name,mr.required_quantity
HAVING mr.required_quantity>COALESCE(SUM(ba.allocated_quantity),0);

-- Recall trace: supplier -> batch -> production order -> finished meal
SELECT s.supplier_name,b.batch_id,m.material_name,po.production_order_id,po.product_name,ba.allocated_quantity
FROM batches b JOIN suppliers s ON s.supplier_id=b.supplier_id
JOIN materials m ON m.material_id=b.material_id
JOIN batch_allocations ba ON ba.batch_id=b.batch_id
JOIN production_orders po ON po.production_order_id=ba.production_order_id
WHERE b.batch_id=:batch_id;

-- Delayed internal routes
SELECT wt.task_id,b.batch_id,m.material_name,wt.source_bin,wt.destination,wt.planned_start,wt.status
FROM warehouse_tasks wt JOIN batches b ON b.batch_id=wt.batch_id
JOIN materials m ON m.material_id=b.material_id
WHERE wt.status IN ('OPEN','DELAYED') ORDER BY wt.planned_start;

