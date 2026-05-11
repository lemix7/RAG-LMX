"use client";

import { IconButton } from "@/ui/components/IconButton";
import {
  FeatherBrainCircuit,
  FeatherMenu,
  FeatherMessageSquare,
  FeatherMoreHorizontal,
} from "@subframe/core";

interface ChatTopBarProps {
  onMenuOpen: () => void;
}

export function ChatTopBar({ onMenuOpen }: ChatTopBarProps) {
  return (
    <div className="flex h-14 w-full flex-none items-center justify-between  px-6 mobile:px-4">
      <div className="flex items-center gap-3">
        <IconButton
          className="hidden mobile:flex"
          variant="neutral-tertiary"
          icon={<FeatherMenu />}
          onClick={onMenuOpen}
        />
        <div className="hidden items-center gap-2 mobile:flex">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-brand-600">
            <FeatherBrainCircuit className="text-caption-bold font-caption-bold text-neutral-950" />
          </div>
        </div>
        <FeatherMessageSquare className="text-heading-3 font-heading-3 text-brand-700 mobile:hidden" />
        <span className="text-heading-2 font-heading-2 text-default-font">Document Assistant</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-caption font-caption text-success-500 rounded-md border border-solid border-success-400 bg-success-50 px-2 py-1">
          GPT-4 Turbo
        </span>
        <IconButton
          variant="neutral-tertiary"
          icon={<FeatherMoreHorizontal />}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}
