# Testing Strategy

## Pyramid
- Unit: pure logic, validation, business rules.
- Integration: database, Redis, queue, vendor adapters.
- API/contract: routing, status, schema, auth.
- End-to-end: alur bisnis penting yang melintasi beberapa boundary.

## Test critical cases
- success dan validation failure;
- unauthenticated dan forbidden;
- ownership mismatch;
- duplicate/replayed request;
- dependency timeout/unavailable;
- transaction rollback;
- concurrency;
- pagination boundary;
- migration/backward compatibility.

## Practices
- Isolasi test data dan environment.
- Jangan arahkan test ke production.
- Hindari mock berlebihan untuk perilaku database yang justru perlu diuji nyata.
- Jalankan test relevan, typecheck, lint, build.
- Laporkan command dan hasil aktual.
- Jangan mengklaim coverage yang tidak diukur.
