
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('tng', 'card', 'fpx')),
  nickname text NOT NULL DEFAULT '',
  detail text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment methods"
  ON public.payment_methods FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payment methods"
  ON public.payment_methods FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payment methods"
  ON public.payment_methods FOR DELETE TO authenticated
  USING (user_id = auth.uid());
