
"use client";
import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: ChartData<"doughnut">;
}

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  return <Doughnut data={data} />;
};

export default DonutChart;
