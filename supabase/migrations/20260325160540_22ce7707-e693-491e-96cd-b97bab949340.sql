
ALTER TABLE public.profiles ADD COLUMN location text DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, business_name, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IN ('vendor', 'user', 'composter') 
      THEN (NEW.raw_user_meta_data->>'role')::app_role 
      ELSE 'user'::app_role 
    END,
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'location'
  );
  RETURN NEW;
END;
$function$;
