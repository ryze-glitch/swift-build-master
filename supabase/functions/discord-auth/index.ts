import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Whitelist of authorized Discord users from operatori_reparto.json
const AUTHORIZED_USERS = {
  // Dirigenza (Admin)
  "_frascones_": { role: "admin", discordId: "817121576217870348", name: "Tonino Frasca" },
  "dxrk.ryze": { role: "admin", discordId: "1387684968536477756", name: "Gabriel Martinelli" },
  "0_matte_0": { role: "admin", discordId: "814941325916241930", name: "Matteo Rossi" },
  "estensione": { role: "admin", discordId: "796078170176487454", name: "Simone Sottaceto" },
  "fastweb.mvp": { role: "admin", discordId: "1249738701081153658", name: "Simone Brighella" },
  "kekkozalone89": { role: "admin", discordId: "1062981395644948550", name: "Franco Costa" },
  "ghostfede": { role: "admin", discordId: "1336335921968058399", name: "Francesco Vanni" },
  
  // Operatori (User)
  "gavonet": { role: "user", discordId: "732317078559653909", name: "Diego Bianchi" },
  "marcucx": { role: "user", discordId: "732317078559653909", name: "Marco Alessis" },
  // Add more users as needed from the JSON
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[DISCORD-AUTH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Discord auth request started");

    const { code } = await req.json();
    if (!code) {
      throw new Error("No authorization code provided");
    }

    const clientId = Deno.env.get("DISCORD_CLIENT_ID");
    const clientSecret = Deno.env.get("DISCORD_CLIENT_SECRET");
    const redirectUri = `${req.headers.get("origin")}/auth`;

    if (!clientId || !clientSecret) {
      throw new Error("Discord credentials not configured");
    }

    logStep("Exchanging code for Discord token");

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    logStep("Token received", { hasToken: !!tokenData.access_token });

    // Get Discord user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get Discord user info");
    }

    const discordUser = await userResponse.json();
    const discordTag = `${discordUser.username}`;
    const discordId = discordUser.id;
    logStep("Discord user retrieved", { discordTag, discordId });

    // Check if user is authorized
    const authorizedUser = AUTHORIZED_USERS[discordTag as keyof typeof AUTHORIZED_USERS];
    if (!authorizedUser) {
      logStep("Unauthorized user attempted login", { discordTag, discordId });
      return new Response(
        JSON.stringify({ error: "Non sei autorizzato ad accedere a questa applicazione." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    logStep("User authorized", { discordTag, role: authorizedUser.role });

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create or update user in Supabase Auth
    const email = `${discordId}@discord.uopi.local`;
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : null;

    // Check if user exists
    const { data: existingUsers } = await supabaseClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(
      (u) => u.email === email || u.user_metadata?.discord_id === discordId
    );

    let userId: string;

    if (existingUser) {
      logStep("Updating existing user", { userId: existingUser.id });
      userId = existingUser.id;

      // Update user metadata
      await supabaseClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          discord_id: discordId,
          discord_tag: discordTag,
          discord_avatar_url: avatarUrl,
          full_name: authorizedUser.name,
        },
      });
    } else {
      logStep("Creating new user");
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          discord_id: discordId,
          discord_tag: discordTag,
          discord_avatar_url: avatarUrl,
          full_name: authorizedUser.name,
        },
      });

      if (createError || !newUser.user) {
        throw new Error(`Failed to create user: ${createError?.message}`);
      }

      userId = newUser.user.id;
      logStep("User created", { userId });
    }

    // Update profile
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .upsert({
        id: userId,
        email,
        full_name: authorizedUser.name,
        discord_id: discordId,
        discord_tag: discordTag,
        discord_avatar_url: avatarUrl,
      });

    if (profileError) {
      logStep("Profile update error", { error: profileError.message });
    }

    // Update or insert role
    const { error: roleError } = await supabaseClient
      .from("user_roles")
      .upsert({
        user_id: userId,
        role: authorizedUser.role,
        discord_id: discordId,
        discord_tag: discordTag,
      });

    if (roleError) {
      logStep("Role update error", { error: roleError.message });
    }

    // Generate session token
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (sessionError || !sessionData) {
      throw new Error(`Failed to generate session: ${sessionError?.message}`);
    }

    logStep("Session generated successfully");

    return new Response(
      JSON.stringify({
        access_token: sessionData.properties.hashed_token,
        user: {
          id: userId,
          email,
          discord_id: discordId,
          discord_tag: discordTag,
          role: authorizedUser.role,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
