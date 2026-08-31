-- Nico's World aggregate visitor counter (Neon project: square-cherry-41000949).
-- No profile, child activity, IP address, user agent, or other personal data is stored.

CREATE TABLE IF NOT EXISTS public.site_metrics (
  metric text PRIMARY KEY,
  total bigint NOT NULL DEFAULT 0 CHECK (total >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_metrics (metric, total)
VALUES ('unique_browser_visits', 0)
ON CONFLICT (metric) DO NOTHING;

ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_metrics FROM PUBLIC;
REVOKE ALL ON public.site_metrics FROM anonymous;
REVOKE ALL ON public.site_metrics FROM authenticated;

CREATE OR REPLACE FUNCTION public.register_site_visit(count_visit boolean DEFAULT false)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE result bigint;
BEGIN
  IF count_visit THEN
    INSERT INTO public.site_metrics (metric, total, updated_at)
    VALUES ('unique_browser_visits', 1, now())
    ON CONFLICT (metric) DO UPDATE
      SET total = public.site_metrics.total + 1,
          updated_at = now()
    RETURNING total INTO result;
  ELSE
    SELECT total INTO result
    FROM public.site_metrics
    WHERE metric = 'unique_browser_visits';
  END IF;
  RETURN COALESCE(result, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.register_site_visit(boolean) FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO anonymous;
GRANT EXECUTE ON FUNCTION public.register_site_visit(boolean) TO anonymous;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_site_visit(boolean) TO authenticated;
