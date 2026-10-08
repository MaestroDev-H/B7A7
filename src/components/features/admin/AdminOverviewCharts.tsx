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
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

interface UsersByRoleData {
  name: string;
  value: number;
  color: string;
}

interface PlatformInventoryData {
  category: string;
  count: number;
}

interface ActivityTimelineData {
  date: string;
  actions: number;
}

interface AdminOverviewChartsProps {
  usersRoleData: UsersByRoleData[];
  inventoryData: PlatformInventoryData[];
  activityData: ActivityTimelineData[];
}

export default function AdminOverviewCharts({
  usersRoleData,
  inventoryData,
  activityData,
}: AdminOverviewChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Users by Role (Donut) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">User Distribution by Role</CardTitle>
            <CardDescription className="text-xs">
              Live breakdown of Tenants, Property Hosts, and System Administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usersRoleData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {usersRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload as UsersByRoleData;
                        return (
                          <div className="bg-popover text-popover-foreground border p-2 rounded-lg shadow-md text-xs space-y-1">
                            <p className="font-semibold">{data.name}</p>
                            <p className="font-mono">{data.value} users</p>
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
                        {val}: {entry.payload?.value || 0}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Platform Inventory (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Platform Resource Inventory</CardTitle>
            <CardDescription className="text-xs">
              Current ecosystem totals across properties, rooms, leases, and pending applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload as PlatformInventoryData;
                        return (
                          <div className="bg-popover text-popover-foreground border p-2 rounded-lg shadow-md text-xs space-y-1">
                            <p className="font-semibold">{data.category}</p>
                            <p className="font-mono">{data.count} units / records</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Total Count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Recent Audit Activity (Area) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Audit Activity Velocity (Recent 100 Logs)</CardTitle>
          <CardDescription className="text-xs">
            System operations, tenant verifications, and property updates grouped by recorded day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">
              No recent audit log activity recorded.
            </div>
          ) : (
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload as ActivityTimelineData;
                        return (
                          <div className="bg-popover text-popover-foreground border p-2 rounded-lg shadow-md text-xs space-y-1">
                            <p className="font-semibold">{data.date}</p>
                            <p className="font-mono">{data.actions} audit operations</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actions"
                    name="Operations"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#activityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
