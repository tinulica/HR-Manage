// invite-employee/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Set up Edge runtime
serve(async (req) => {
  try {
    const { email, organization_id } = await req.json();

    if (!email || !organization_id) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnV2aG5wcnpydGRiaXp6aWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxNzU2OCwiZXhwIjoyMDYyODkzNTY4fQ.T8V5dTnPp7T3yvLBJIk_vwGSSOClJnxRPag13GbYTbU")!
    );

    // Get the current user invoking this request
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "") ?? "";

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const invited_by = user.id;

    // Insert into invites
    const { error: insertError } = await supabase
      .from("invites")
      .insert([{ email, organization_id, invited_by }]);

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
    });
  }
});
