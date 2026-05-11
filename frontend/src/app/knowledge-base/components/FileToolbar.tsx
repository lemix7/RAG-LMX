"use client";

import { Badge } from "@/ui/components/Badge";
import { TextField } from "@/ui/components/TextField";
import { FeatherFilter, FeatherSearch } from "@subframe/core";
import type { FilterType } from "./utils";
import { FILTER_TYPES } from "./utils";

interface FileToolbarProps {
  search: string;
  filter: FilterType;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FilterType) => void;
}

export function FileToolbar({ search, filter, onSearchChange, onFilterChange }: FileToolbarProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-3 mobile:flex-col mobile:flex-nowrap mobile:items-start">
      <TextField
        className="h-auto w-72 flex-none mobile:w-full"
        variant="filled"
        label=""
        helpText=""
        icon={<FeatherSearch />}
      >
        <TextField.Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </TextField>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TYPES.map((t) => (
          <Badge
            key={t}
            variant={filter === t ? "brand" : "neutral"}
            icon={filter === t ? <FeatherFilter /> : undefined}
            onClick={() => onFilterChange(t)}
            className="cursor-pointer"
          >
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}
