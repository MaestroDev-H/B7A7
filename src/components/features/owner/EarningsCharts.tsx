"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

interface PropertyOccupancyData {
  propertyName: string;
  totalRooms: number;
  occupiedRooms: number;
}

interface InvoiceBreakdownData {
  name: string;
  value: number;
  color: string;
}

interface EarningsChartsProps {
  occupancyData: PropertyOccupancyData[];
  invoicesData: InvoiceBreakdownData[];
}

export default function EarningsCharts({
  occupancyData,
  invoicesData,
}: EarningsChartsProps) {
  const hasInvoices = invoicesData.some((d) => d.value > 0);
  const hasOccupancy = occupancyData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Occupancy by Property */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Occupancy by Property</CardTitle>
          <CardDescription className="text-xs">
            Comparison of occupied units against total capacity per property.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasOccupancy ? (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              No property data available.
            </div>
          ) : (
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={occupancyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="propertyName"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload as PropertyOccupancyData;
                        return (
                          <div className="bg-popover text-popover-foreground border p-2 rounded-lg shadow-md text-xs space-y-1">
                            <p className="font-semibold">{data.propertyName}</p>
                            <p className="text-emerald-600">
                              Occupied: {data.occupiedRooms} / {data.totalRooms} units
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Bar
                    dataKey="totalRooms"
                    name="Total Units"
                    fill="hsl(var(--muted-foreground) / 0.3)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="occupiedRooms"
                    name="Occupied Units"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Invoices Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Invoices by Payment Status</CardTitle>
          <CardDescription className="text-xs">
            Financial breakdown of collected revenue vs pending/overdue invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasInvoices ? (
            <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
              No invoice records recorded yet.
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoicesData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {invoicesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload as InvoiceBreakdownData;
                        return (
                          <div className="bg-popover text-popover-foreground border p-2 rounded-lg shadow-md text-xs space-y-1">
                            <p className="font-semibold">{data.name}</p>
                            <p className="font-mono">{formatMoney(data.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(val, entry: { payload?: { value?: number } }) => (
                      <span>
                        {val} ({formatMoney(entry.payload?.value || 0)})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
