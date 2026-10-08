"use client";

import * as React from "react";
import { Server, Shield, Terminal, Globe, Cpu, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileSettings } from "@/components/features/profile/ProfileSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminSettingsViewProps {
  apiHostname?: string;
  appVersion?: string;
}

export function AdminSettingsView({
  apiHostname = "api.nestly.local",
  appVersion = "1.0.0",
}: AdminSettingsViewProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Admin Settings & System Information"
        description="Update your administrator credentials, personal settings, and inspect system telemetry."
      />

      {/* Reusable Profile & Security Settings */}
      <ProfileSettings />

      {/* About this Console Card */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            About System &amp; Console Environment
          </CardTitle>
          <CardDescription className="text-xs">
            Operational infrastructure telemetry, connected API gateway, and build version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>API Gateway Host</span>
              </div>
              <p className="font-mono font-bold text-foreground truncate" title={apiHostname}>
                {apiHostname}
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span>Nestly App Version</span>
              </div>
              <p className="font-mono font-bold text-foreground">
                v{appVersion} (Production Next.js 16)
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Role Enforcement</span>
              </div>
              <p className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strict Proxy Guard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
