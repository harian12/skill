# Security Review Checklist

- [ ] Authentication kuat dan token/session semantics jelas.
- [ ] Authorization dilakukan per action/resource.
- [ ] Ownership/tenant isolation diterapkan di query.
- [ ] Tidak ada trust terhadap userId/role/price/balance dari client.
- [ ] Input validation dan payload limits diterapkan.
- [ ] SQL injection, SSRF, path traversal, IDOR, mass assignment dipertimbangkan.
- [ ] Rate limiting/abuse prevention sesuai risiko.
- [ ] Secret dan PII tidak masuk log/response.
- [ ] Dependency failure tidak melewati kontrol keamanan.
- [ ] Least privilege diterapkan.
- [ ] Security negative tests tersedia untuk fitur berisiko.
