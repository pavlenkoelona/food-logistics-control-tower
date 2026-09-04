# Portfolio case: food logistics control tower

## Real-world inspiration

This independent project was designed around common requirements in food-production logistics and SAP EWM-oriented warehouse operations. The relevant themes include:

- controlling the complete material flow into production;
- planning internal truck routes;
- working with SAP EWM;
- providing raw materials at the right time and quantity;
- digitally recording warehouse movements;
- preserving food-safety traceability.

No private company information, trademarks, internal layouts or production data are used. FreshFlow and every supplier, batch, product, quantity and transaction in the project are fictional.

## Solution narrative

The control tower connects inbound reception, quality inspection, putaway, FEFO allocation, production staging and batch consumption. Instead of presenting isolated SQL exercises, it answers concrete operational questions:

1. Which released batch should be consumed first?
2. Is a temperature reading outside the material tolerance?
3. Which production order has an ingredient shortage?
4. Which finished meals are affected by a supplier batch?
5. Which internal warehouse route is delayed?

## SAP EWM concept mapping

| Portfolio concept | SAP-oriented concept |
|---|---|
| `materials` | Product/material master subset |
| `batches` | Batch-managed stock |
| `storage_bins` | Warehouse storage bins |
| `warehouse_tasks` | Warehouse tasks/internal movements |
| `quality_status` | Stock usage/quality decision |
| `batch_allocations` | Production staging/allocation |

The mapping is conceptual. Productive SAP EWM implementations contain substantially more configuration and business rules.

## Interview talking points

- Composite and foreign keys make every batch movement traceable.
- The FEFO index supports the most frequent allocation query.
- Temperature exceptions block questionable stock before production allocation.
- Shortage analysis compares requirements with actual batch allocations.
- The dashboard separates normal flow from exceptions requiring human decisions.

