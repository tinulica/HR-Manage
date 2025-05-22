import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

Deno.serve(async (req) => {
  const event = await req.json();

  if (event.type !== "organizationMembership.created") {
    return new Response("Ignored", { status: 200 });
  }

  const { organization_id, public_user_data, role } = event.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnV2aG5wcnpydGRiaXp6aWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxNzU2OCwiZXhwIjoyMDYyODkzNTY4fQ.T8V5dTnPp7T3yvLBJIk_vwGSSOClJnxRPag13GbYTbU")!
  );

  const user_id = public_user_data.user_id;

  const { error } = await supabase
    .from("organization_memberships")
    .insert([{ organization_id, user_id, role }]);

  if (error) {
    console.error("❌ Failed to insert membership:", error);
    return new Response("Insert failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
