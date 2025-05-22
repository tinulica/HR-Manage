import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

Deno.serve(async (req) => {
  try {
    const event = await req.json();

    if (event.type !== "organizationMembership.created") {
      return new Response("Ignored", { status: 200 });
    }

    const { organization_id, public_user_data, role } = event.data;
    const user_id = public_user_data?.user_id;

    if (!organization_id || !user_id || !role) {
      console.error("❌ Missing required fields");
      return new Response("Missing fields", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables");
      return new Response("Server misconfiguration", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("organization_memberships")
      .insert([{ organization_id, user_id, role }]);

    if (error) {
      console.error("❌ Failed to insert membership:", error);
      return new Response("Insert failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
