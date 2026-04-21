export function EmptySlot() {
  return (
    <div className="flex flex-col items-center justify-center w-40 h-56 rounded-lg border-2 border-dashed border-gray-700 bg-black/30 opacity-60">
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 mb-6 flex items-center justify-center">
         <span className="text-gray-600 text-2xl">?</span>
      </div>
      <p className="text-gray-500 text-xs font-bold tracking-widest text-center px-4 leading-relaxed">
        [ EMPTY ]<br/>
        <span className="text-[10px] font-normal">WAITING...</span>
      </p>
    </div>
  );
}
