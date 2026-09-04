# FreshFlow — SAP EWM-Inspired Food Logistics Control Tower

An interactive portfolio project for food-production logistics: cold-chain monitoring, FEFO inventory allocation, production-shortage detection, internal material routes and one-click batch traceability.

> FreshFlow is an independent learning project based on common food-production logistics requirements. All companies, materials, batches and transactions shown in the demonstration are fictional.

## Why this project exists

Food manufacturers need reliable material-flow control, internal route planning, digital warehouse movements and end-to-end batch traceability. This project translates those industry requirements into a demonstrable data product.

## Capabilities

- Live operations overview with production readiness
- Cold-storage capacity and temperature exceptions
- FEFO queue ordered by expiry risk
- Ingredient-shortage analysis
- Supplier-to-finished-meal batch trace
- Internal warehouse-task monitoring
- Responsive light/dark dashboard
- SQL schema, indexes and analytical queries
- Automated data controls

## Run locally

No installation or external package is required. With Python 3:

```bash
python server.py
```

Open `http://localhost:8080`.

Run the data tests:

```bash
python -m unittest discover -s tests -v
```

## Structure

```text
index.html / styles.css / app.js   Interactive dashboard
data/logistics.json                Fictional browser demonstration data
sql/                               Normalised model and business queries
tests/                             Automated SQL controls
docs/                              Business case and security notes
server.py                          Standard-library local server
```

## Technical highlights

- A composite FEFO index supports released-stock selection by material and expiry.
- A partial index keeps open warehouse-task monitoring efficient.
- Window functions rank eligible batches.
- Traceability joins supplier, batch, material allocation, production order and finished product.
- The site is static and suitable for GitHub Pages.

## License

MIT

