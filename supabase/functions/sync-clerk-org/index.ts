// @deno-types="jsr:@supabase/functions-js/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

Deno.serve(async (req) => {
  try {
    const event = await req.json();

    if (event.type !== "organization.created") {
      return new Response("Ignored", { status: 200 });
    }

    const { id, name } = event.data;
    if (!id || !name) {
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
      .from("organizations")
      .insert([{ id, name }]);

    if (error) {
      console.error("❌ Failed to insert organization:", error);
      return new Response("Insert failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
