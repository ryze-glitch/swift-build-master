import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOnlineStatus = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users-presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = new Set<string>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              users.add(presence.user_id);
            }
          });
        });
        
        setOnlineUsers(users);
        console.log('Online users updated:', users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        newPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers(prev => new Set([...prev, presence.user_id]));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        leftPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(presence.user_id);
              return newSet;
            });
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Auto-refresh presence every 30 seconds
    const refreshInterval = setInterval(async () => {
      if (channel.state === 'joined') {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { onlineUsers, isOnline: (userId: string) => onlineUsers.has(userId) };
};