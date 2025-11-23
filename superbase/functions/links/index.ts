// Correct import for Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);

    // API pattern → /links or /links/{code}
    const code = segments.length === 1 ? null : segments[1];

    console.log("Request →", req.method, "Code:", code);

    // ----------------------------------------
    // GET /links → List all links
    // ----------------------------------------
    if (req.method === "GET" && !code) {
      const { data, error } = await supabaseClient
        .from("links")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return jsonResponse(data);
    }

    // ----------------------------------------
    // GET /links/:code → Fetch one link
    // ----------------------------------------
    if (req.method === "GET" && code) {
      const { data, error } = await supabaseClient
        .from("links")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error) throw error;

      if (!data) return errorResponse("Link not found", 404);

      return jsonResponse(data);
    }

    // ----------------------------------------
    // POST /links → Create new link
    // ----------------------------------------
    if (req.method === "POST") {
      const body = await req.json();
      const { url: targetUrl, code: customCode } = body;

      if (!targetUrl)
        return errorResponse("URL is required", 400);

      // Validate URL
      try {
        new URL(targetUrl);
      } catch {
        return errorResponse("Invalid URL format", 400);
      }

      let finalCode = customCode;

      // If custom code provided, validate it
      if (customCode) {
        if (!/^[A-Za-z0-9]{6,8}$/.test(customCode))
          return errorResponse(
            "Custom code must be 6–8 alphanumeric characters",
            400
          );

        // Check for existing code
        const { data: existing } = await supabaseClient
          .from("links")
          .select("code")
          .eq("code", customCode)
          .maybeSingle();

        if (existing)
          return errorResponse("Code already exists", 409);
      } else {
        // Auto-generate code with uniqueness check
        finalCode = await generateUniqueCode(supabaseClient);
        if (!finalCode)
          return errorResponse("Failed to generate unique code", 500);
      }

      // Insert into DB
      const { data, error } = await supabaseClient
        .from("links")
        .insert({ code: finalCode, url: targetUrl })
        .select()
        .single();

      if (error) throw error;

      return jsonResponse(data, 201);
    }

    // ----------------------------------------
    // DELETE /links/:code
    // ----------------------------------------
    if (req.method === "DELETE" && code) {
      const { error } = await supabaseClient
        .from("links")
        .delete()
        .eq("code", code);

      if (error) throw error;

      return jsonResponse({ success: true });
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    console.error("Unexpected error:", err);
    return errorResponse("Internal server error", 500);
  }
});

/*************************************************
 * Helpers
 ************************************************/

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Generate a unique 6-char code
async function generateUniqueCode(client: any): Promise<string | null> {
  for (let i = 0; i < 10; i++) {
    const code = randomCode();

    const { data: exists } = await client
      .from("links")
      .select("code")
      .eq("code", code)
      .maybeSingle();

    if (!exists) return code;
  }
  return null;
}

function randomCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 })
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}
