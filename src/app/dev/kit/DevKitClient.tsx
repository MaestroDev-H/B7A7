"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { MoneyText } from "@/components/shared/MoneyText";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ImageFallback } from "@/components/shared/ImageFallback";
import {
  FormTextField,
  FormNumberField,
  FormSelectField,
  FormTagInput,
  FormCheckboxGroup,
} from "@/components/shared/FormField";
import {
  StatGridSkeleton,
  CardGridSkeleton,
  TableSkeleton,
} from "@/components/shared/Skeletons";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Building, Users, CreditCard, Sparkles } from "lucide-react";

interface SampleRow {
  id: string;
  roomNumber: string;
  tenant: string;
  rent: string;
  status: string;
}

const SAMPLE_DATA: SampleRow[] = [
  { id: "1", roomNumber: "Room 101", tenant: "Sarah Jenkins", rent: "1250", status: "OCCUPIED" },
  { id: "2", roomNumber: "Suite A", tenant: "Michael Chang", rent: "1450", status: "AVAILABLE" },
  { id: "3", roomNumber: "Room 204", tenant: "Elena Rostova", rent: "980", status: "UNDER_MAINTENANCE" },
];

export function DevKitClient() {
  const [searchVal, setSearchVal] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      title: "Cozy Sunny Master Room",
      rent: 1200,
      propertyType: "APARTMENT",
      amenities: ["wifi", "laundry"],
      lifestyleTags: ["non-smoker", "early-riser"],
    },
  });

  const columns: ColumnDef<SampleRow>[] = [
    {
      header: "Room",
      cell: (r) => <DoorPlate roomNumber={r.roomNumber} size="sm" />,
    },
    {
      header: "Occupant",
      cell: (r) => <span className="font-medium">{r.tenant}</span>,
    },
    {
      header: "Monthly Rent",
      cell: (r) => <MoneyText amount={r.rent} period="/mo" />,
    },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 space-y-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="h2-display text-foreground">Nestly Design System & UI Kit</h1>
          <p className="text-sm text-muted-foreground">Interactive component preview & token verification</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Page Header Component */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          1. Page Header & Signature DoorPlate
        </h2>
        <PageHeader
          title="Urban Oasis Apartments"
          description="A curated luxury residence in downtown Seattle with private balconies and fast transit access."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Properties", href: "/properties" },
            { label: "Urban Oasis" },
          ]}
          badge={<StatusBadge status="AVAILABLE" />}
          actions={
            <div className="flex items-center gap-2">
              <DoorPlate roomNumber="Room 302" size="md" subtitle="Ensuite" />
              <Button>Apply Now</Button>
            </div>
          }
        />
        <div className="flex items-center gap-4 flex-wrap p-4 rounded-xl bg-card border">
          <DoorPlate roomNumber="101" size="sm" />
          <DoorPlate roomNumber="Suite 204" size="md" subtitle="Private" />
          <DoorPlate roomNumber="Penthouse B" size="lg" subtitle="Master Suite" />
        </div>
      </section>

      {/* Status Badges */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          2. Universal Status Badges (4.5:1 Contrast Guarantee)
        </h2>
        <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-card border">
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="AVAILABLE" />
          <StatusBadge status="PENDING" />
          <StatusBadge status="IN_PROGRESS" />
          <StatusBadge status="PAID" />
          <StatusBadge status="OVERDUE" />
          <StatusBadge status="REJECTED" />
          <StatusBadge status="UNDER_MAINTENANCE" />
          <StatusBadge status="OCCUPIED" />
          <StatusBadge status="URGENT" />
          <StatusBadge status="ADMIN" />
          <StatusBadge status="OWNER" />
          <StatusBadge status="TENANT" />
        </div>
      </section>

      {/* Stat Cards */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          3. Stat Cards & Currency Text
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Properties"
            value="24"
            icon={Building}
            delta={{ value: "4 this month", isPositive: true }}
          />
          <StatCard
            label="Active Tenants"
            value="142"
            icon={Users}
            delta={{ value: "12%", isPositive: true, label: "vs last month" }}
          />
          <StatCard
            label="Monthly Revenue"
            value={<MoneyText amount="48250" />}
            icon={CreditCard}
            delta={{ value: "8.4%", isPositive: true }}
          />
          <StatCard
            label="Pending Invoices"
            value={<MoneyText amount="3200" />}
            icon={Sparkles}
            description="3 overdue payments"
          />
        </div>
      </section>

      {/* Search & DataTable */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          4. Search, Responsive DataTable & Pagination
        </h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SearchInput
            value={searchVal}
            onChange={setSearchVal}
            placeholder="Search room or resident..."
          />
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Test Confirm Dialog
          </Button>
        </div>

        <DataTable data={SAMPLE_DATA} columns={columns} />

        <Pagination
          page={currentPage}
          totalPages={5}
          totalItems={25}
          limit={5}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* Form Field Wrappers */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          5. Form Field Wrappers
        </h2>
        <div className="p-6 rounded-xl bg-card border max-w-2xl">
          <Form {...form}>
            <form className="space-y-4">
              <FormTextField
                control={form.control}
                name="title"
                label="Listing Title"
                placeholder="Enter title"
              />
              <div className="grid grid-cols-2 gap-4">
                <FormNumberField
                  control={form.control}
                  name="rent"
                  label="Monthly Rent ($)"
                />
                <FormSelectField
                  control={form.control}
                  name="propertyType"
                  label="Property Type"
                  options={[
                    { label: "Apartment", value: "APARTMENT" },
                    { label: "Private House", value: "HOUSE" },
                    { label: "Studio", value: "STUDIO" },
                  ]}
                />
              </div>
              <FormCheckboxGroup
                control={form.control}
                name="amenities"
                label="Included Amenities"
                options={[
                  { label: "High-speed WiFi", value: "wifi" },
                  { label: "In-unit Laundry", value: "laundry" },
                  { label: "Private Balcony", value: "balcony" },
                ]}
              />
              <FormTagInput
                control={form.control}
                name="lifestyleTags"
                label="Lifestyle & Roommate Preferences"
                suggestions={["non-smoker", "pet-friendly", "early-riser", "quiet-hours"]}
              />
            </form>
          </Form>
        </div>
      </section>

      {/* Skeletons, EmptyState & Fallback */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          6. Skeletons, Empty State & Image Fallback
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 rounded-xl overflow-hidden border">
            <ImageFallback label="Room 204 Suite" />
          </div>
          <TableSkeleton rows={3} cols={3} />
        </div>
        <EmptyState
          title="No applications yet"
          description="When tenants apply to your rooms, their application requests and profiles will appear here."
          action={{ label: "Explore Listings", href: "/properties" }}
        />
        <CardGridSkeleton count={3} />
        <StatGridSkeleton count={2} />
      </section>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Terminate Tenancy Agreement?"
        description="This action will terminate the active lease and generate any final balance settlement invoices. This cannot be undone."
        confirmLabel="Yes, Terminate"
        variant="destructive"
        onConfirm={async () => {
          await new Promise((res) => setTimeout(res, 1000));
        }}
      />
    </div>
  );
}
