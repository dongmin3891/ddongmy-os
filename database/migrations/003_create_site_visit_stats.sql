BEGIN;

CREATE TABLE public.site_visit_stats (
  visit_date DATE PRIMARY KEY,
  visits BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  finalized_at TIMESTAMPTZ NULL,
  CONSTRAINT site_visit_stats_visits_nonnegative CHECK (visits >= 0)
);

COMMENT ON TABLE public.site_visit_stats IS
  'Daily Cloudflare visit snapshots; visit_date is based on Asia/Seoul';
COMMENT ON COLUMN public.site_visit_stats.visit_date IS
  'Calendar date in Asia/Seoul represented by this snapshot';
COMMENT ON COLUMN public.site_visit_stats.visits IS
  'Cloudflare visits observed for the calendar date';
COMMENT ON COLUMN public.site_visit_stats.observed_at IS
  'Time when the Cloudflare visits value was observed';
COMMENT ON COLUMN public.site_visit_stats.finalized_at IS
  'Time when the completed calendar date was finalized; null while provisional';

GRANT SELECT, INSERT, UPDATE
ON TABLE public.site_visit_stats
TO ddongmy_app;

INSERT INTO public.schema_migrations (version, description)
VALUES ('003', 'create daily site visit snapshots');

COMMIT;
