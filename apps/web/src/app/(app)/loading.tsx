/**
 * Globales Loading-UI für alle (app)-Routen.
 * Wird während React Suspense-Übergängen bei Server-Komponenten gezeigt.
 */
export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-end gap-1 h-8">
          <div className="w-1.5 h-8 bg-cb-yellow rounded-sm animate-[pulse_1s_ease-in-out_0s_infinite]" />
          <div className="w-1.5 h-5 bg-cb-yellow rounded-sm animate-[pulse_1s_ease-in-out_0.15s_infinite] opacity-80" />
          <div className="w-1.5 h-7 bg-cb-yellow rounded-sm animate-[pulse_1s_ease-in-out_0.3s_infinite] opacity-90" />
        </div>
        <span className="text-xs text-cb-gray-400 tracking-widest uppercase">Laden</span>
      </div>
    </div>
  );
}
