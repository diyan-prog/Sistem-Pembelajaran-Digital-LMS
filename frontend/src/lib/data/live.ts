// Tampilan array "hidup" atas data turunan snapshot.
//
// Komponen lama membaca data sebagai array (`tugas.filter(...)`, `bankSoal.map(...)`).
// Proksi ini membuat pembacaan tersebut tetap valid tanpa menyalin data: setiap
// akses properti menyelaraskan isi target dengan hasil turunan terbaru.
//
// Target proksi HARUS array yang sama dengan yang dikembalikan handler. Kalau
// handler mengembalikan array lain, `length` (properti non-configurable pada
// target) melanggar invariant proksi dan memicu TypeError saat runtime.

export function live<T>(get: () => T[]): T[] {
  const target: T[] = []
  let last: T[] | null = null

  const sync = (): T[] => {
    const next = get()
    if (next === last) return target
    last = next
    // `length` pada target bersifat non-configurable, jadi isi diubah di tempat
    // (bukan mengganti objek target) agar invariant proksi tetap terpenuhi.
    target.length = 0
    for (let i = 0; i < next.length; i += 1) {
      target[i] = next[i]
    }
    return target
  }

  return new Proxy(target, {
    get(_t, prop) {
      const arr = sync()
      const value = Reflect.get(arr, prop, arr)
      // Method array diikat ke target agar `arr.map(...)` membaca isi yang sudah
      // tersinkron, bukan `this` proksi yang bisa memicu sinkronisasi berulang.
      return typeof value === 'function' ? value.bind(arr) : value
    },
    has(_t, prop) {
      return Reflect.has(sync(), prop)
    },
    ownKeys() {
      return Reflect.ownKeys(sync())
    },
    getOwnPropertyDescriptor(_t, prop) {
      return Reflect.getOwnPropertyDescriptor(sync(), prop)
    },
    // Data snapshot bersifat read-only bagi pemanggil. Tulis dilewatkan ke target
    // (supaya operasi internal seperti `sort` tidak melempar) dan akan hilang pada
    // sinkronisasi berikutnya. Trap wajib mengembalikan true di mode strict.
    set(_t, prop, value) {
      return Reflect.set(sync(), prop, value)
    },
    deleteProperty(_t, prop) {
      return Reflect.deleteProperty(sync(), prop)
    },
    defineProperty(_t, prop, descriptor) {
      return Reflect.defineProperty(sync(), prop, descriptor)
    },
  })
}
