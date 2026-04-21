export function EmptySlot() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-48 sm:h-52 rounded-xl border-2 border-dashed border-white/10 bg-black/40 backdrop-blur-md shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] transition-all hover:bg-black/50 hover:border-brand-moonlight/30">
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(168,192,214,0.05),transparent_70%)]" />
      <div className="absolute inset-0 rounded-xl pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

      <div className="relative z-10 w-16 h-16 rounded-full border border-dashed border-white/20 mb-4 flex items-center justify-center bg-black/50 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] transition-all group-hover:border-brand-moonlight/40 group-hover:shadow-[0_0_15px_rgba(168,192,214,0.2)]">
        <span className="text-white/20 font-serif text-2xl">?</span>
      </div>

      <p className="relative z-10 text-white/30 text-xs font-serif font-bold tracking-[0.3em] text-center px-4 leading-relaxed uppercase">
        Empty Slot
        <br />
        <span className="text-[10px] font-normal tracking-[0.2em] text-white/20 italic mt-1 block">Awaiting Soul...</span>
      </p>
    </div>
  );
}
