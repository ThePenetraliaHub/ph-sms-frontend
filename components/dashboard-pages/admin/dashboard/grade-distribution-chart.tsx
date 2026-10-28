"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/ui/input-field";
import { SelectItem } from "@/components/ui/select";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Button } from "@/components/ui/button";

interface GradeDistributionChartProps {
  className?: string;
}

const chartData = [
  { grade: "A - Grade", percentage: 70 },
  { grade: "B - Grade", percentage: 45 },
  { grade: "C - Grade", percentage: 65 },
  { grade: "D - Grade", percentage: 25 },
  { grade: "E - Grade", percentage: 10 },
  { grade: "F - Grade", percentage: 5 },
];

const colors = [
  "#14b8a6", // teal
  "#f97316", // orange
  "#a855f7", // purple
  "#3b82f6", // blue
  "#ef4444", // red
  "#9ca3af", // gray
];

const chartConfig = {
  percentage: {
    label: "Percentage",
    color: "#8884d8",
  },
} satisfies ChartConfig;

const classOptions = [
  { value: "all", label: "All Classes" },
  { value: "jss-1", label: "JSS 1" },
  { value: "jss-2", label: "JSS 2" },
  { value: "jss-3", label: "JSS 3" },
  { value: "ss-1", label: "SS 1" },
  { value: "ss-2", label: "SS 2" },
  { value: "ss-3", label: "SS 3" },
];

export function GradeDistributionChart({
  className,
}: GradeDistributionChartProps) {
  const [selectedClass, setSelectedClass] = useState("all");

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Grade Distribution
        </CardTitle>
        <div>
          <SelectField
            label=""
            value={selectedClass}
            onValueChange={setSelectedClass}
            placeholder="All Classes"
          >
            {classOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectField>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        <ChartContainer
          config={chartConfig}
          className="flex-1 w-full min-h-[400px]"
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="grade"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: "Percentage",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <Link href="/admin/students" className="w-full">
          <Button variant={"outline"} className="w-full">View Student's Page</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
