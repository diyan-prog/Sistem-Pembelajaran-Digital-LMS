

export const Logo = ({ size = 44 }: { size?: number }) => (
  <span className="rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ width: size, height: size }}>
    <img src={`${import.meta.env.BASE_URL}SMK_Negeri_2_Indramayu.png`} alt="Logo SMKN 2 Indramayu" className="w-[85%] h-[85%] object-contain" />
  </span>
)
