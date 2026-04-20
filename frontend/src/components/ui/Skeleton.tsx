interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className, width = "100%", height = "1rem" }: SkeletonProps) {
  return (
    <div
      className={`
        bg-[#1F2937] rounded-2xl overflow-hidden relative
        ${className}
      `}
      style={{ width, height }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent animate-[shimmer_1.5s_infinite]"
        style={{
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
