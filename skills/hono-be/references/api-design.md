# API Design & Contracts

- Definisikan resource, operation, request schema, response schema, dan error contract.
- Gunakan HTTP method/status code sesuai semantik.
- Konsisten tanpa merusak backward compatibility.
- Validasi pada boundary.
- Otorisasi pada resource dan action.
- Batasi pagination dan payload size.
- Gunakan cursor pagination bila offset tidak cocok.
- Terapkan idempotency untuk mutasi yang rawan retry/duplikasi.
- Dokumentasikan breaking changes dan versioning.
- Jangan mengembalikan raw exception atau detail infrastruktur.
- Pertimbangkan correlation/request ID untuk tracing.
