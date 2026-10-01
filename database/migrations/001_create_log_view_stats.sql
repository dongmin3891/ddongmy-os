BEGIN;

CREATE TABLE public.log_view_stats (
  post_id TEXT NOT NULL,
  post_slug VARCHAR(120) NOT NULL,
  view_date DATE NOT NULL,
  views BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, view_date),
  CONSTRAINT log_view_stats_views_nonnegative CHECK (views >= 0)
);

COMMENT ON TABLE public.log_view_stats IS
  'Daily development-log view counts; view_date is based on Asia/Seoul';
COMMENT ON COLUMN public.log_view_stats.post_id IS
  'Immutable Notion page ID used as the development-log identity';
COMMENT ON COLUMN public.log_view_stats.post_slug IS
  'Current development-log slug stored in Notion';
COMMENT ON COLUMN public.log_view_stats.view_date IS
  'Calendar date in Asia/Seoul';

GRANT SELECT, INSERT, UPDATE
ON TABLE public.log_view_stats
TO ddongmy_app;

INSERT INTO public.schema_migrations (version, description)
VALUES ('001', 'create daily development-log view statistics');

COMMIT;
