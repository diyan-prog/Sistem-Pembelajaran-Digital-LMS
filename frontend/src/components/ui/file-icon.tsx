import { FileText, Image as ImageIcon, PlayCircle } from 'lucide-react'

export const FileIcon = ({ t, size = 20 }: { t: string; size?: number }) => t === 'dokumen' ? <FileText size={size} /> : t === 'gambar' ? <ImageIcon size={size} /> : <PlayCircle size={size} />
export const fileTone = (t: string) => t === 'dokumen' ? 'bg-blue-100 text-accent' : t === 'gambar' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-danger'
