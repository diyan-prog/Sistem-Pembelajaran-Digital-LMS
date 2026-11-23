export const cn = (...a: (string | false | null | undefined | 0)[]) => a.filter(Boolean).join(' ')
