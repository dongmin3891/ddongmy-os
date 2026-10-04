BEGIN;

CREATE TABLE public.log_view_request_limits (
  requester_hash CHAR(64) PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT log_view_request_limits_count_positive CHECK (request_count > 0)
);

COMMENT ON TABLE public.log_view_request_limits IS
  'Rolling request counters keyed by an HMAC of the requester network address';
COMMENT ON COLUMN public.log_view_request_limits.requester_hash IS
  'HMAC-SHA256 requester identity; never stores the source address';

CREATE TABLE public.log_view_visitors (
  post_id TEXT NOT NULL,
  visitor_hash CHAR(64) NOT NULL,
  last_counted_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (post_id, visitor_hash)
);

COMMENT ON TABLE public.log_view_visitors IS
  'Last accepted view per post and privacy-preserving visitor HMAC';
COMMENT ON COLUMN public.log_view_visitors.visitor_hash IS
  'HMAC-SHA256 of request address and user agent; never stores either raw value';

GRANT SELECT, INSERT, UPDATE
ON TABLE public.log_view_request_limits, public.log_view_visitors
TO ddongmy_app;

INSERT INTO public.schema_migrations (version, description)
VALUES ('002', 'protect development-log view counts');

COMMIT;
