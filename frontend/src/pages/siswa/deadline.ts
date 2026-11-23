
import { fmtBatas } from '@/mocks'

export const deadlineOf = (iso: string) => fmtBatas(iso).replace(/(\d{2})\.(\d{2})$/, '$1.$2')
export const shortBatas = (iso: string) => `Batas: ${deadlineOf(iso)}`
