import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Penangkap galat render: tanpa ini, kegagalan satu halaman (mis. lazy chunk
 * gagal dimuat) membuat seluruh aplikasi berhenti dengan fallback loader terus
 * tampil. Pengguna diberi tombol muat ulang, bukan layar kosong.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-bold">Terjadi kesalahan saat menampilkan halaman</h1>
        <p className="text-sm text-muted max-w-md break-words">{error.message}</p>
        <div className="flex gap-3">
          <button className="h-10 px-4 rounded-xl border border-line font-semibold hover:bg-gray-50" onClick={() => this.setState({ error: null })}>Coba lagi</button>
          <button className="h-10 px-4 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark" onClick={() => window.location.reload()}>Muat ulang</button>
        </div>
      </div>
    )
  }
}
