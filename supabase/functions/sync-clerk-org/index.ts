// @deno-types="jsr:@supabase/functions-js/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

Deno.serve(async (req) => {
  const event = await req.json();

  if (event.type !== "organization.created") {
    return new Response("Ignored", { status: 200 });
  }

  const { id, name } = event.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnV2aG5wcnpydGRiaXp6aWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxNzU2OCwiZXhwIjoyMDYyODkzNTY4fQ.T8V5dTnPp7T3yvLBJIk_vwGSSOClJnxRPag13GbYTbU")!
  );

  const { error } = await supabase
    .from("organizations")
    .insert([{ id, name }]);

  if (error) {
    console.error("❌ Failed to insert organization:", error);
    return new Response("Insert failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
