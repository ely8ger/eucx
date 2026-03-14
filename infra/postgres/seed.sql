-- ─── Seed-Daten für Entwicklung ───────────────────────────────────────────────
-- NUR für lokale Entwicklung, NIEMALS in Produktion ausführen

-- Admin-Organisation
INSERT INTO organizations (id, name, tax_id, country, city, is_verified)
VALUES ('00000000-0000-0000-0000-000000000001', 'EUCX Platform GmbH', 'DE123456789', 'DE', 'Berlin', TRUE);

-- Test-Verkäufer
INSERT INTO organizations (id, name, tax_id, country, city, is_verified)
VALUES ('00000000-0000-0000-0000-000000000002', 'Stahlwerk Polska Sp. z o.o.', 'PL9876543210', 'PL', 'Warszawa', TRUE);

-- Test-Käufer
INSERT INTO organizations (id, name, tax_id, country, city, is_verified)
VALUES ('00000000-0000-0000-0000-000000000003', 'Bauträger GmbH', 'DE987654321', 'DE', 'Hamburg', TRUE);

-- Admin-User (Passwort: admin123 — NUR für lokale Entwicklung)
-- bcrypt hash von "admin123" mit cost=14
INSERT INTO users (id, organization_id, email, password_hash, role, status)
VALUES (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'admin@eucx.eu',
    '$2a$14$K5h7hMFLf.g0tWYlxKt6A.X5e3BYgfGsyKEV4Rqh6JLaTpOkk1Yim', -- admin123
    'admin',
    'active'
);

-- Test-Verkäufer-User
INSERT INTO users (id, organization_id, email, password_hash, role, status)
VALUES (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'seller@test.eucx.eu',
    '$2a$14$K5h7hMFLf.g0tWYlxKt6A.X5e3BYgfGsyKEV4Rqh6JLaTpOkk1Yim', -- admin123
    'seller',
    'active'
);

-- Test-Käufer-User
INSERT INTO users (id, organization_id, email, password_hash, role, status)
VALUES (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'buyer@test.eucx.eu',
    '$2a$14$K5h7hMFLf.g0tWYlxKt6A.X5e3BYgfGsyKEV4Rqh6JLaTpOkk1Yim', -- admin123
    'buyer',
    'active'
);
