# Implementation Review Checklist

- [ ] Requirement dan acceptance criteria dipahami.
- [ ] Pola repository existing diikuti.
- [ ] Tidak ada abstraction/boilerplate yang tidak diperlukan.
- [ ] Error path dan edge case dipertimbangkan.
- [ ] Input tervalidasi pada boundary.
- [ ] Authorization dan ownership diperiksa.
- [ ] Query dan index masuk akal.
- [ ] Transaction/concurrency/idempotency dinilai jika relevan.
- [ ] Timeout/retry/fallback ditentukan untuk IO eksternal.
- [ ] Logging tidak membocorkan data sensitif.
- [ ] Test relevan ditambahkan/diperbarui.
- [ ] Typecheck/lint/build/test dijalankan sesuai scope.
- [ ] Migration dan backward compatibility diperiksa.
- [ ] Hasil dan keterbatasan verifikasi dilaporkan.
