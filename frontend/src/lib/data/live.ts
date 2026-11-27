// Tampilan array "hidup" atas data turunan snapshot.
//
// Komponen lama membaca data sebagai array (`tugas.filter(...)`, `bankSoal.map(...)`).
// Proksi ini membuat pembacaan tersebut tetap valid tanpa menyalin data: setiap
// akses properti membaca ulang hasil turunan yang sudah di-cache per snapshot.
// Re-render dijamin oleh langganan snapshot di App (useStore) dan/atau useData().

export function live<T>(get: () => T[]): T[] {
  const read = () => get()
  return new Proxy([] as T[], {
    get(_target, prop) {
      const arr = read()
      const value = Reflect.get(arr, prop, arr)
      return typeof value === 'function' ? value.bind(arr) : value
    },
    has(_target, prop) {
      return prop in read()
    },
    set() {
      // Data snapshot bersifat read-only; tulis lokal ditolak agar tidak menyesatkan.
      return false
    },
  })
}
