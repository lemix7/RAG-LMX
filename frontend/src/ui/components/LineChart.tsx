// @subframe/sync-disable
"use client";
/*
 * Documentation:
 * Line Chart — https://app.subframe.com/056d18e2a2e9/library?component=Line+Chart_22944dd2-3cdd-42fd-913a-1b11a3c1d16d
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface LineChartRootProps
  extends React.ComponentProps<typeof SubframeCore.LineChart> {
  className?: string;
}

const LineChartRoot = React.forwardRef<
  React.ElementRef<typeof SubframeCore.LineChart>,
  LineChartRootProps
>(function LineChartRoot(
  { className, ...otherProps }: LineChartRootProps,
  ref
) {
  return (
    <SubframeCore.LineChart
      className={SubframeUtils.twClassNames("h-80 w-full", className)}
      ref={ref}
      colors={[
        "#2563eb",
        "#60a5fa",
        "#1d4ed8",
        "#93c5fd",
        "#1e40af",
        "#3b82f6",
      ]}
      {...otherProps}
    />
  );
});

export const LineChart = LineChartRoot;
