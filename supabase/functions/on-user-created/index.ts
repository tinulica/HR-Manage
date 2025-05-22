// @deno-types="jsr:@supabase/functions-js/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

Deno.serve(async (req) => {
  try {
    const event = await req.json();

    if (event.type !== "user.created") {
      return new Response("Ignored", { status: 200 });
    }

    const { id: userId, username, email_addresses } = event.data;
    const displayName =
      username ?? email_addresses?.[0]?.email_address ?? "Nouă Organizație";

    const clerkApiKey = Deno.env.get("CLERK_SECRET_KEY");
    if (!clerkApiKey) {
      console.error("❌ Missing Clerk API key");
      return new Response("Server misconfiguration", { status: 500 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnV2aG5wcnpydGRiaXp6aWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxNzU2OCwiZXhwIjoyMDYyODkzNTY4fQ.T8V5dTnPp7T3yvLBJIk_vwGSSOClJnxRPag13GbYTbU")!
    );

    // 1. Create a Clerk organization
    const response = await fetch("https://api.clerk.dev/v1/organizations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: displayName,
        created_by: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Failed to create Clerk org:", error);
      return new Response("Clerk org creation failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
