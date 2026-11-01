# Reliability, Redis & Background Jobs

## Dependency failure
Untuk setiap dependency, tentukan timeout, retry, fallback, circuit behavior, dan dampak jika unavailable.

## Redis
Bedakan penggunaan:
- cache: mungkin fail-open;
- session: policy harus menjaga revocation;
- rate limit: bypass dapat membuka abuse;
- OTP: biasanya fail-closed;
- distributed lock: fail-closed untuk critical section;
- queue: butuh durability dan recovery.

Pastikan connection lifecycle eksplisit, reconnect/backoff terkendali, key namespace, TTL, memory policy, dan graceful shutdown.

## Retry
Retry hanya error transient dan operasi yang aman diulang. Gunakan exponential backoff + jitter, batas percobaan, dan timeout total. Hindari retry storm.

## Queue
- handler idempotent;
- bounded concurrency;
- backpressure;
- retry/dead-letter;
- job visibility/lease;
- deduplication;
- graceful shutdown;
- metrics dan tracing;
- recovery setelah restart.

Jangan menaruh pekerjaan penting hanya di memory process jika kehilangan job tidak dapat diterima.
