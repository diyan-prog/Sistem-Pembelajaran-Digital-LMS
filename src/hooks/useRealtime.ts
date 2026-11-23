import { useEffect } from 'react';
import { supabase } from '@/store';
import { RealtimePostgresPayload } from '@supabase/supabase-js';

export function useRealtime<T extends { id: any }>(
  table: string,
  onUpdate: (payload: RealtimePostgresPayload<T>) => void,
  filter?: string
) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          onUpdate(payload as RealtimePostgresPayload<T>);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onUpdate]);
}
