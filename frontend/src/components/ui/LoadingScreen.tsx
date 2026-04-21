import Image from "next/image";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden font-sans select-none">

      {/* Dark Fantasy Background Image */}
      <Image
        src="/images/screen/loading_bg.png"
        alt="Dark Fantasy Night Sky"
        fill
        priority
        className="object-cover object-center opacity-60 pointer-events-none"
      />

      {/* Vignette Overlay for Moody Atmosphere */}
      <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-black/40 to-black pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">

        {/* Title: The Blood Moon Rises */}
        <div className="mb-20 flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <span className="text-4xl">🌕</span>
            <h1 className="text-4xl md:text-5xl font-serif text-[#FF8A00] tracking-[0.3em] font-bold drop-shadow-[0_0_20px_rgba(255,138,0,0.6)] uppercase text-center">
              The Blood Moon Rises
            </h1>
            <span className="text-4xl">🌕</span>
          </div>
          <h2 className="text-xl font-serif tracking-[0.5em] text-gray-400 mt-2">
            Werewolf Online
          </h2>
        </div>

        {/* Realistic Campfire Animation Container */}
        <div className="relative w-[120px] h-[160px] mt-10">

          {/* Base Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] h-[80px] bg-[#FF4500] blur-2xl rounded-full opacity-60 mix-blend-screen" />

          {/* Flame Particles */}
          <div className="absolute inset-0 overflow-visible" style={{ filter: 'blur(3px) contrast(1.2)' }}>
            {Array.from({ length: 40 }).map((_, i) => {
              // Pseudo-random values based on index to prevent hydration mismatch
              const rand1 = (Math.sin(i * 12.345) + 1) / 2; // 0 to 1
              const rand2 = (Math.cos(i * 45.678) + 1) / 2; // 0 to 1
              const rand3 = (Math.sin(i * 78.91) + 1) / 2; // 0 to 1

              const isYellow = rand1 > 0.5;
              const size = 20 + rand2 * 40; // 20px to 60px
              const xOffset = (rand3 - 0.5) * 40; // -20px to 20px
              const animDuration = 0.5 + rand1 * 0.8; // 0.5s to 1.3s
              const animDelay = -(rand2 * 2);

              return (
                <div
                  key={i}
                  className="absolute bottom-[-10px] left-1/2 mix-blend-screen"
                  style={{
                    width: `${size.toFixed(2)}px`,
                    height: `${size.toFixed(2)}px`,
                    backgroundColor: isYellow ? '#FFCC00' : '#FF4500',
                    borderRadius: '0 50% 50% 50%',
                    transform: 'translate(-50%, 0) rotate(45deg)',
                    animation: `flame-rise ${animDuration.toFixed(2)}s infinite ease-in ${animDelay.toFixed(2)}s`,
                    '--flame-x': `${xOffset.toFixed(2)}px`,
                    '--flame-rot': `${(45 + (rand3 - 0.5) * 40).toFixed(2)}deg`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>

          {/* Floating Sparks */}
          {Array.from({ length: 15 }).map((_, i) => {
            const rand1 = (Math.sin(i * 99.123) + 1) / 2;
            const rand2 = (Math.cos(i * 33.456) + 1) / 2;
            const sparkDelay = -(rand2 * 3);
            return (
              <div
                key={`spark-${i}`}
                className="absolute bottom-[20px] left-1/2 w-1.5 h-1.5 bg-[#ffeeaa] rounded-full shadow-[0_0_8px_#ffdd88]"
                style={{
                  animation: `spark-rise ${(1 + rand1 * 2).toFixed(2)}s infinite ease-out ${sparkDelay.toFixed(2)}s`,
                  '--spark-x': `${((rand1 - 0.5) * 80).toFixed(2)}px`
                } as React.CSSProperties}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}
