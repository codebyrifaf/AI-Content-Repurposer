"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card } from "@/components/ui/Card";
import type { ChartSeries, PlanDistribution } from "@/lib/admin/types";

type ChartCardProps = {
  title: string;
  series: ChartSeries;
  color: string;
};

function LineChart({ title, series, color }: ChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: series.labels,
        datasets: [
          {
            data: series.values,
            borderColor: color,
            backgroundColor: "transparent",
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "rgba(148,163,184,0.8)", maxTicksLimit: 6 },
            grid: { color: "rgba(148,163,184,0.08)" },
          },
          y: {
            ticks: { color: "rgba(148,163,184,0.8)", maxTicksLimit: 4 },
            grid: { color: "rgba(148,163,184,0.08)" },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [series, color]);

  return (
    <Card className="h-64 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">{title}</p>
      <div className="h-44">
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
}

type PlanChartProps = {
  distribution: PlanDistribution;
};

function DonutChart({ distribution }: PlanChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: distribution.labels,
        datasets: [
          {
            data: distribution.values,
            backgroundColor: ["rgba(148,163,184,0.6)", "rgba(106,215,255,0.7)"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "rgba(148,163,184,0.8)" },
            position: "bottom",
          },
        },
      },
    });

    return () => chart.destroy();
  }, [distribution]);

  return (
    <Card className="h-64 space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">
        Plan distribution
      </p>
      <div className="h-44">
        <canvas ref={canvasRef} />
      </div>
    </Card>
  );
}

type AdminChartsProps = {
  generations: ChartSeries;
  signups: ChartSeries;
  planDistribution: PlanDistribution;
};

export function AdminCharts({
  generations,
  signups,
  planDistribution,
}: AdminChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <LineChart title="Generations (14 days)" series={generations} color="#6ad7ff" />
      <LineChart title="Signups (14 days)" series={signups} color="#6affc9" />
      <DonutChart distribution={planDistribution} />
    </div>
  );
}
