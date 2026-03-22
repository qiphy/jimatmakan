import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const demoUsers = [
    {
      email: "vendor@demo.com",
      password: "demo123456",
      user_metadata: {
        full_name: "Ahmad bin Ismail",
        phone: "+60123456789",
        role: "vendor",
        business_name: "Ahmad's Nasi Lemak",
      },
    },
    {
      email: "student@demo.com",
      password: "demo123456",
      user_metadata: {
        full_name: "Siti Nurhaliza",
        phone: "+60198765432",
        role: "user",
      },
    },
    {
      email: "compost@demo.com",
      password: "demo123456",
      user_metadata: {
        full_name: "GreenCycle Sdn Bhd",
        phone: "+60112233445",
        role: "composter",
        business_name: "GreenCycle Composting",
      },
    },
  ];

  const results = [];

  for (const user of demoUsers) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.user_metadata,
    });
    results.push({ email: user.email, success: !error, error: error?.message });
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
