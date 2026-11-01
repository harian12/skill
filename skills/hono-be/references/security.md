# Backend Security Reference

## Threat modeling
Identifikasi aset, aktor, trust boundary, entry point, abuse case, dan dampak kebocoran/perubahan data.

## Authentication
- Hash password menggunakan algoritma password hashing yang sesuai.
- Validasi JWT issuer, audience, expiry, not-before, dan algoritma.
- Rotasi refresh token dan deteksi reuse.
- Definisikan logout/revocation semantics.
- Jangan samakan cache miss dengan dependency unavailable.

## Authorization
- AuthN tidak sama dengan AuthZ.
- Periksa permission per action dan resource.
- Terapkan ownership/tenant filter di query.
- Cegah IDOR dan mass assignment.
- Jangan percaya role/userId dari body.

## Input & output
- Validasi semua input.
- Batasi ukuran body, pagination, upload, dan parameter.
- Encode output sesuai konteks.
- Jangan expose stack trace, SQL, secret, atau internal vendor detail.

## Abuse prevention
- Rate limit sesuai identitas dan endpoint.
- Proteksi brute force, enumeration, replay, SSRF, path traversal, injection.
- Terapkan least privilege.
- Masking PII/secret di log.
- Gunakan secure headers dan cookie flags sesuai aplikasi.

## Failure policy
Jangan bypass kontrol keamanan ketika Redis, identity provider, atau authorization dependency gagal. Pilih fail-closed untuk operasi sensitif kecuali ada desain alternatif yang aman.
