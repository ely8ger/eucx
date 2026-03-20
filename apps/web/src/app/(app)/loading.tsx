export default function AppLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: "'IBM Plex Sans', Arial, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 32 }}>
          {[32, 20, 28].map((h, i) => (
            <div key={i} style={{
              width: 6, height: h, backgroundColor: "#154194",
              animation: `eucx-pulse 1s ease-in-out ${i * 0.15}s infinite`,
              opacity: i === 1 ? 0.5 : 0.85,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: "#888", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Laden
        </span>
      </div>
      <style>{`
        @keyframes eucx-pulse {
          0%, 100% { transform: scaleY(1); opacity: 0.7; }
          50%       { transform: scaleY(0.5); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
