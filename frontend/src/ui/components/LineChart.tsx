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
        "#6e56cf",
        "#d6cdfc",
        "#5842b9",
        "#b9aaf6",
        "#443296",
        "#9380e4",
      ]}
      {...otherProps}
    />
  );
});

export const LineChart = LineChartRoot;
