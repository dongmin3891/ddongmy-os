BEGIN;

CREATE TABLE public.schema_migrations (
  version VARCHAR(3) PRIMARY KEY,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.schema_migrations IS
  'Schema migrations applied to the ddongmy database';

INSERT INTO public.schema_migrations (version, description)
VALUES ('000', 'create schema migrations ledger');

COMMIT;
