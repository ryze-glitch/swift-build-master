import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShiftNotification {
  action: 'created' | 'activated' | 'deactivated' | 'completed';
  shift_name: string;
  module_type?: string;
  created_by_name?: string;
  personnel?: string[];
  start_time?: string;
  end_time?: string;
  activation_time?: string;
  deactivation_time?: string;
  coordinator?: string;
  vehicle_used?: string;
  intervention_type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_SHIFTS');
    if (!webhookUrl) {
      throw new Error('DISCORD_WEBHOOK_SHIFTS not configured');
    }

    const notification: ShiftNotification = await req.json();

    let color = 0x3B82F6; // Blue default
    let emoji = '📋';
    let title = 'Nuovo Turno';

    switch (notification.action) {
      case 'created':
        color = 0x3B82F6;
        emoji = '📋';
        title = 'Nuovo Turno Creato';
        break;
      case 'activated':
        color = 0x22C55E;
        emoji = '✅';
        title = 'Turno Attivato';
        break;
      case 'deactivated':
        color = 0xF59E0B;
        emoji = '⏸️';
        title = 'Turno Disattivato';
        break;
      case 'completed':
        color = 0x8B5CF6;
        emoji = '✔️';
        title = 'Turno Completato';
        break;
    }

    const fields: any[] = [
      {
        name: '📌 Turno',
        value: notification.shift_name,
        inline: true
      }
    ];

    if (notification.module_type) {
      const moduleNames: { [key: string]: string } = {
        'patrol-activation': '🚨 Attivazione Pattuglia',
        'patrol-deactivation': '🔴 Disattivazione Pattuglia',
        'heist-activation': '💰 Attivazione Rapina',
        'heist-deactivation': '🛑 Disattivazione Rapina'
      };
      fields.push({
        name: '🎯 Modulo',
        value: moduleNames[notification.module_type] || notification.module_type,
        inline: true
      });
    }

    if (notification.created_by_name) {
      fields.push({
        name: '👤 Creato da',
        value: notification.created_by_name,
        inline: true
      });
    }

    if (notification.coordinator) {
      fields.push({
        name: '👮 Coordinatore',
        value: notification.coordinator,
        inline: true
      });
    }

    if (notification.vehicle_used) {
      fields.push({
        name: '🚗 Veicolo',
        value: notification.vehicle_used,
        inline: true
      });
    }

    if (notification.intervention_type) {
      fields.push({
        name: '🎭 Tipo Intervento',
        value: notification.intervention_type,
        inline: true
      });
    }

    if (notification.personnel && notification.personnel.length > 0) {
      fields.push({
        name: `👥 Personale (${notification.personnel.length})`,
        value: notification.personnel.join('\n'),
        inline: false
      });
    }

    if (notification.start_time) {
      fields.push({
        name: '🕐 Inizio',
        value: new Date(notification.start_time).toLocaleString('it-IT'),
        inline: true
      });
    }

    if (notification.activation_time) {
      fields.push({
        name: '✅ Attivazione',
        value: notification.activation_time,
        inline: true
      });
    }

    if (notification.deactivation_time) {
      fields.push({
        name: '⏸️ Disattivazione',
        value: notification.deactivation_time,
        inline: true
      });
    }

    if (notification.end_time) {
      fields.push({
        name: '🕐 Fine',
        value: new Date(notification.end_time).toLocaleString('it-IT'),
        inline: true
      });
    }

    const embed = {
      title: `${emoji} ${title}`,
      color: color,
      fields: fields,
      footer: {
        text: 'Dashboard U.O.P.I. - Sistema Gestione Turni'
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
    console.error('Error in notify-discord-shift:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
