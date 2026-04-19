import riderArt from '../../assets/boknoy-rider.svg'

export function AdminBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${riderArt})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/88 via-indigo-950/82 to-violet-950/90 backdrop-blur-[1px]"
        aria-hidden
      />
    </>
  )
}
