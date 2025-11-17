import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthNotification {
  discord_tag: string;
  event_type: 'login' | 'logout';
  timestamp: string;
  user_name?: string;
  qualification?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_AUTH');
    if (!webhookUrl) {
      throw new Error('DISCORD_WEBHOOK_AUTH not configured');
    }

    const { discord_tag, event_type, user_name, qualification }: AuthNotification = await req.json();

    const color = event_type === 'login' ? 0x22C55E : 0xEF4444; // Green for login, Red for logout
    const emoji = event_type === 'login' ? '🟢' : '🔴';
    const action = event_type === 'login' ? 'Accesso Effettuato' : 'Uscita Effettuata';

    const embed = {
      title: `${emoji} ${action}`,
      color: color,
      fields: [
        {
          name: '👤 Operatore',
          value: user_name || discord_tag,
          inline: true
        },
        {
          name: '🎖️ Qualifica',
          value: qualification || 'N/A',
          inline: true
        },
        {
          name: '🔖 Discord',
          value: discord_tag,
          inline: true
        },
        {
          name: '⏰ Orario',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: false
        }
      ],
      footer: {
        text: 'Dashboard U.O.P.I. - Sistema di Tracciamento Accessi'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in notify-discord-auth:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
