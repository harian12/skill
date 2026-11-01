# Transactions, Concurrency & Idempotency

## Kapan transaction
Gunakan transaction bila beberapa perubahan harus commit/rollback sebagai satu unit bisnis. Jangan membungkus network call panjang di dalam DB transaction.

## Concurrency hazards
Kenali:
- lost update;
- dirty/non-repeatable reads;
- write skew;
- duplicate submission;
- race saat cek lalu update;
- deadlock;
- double processing.

## Teknik
Pilih berdasarkan kebutuhan:
- atomic conditional UPDATE;
- unique constraint;
- optimistic version column;
- SELECT ... FOR UPDATE / row lock;
- isolation level;
- idempotency key;
- retry deadlock terbatas dengan jitter.

## Financial workflows
- Gunakan integer minor units atau DECIMAL.
- Simpan ledger/audit trail untuk perubahan saldo.
- Jangan hanya mempercayai nilai saldo dari client.
- Validasi saldo dan mutasi secara atomik.
- Pastikan debit/kredit seimbang sesuai model.
- Tentukan idempotency scope, expiry, dan response replay.
- Uji request paralel dan retry setelah timeout.

Transaction bukan solusi otomatis untuk semua race condition. Verifikasi perilaku pada engine dan isolation level database yang digunakan.
