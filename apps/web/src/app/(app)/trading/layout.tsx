import TradingHoursBar from "@/components/TradingHoursBar";

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Negative Margin bricht aus dem (app)/layout-Container (padding 32px 40px) aus */}
      <div style={{ margin: "-32px -40px 0", position: "relative" }}>
        <TradingHoursBar />
      </div>
      <div style={{ paddingTop: 32 }}>
        {children}
      </div>
    </>
  );
}
