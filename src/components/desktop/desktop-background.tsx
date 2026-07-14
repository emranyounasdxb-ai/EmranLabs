export function DesktopBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#05070d]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(18,164,146,0.16),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(101,78,205,0.13),transparent_36%),linear-gradient(180deg,#11141d_0%,#080b12_52%,#03050a_100%)]" />
      <div className="desktop-grid absolute inset-0 opacity-[0.14]" />
      <div className="desktop-scanline absolute inset-0 opacity-[0.12]" />
      <div className="absolute top-[18%] left-[13%] h-px w-[42vw] rotate-[-16deg] bg-gradient-to-r from-transparent via-[rgba(38,188,168,0.2)] to-transparent" />
      <div className="absolute right-[10%] bottom-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(91,76,183,0.08),transparent_70%)] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,7,0.08),transparent_34%,transparent_76%,rgba(1,3,8,0.12)),linear-gradient(180deg,transparent_58%,rgba(1,3,8,0.34))]" />
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.38)]" />
    </div>
  );
}
