export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dm-bg flex items-center justify-center p-4 relative overflow-hidden">

      {/* Subtiler Gold-Ambient-Glow oben-mitte */}
      <div
        className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(251,184,9,0.055) 0%, transparent 70%)" }}
      />

      {/* Sehr subtile Vignette an den Ecken */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)" }}
      />

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
