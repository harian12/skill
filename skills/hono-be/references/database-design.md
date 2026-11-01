# Database Design & Query Performance

## Schema
- Tentukan entity, relationship, cardinality, lifecycle, ownership, dan tenant boundary.
- Gunakan FK/unique/check constraints bila didukung dan sesuai.
- Tentukan nullability/default dengan eksplisit.
- Gunakan tipe data yang tepat; jangan gunakan float untuk uang.
- Tetapkan timezone convention.
- Hindari soft delete kecuali ada kebutuhan audit/recovery yang jelas.

## Index
Buat index berdasarkan pola WHERE, JOIN, ORDER BY, dan uniqueness. Periksa urutan kolom composite index dan selectivity. Gunakan EXPLAIN/EXPLAIN ANALYZE jika tersedia.

## Query
- Hindari N+1.
- Gunakan join/batch/inArray/chunking sesuai volume.
- Hindari query per item jika dapat dibatch.
- Batasi kolom yang diambil.
- Gunakan cursor pagination untuk koleksi besar atau data yang terus berubah.
- Perhatikan parameter limit database dan ukuran payload.

## Migration
- Jangan mengubah schema production secara manual tanpa proses.
- Untuk perubahan besar, gunakan expand/backfill/contract.
- Evaluasi lock, downtime, data migration, rollback, dan kompatibilitas versi aplikasi.
