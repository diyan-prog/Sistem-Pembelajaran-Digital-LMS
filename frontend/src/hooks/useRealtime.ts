import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtime<T extends { id: any }>(
  table: string,
  onUpdate: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          onUpdateRef.current(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, filter]);
}
