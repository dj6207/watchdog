import React from "react";
import { UsageBarGraph, UsagePieChart } from "../features/charts";

export const Home: React.FC = () => {
    return (
      <>
        <UsagePieChart realTime={true} />
        <UsageBarGraph />
      </>
    );
}