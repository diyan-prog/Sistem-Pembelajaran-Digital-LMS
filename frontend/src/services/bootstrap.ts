import { requestGo } from './api-go'
import { setSnapshot, type Snapshot } from '@/lib/store'

// Satu permintaan bootstrap dipakai bersama; permintaan baru menunggu yang sedang jalan.
let inflight: Promise<Snapshot> | null = null

export const loadAkademik = async (force = false): Promise<Snapshot> => {
  if (inflight && !force) return inflight
  inflight = requestGo<Partial<Snapshot>>('/akademik/bootstrap')
    .then((data) => {
      setSnapshot(data)
      return data as Snapshot
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

export const resetAkademik = () => {
  inflight = null
}
