import type { Source } from "@/lib/types";

interface SourceAttributionProps {
  sources: Source[];
}

export function SourceAttribution({ sources }: SourceAttributionProps) {
  if (!sources || sources.length === 0) return null;

  const unique = Array.from(new Map(sources.map((s) => [`${s.name}:${s.page}`, s])).values());

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      <span className="text-[11px] font-[500] text-[#b0b4ba] self-center mr-0.5">Sources:</span>
      {unique.map((source, i) => (
        <span
          key={`${source.path}:${source.page ?? ""}:${i}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#fafafa] border border-[#e0e1e6] text-[11px] font-[500] text-[#60646c] leading-none"
          title={source.path}
        >
          <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="shrink-0 text-[#b0b4ba]" aria-hidden="true">
            <path d="M1 1.5A.5.5 0 0 1 1.5 1h5L9 3.5V10.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-9Z" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M6 1v3h3" stroke="currentColor" strokeWidth="1"/>
          </svg>
          {source.name}
          {source.page != null && (
            <span className="text-[#b0b4ba] font-[400]">p.{source.page + 1}</span>
          )}
        </span>
      ))}
    </div>
  );
}
