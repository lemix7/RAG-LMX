interface MobileHeaderProps {
  onMenuToggle: () => void;
  messageCount: number;
}

export function MobileHeader({ onMenuToggle, messageCount }: MobileHeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#e0e1e6] shrink-0">
      <button
        onClick={onMenuToggle}
        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#60646c] hover:bg-[#f0f0f3] transition-colors"
        aria-label="Open menu"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M2 4h12M2 8h12M2 12h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <h1 className="text-[14px] font-[700] text-[#000000] tracking-[-0.3px]">RAG-LMX</h1>
        {messageCount > 0 && (
          <span className="text-[10px] font-[500] text-[#b0b4ba]">{messageCount} msgs</span>
        )}
      </div>

      {/* Spacer to balance the layout */}
      <div className="w-8" />
    </header>
  );
}
