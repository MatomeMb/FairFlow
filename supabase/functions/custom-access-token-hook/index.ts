import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AuthPayload {
  user_id: string;
  [key: string]: unknown;
}

serve(async (req: Request) => {
  try {
    // Parse the incoming request
    const payload = await req.json() as AuthPayload;
    
    console.log("Webhook payload received:", { user_id: payload.user_id });

    // Only process if we have a user_id
    if (!payload.user_id) {
      return new Response(
        JSON.stringify({ error: "No user_id provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Query the user's role
    const { data: roleData, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", payload.user_id)
      .maybeSingle();

    console.log("Role lookup result:", { error, roleData });

    // Build the response with claims
    const claims = {
      user_role: roleData?.role || "consumer",
    };

    return new Response(JSON.stringify({ claims }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Hook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
