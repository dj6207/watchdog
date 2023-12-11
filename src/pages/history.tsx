import React from "react";
import { UsagePieChart } from "../features/charts";

export const History: React.FC = () => {
    return (
      <UsagePieChart realTime={false} />
    );
}