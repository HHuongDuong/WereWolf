export function EmptySlot() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-48 sm:h-52 rounded-xl border border-[#475768]/30 bg-gradient-to-b from-[#111A24]/62 via-[#0D141D]/70 to-[#070B12]/78 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,rgba(168,192,214,0.18),transparent_58%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-35" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-linen.png')" }} />

      <div className="relative z-10 w-14 h-14 rounded-full border border-dashed border-[#6A7A8A]/55 mb-4 flex items-center justify-center shadow-[0_0_12px_rgba(168,192,214,0.12)]">
        <span className="text-[#70839A]/80 text-2xl">?</span>
      </div>

      <p className="relative z-10 text-[#8595A7]/75 text-xs font-bold tracking-[0.22em] text-center px-4 leading-relaxed">
        [ EMPTY ]
        <br />
        <span className="text-[10px] font-normal tracking-[0.18em] text-[#6A7988]">WAITING...</span>
      </p>
    </div>
  );
}
