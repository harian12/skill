# Production Readiness & Observability

## Observability
- Structured logs dengan timestamp, level, service, environment, request/correlation ID.
- Metrics: request rate, error rate, latency, saturation, DB pool, queue depth/failure.
- Tracing untuk request lintas service bila dibutuhkan.
- Redact credential, token, OTP, payment data, dan PII.

## Runtime
- Health vs readiness check dibedakan.
- Graceful shutdown menutup server, DB pool, Redis, worker.
- Timeout dan connection pool disesuaikan kapasitas.
- Konfigurasi production tervalidasi saat startup.
- Process restart tidak boleh menyebabkan job penting hilang.

## Release
- Build reproducible dan lockfile terjaga.
- Migration direncanakan sebelum deploy.
- Backward compatibility diperhatikan saat rolling deployment.
- Ada rollback/forward-fix plan.
- Alert dan runbook tersedia untuk failure kritis.

Lulus build bukan bukti sistem siap production. Nyatakan cakupan pemeriksaan dan risiko yang belum divalidasi.
