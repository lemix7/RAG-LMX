import {
  FeatherAlertCircle,
  FeatherCheckCircle,
  FeatherFile,
  FeatherLoader,
} from "@subframe/core";

interface StatCardsProps {
  total: number;
  ready: number;
  processing: number;
  errored: number;
}

export function StatCards({ total, ready, processing, errored }: StatCardsProps) {
  return (
    <div className="flex w-full flex-wrap items-start gap-4 mobile:gap-3">
      <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-neutral-border bg-neutral-50 px-4 py-4">
        <span className="text-caption font-caption text-subtext-color">Total Files</span>
        <div className="flex items-center gap-2">
          <span className="text-heading-2 font-heading-2 text-default-font">{total}</span>
          <FeatherFile className="text-body font-body text-subtext-color" />
        </div>
      </div>

      <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-success-200 bg-success-50 px-4 py-4">
        <span className="text-caption font-caption text-subtext-color">Ready</span>
        <div className="flex items-center gap-2">
          <span className="text-heading-2 font-heading-2 text-default-font">{ready}</span>
          <FeatherCheckCircle className="text-body font-body text-success-600" />
        </div>
      </div>

      <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-brand-200 bg-brand-50 px-4 py-4">
        <span className="text-caption font-caption text-subtext-color">Processing</span>
        <div className="flex items-center gap-2">
          <span className="text-heading-2 font-heading-2 text-default-font">{processing}</span>
          <FeatherLoader className="text-body font-body text-brand-700" />
        </div>
      </div>

      <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-error-200 bg-error-50 px-4 py-4">
        <span className="text-caption font-caption text-subtext-color">Error</span>
        <div className="flex items-center gap-2">
          <span className="text-heading-2 font-heading-2 text-default-font">{errored}</span>
          <FeatherAlertCircle className="text-body font-body text-error-600" />
        </div>
      </div>
    </div>
  );
}
