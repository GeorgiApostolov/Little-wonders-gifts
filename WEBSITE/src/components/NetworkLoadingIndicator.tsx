type NetworkLoadingIndicatorProps = {
  active: boolean;
};

export default function NetworkLoadingIndicator({
  active,
}: NetworkLoadingIndicatorProps) {
  return (
    <div
      className={`fixed left-1/2 top-20 z-[70] -translate-x-1/2 transform transition-all duration-200 ${
        active
          ? "opacity-100 translate-y-0"
          : "pointer-events-none -translate-y-2 opacity-0"
      }`}
      role="status"
      aria-live="polite"
      aria-hidden={!active}
    >
      <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-4 py-2 shadow-lg backdrop-blur-sm">
        <span className="network-loader-spinner" aria-hidden="true" />
        <span className="text-xs font-semibold text-foreground">
          Зареждаме данни...
        </span>
      </div>
    </div>
  );
}
