"use client";

import * as React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Users,
  SlidersHorizontal,
  Home,
  Heart,
  Plus,
  X,
  MapPin,
  Check,
  UserCheck,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { MoneyText } from "@/components/shared/MoneyText";
import { RoomCard } from "@/components/features/rooms/RoomCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useRoommatePreference,
  useUpdateRoommatePreference,
  useRoommateMatches,
  useMatchingRooms,
} from "@/hooks/use-roommates";
import { formatDate, toISODateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RoommateMatch } from "@/lib/api/types";

const SUGGESTED_TAGS = [
  "Non-smoker",
  "Early riser",
  "Night owl",
  "Pet friendly",
  "Student",
  "Working professional",
  "Vegetarian",
  "Clean & tidy",
  "Quiet hours",
  "Social & friendly",
  "Fitness enthusiast",
  "Work from home",
];

const preferenceSchema = z
  .object({
    budgetMin: z.number().min(0, "Minimum budget must be at least 0"),
    budgetMax: z.number().min(1, "Maximum budget must be greater than 0"),
    preferredCity: z.string().optional(),
    preferredArea: z.string().optional(),
    genderPreference: z.string().optional(),
    lifestyleTags: z.array(z.string()).min(1, "Select at least 1 lifestyle tag"),
    moveInFrom: z.string().optional(),
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

type PreferenceFormData = z.infer<typeof preferenceSchema>;

export function RoommatesView() {
  const [activeTab, setActiveTab] = useState("preferences");
  const [tagInput, setTagInput] = useState("");

  const { data: preference } = useRoommatePreference();
  const hasPreference = !!preference;

  // Only enable matches & rooms queries if user has preferences set
  const { data: matches = [], isLoading: loadingMatches } = useRoommateMatches(hasPreference);
  const { data: matchingRooms = [], isLoading: loadingRooms } = useMatchingRooms(hasPreference);

  const updateMutation = useUpdateRoommatePreference();

  const form = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      budgetMin: 500,
      budgetMax: 2000,
      preferredCity: "",
      preferredArea: "",
      genderPreference: "ANY",
      lifestyleTags: ["Non-smoker", "Clean & tidy"],
      moveInFrom: "",
      bio: "",
    },
    values: preference
      ? {
          budgetMin: Number(preference.budgetMin) || 500,
          budgetMax: Number(preference.budgetMax) || 2000,
          preferredCity: preference.preferredCity || "",
          preferredArea: preference.preferredArea || "",
          genderPreference: preference.genderPreference || "ANY",
          lifestyleTags: preference.lifestyleTags || [],
          moveInFrom: preference.moveInFrom ? preference.moveInFrom.slice(0, 10) : "",
          bio: preference.bio || "",
        }
      : undefined,
  });

  const selectedTags = form.watch("lifestyleTags") || [];

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      form.setValue("lifestyleTags", [...selectedTags, trimmed], { shouldValidate: true });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "lifestyleTags",
      selectedTags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: PreferenceFormData) => {
    await updateMutation.mutateAsync({
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      preferredCity: data.preferredCity || undefined,
      preferredArea: data.preferredArea || undefined,
      genderPreference: data.genderPreference || undefined,
      lifestyleTags: data.lifestyleTags,
      moveInFrom: data.moveInFrom ? toISODateTime(data.moveInFrom) : undefined,
      bio: data.bio || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roommate Matching"
        description="Find compatible roommates based on living habits, budget ranges, and location preferences."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full">
          <TabsTrigger value="preferences" className="text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-xs">
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Matches {matches.length > 0 && `(${matches.length})`}
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-xs">
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Rooms for Me {matchingRooms.length > 0 && `(${matchingRooms.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Preferences Form */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Living Preferences</CardTitle>
              <CardDescription>
                Define your budget range, target locations, and lifestyle habits so our algorithm can match you with compatible peers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="roommate-pref-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Budget Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Monthly Budget Range ($)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Minimum Budget</span>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        placeholder="e.g. 500"
                        {...form.register("budgetMin", { valueAsNumber: true })}
                      />
                      {form.formState.errors.budgetMin && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.budgetMin.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Maximum Budget</span>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        placeholder="e.g. 1500"
                        {...form.register("budgetMax", { valueAsNumber: true })}
                      />
                      {form.formState.errors.budgetMax && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.budgetMax.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Preferred City</label>
                    <Input placeholder="e.g. Dhaka" {...form.register("preferredCity")} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Preferred Area / Neighborhood</label>
                    <Input placeholder="e.g. Dhanmondi, Gulshan" {...form.register("preferredArea")} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Gender Preference</label>
                    <Controller
                      name="genderPreference"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Any Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY">Any Gender</SelectItem>
                            <SelectItem value="MALE">Male Only</SelectItem>
                            <SelectItem value="FEMALE">Female Only</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Move-in Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Move-in From</label>
                  <Input
                    type="date"
                    className="max-w-xs"
                    {...form.register("moveInFrom")}
                  />
                  <p className="text-xs text-muted-foreground">Target earliest move-in date</p>
                </div>

                {/* Lifestyle Tags Input with suggestions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Lifestyle & Living Habits</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/40 rounded-xl border min-h-[50px]">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 px-2.5 py-1 text-xs bg-background border"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:text-foreground ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}

                    <div className="flex items-center gap-1">
                      <Input
                        type="text"
                        placeholder="Add habit tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag(tagInput);
                          }
                        }}
                        className="h-7 text-xs w-32 border-0 bg-transparent shadow-none focus-visible:ring-0 p-0"
                      />
                      {tagInput && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleAddTag(tagInput)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {form.formState.errors.lifestyleTags && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.lifestyleTags.message}
                    </p>
                  )}

                  {/* Suggestion Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-muted-foreground">Suggested tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => (isSelected ? handleRemoveTag(tag) : handleAddTag(tag))}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                            )}
                          >
                            {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bio / Living Style Description */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">About You & Roommate Expectations</label>
                  <Textarea
                    placeholder="Describe your daily routine, cleanliness standards, work schedule, or hobbies..."
                    rows={3}
                    {...form.register("bio")}
                  />
                  {form.formState.errors.bio && (
                    <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                form="roommate-pref-form"
                disabled={updateMutation.isPending}
                className="shadow-xs"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 2: Matches List */}
        <TabsContent value="matches" className="space-y-6">
          {!hasPreference ? (
            <Card className="p-8 border-dashed">
              <EmptyState
                title="Preferences required for matching"
                description="Set your budget, location, and lifestyle preferences first so our system can calculate compatibility scores with other tenants."
                icon={SlidersHorizontal}
                action={{
                  label: "Set Preferences Now",
                  onClick: () => setActiveTab("preferences"),
                }}
              />
            </Card>
          ) : loadingMatches ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Calculating compatibility matches...
            </div>
          ) : matches.length === 0 ? (
            <Card className="p-8 border-dashed">
              <EmptyState
                title="No roommate matches found yet"
                description="Try broadening your budget range or preferred location to discover more potential roommates."
                icon={Users}
                action={{
                  label: "Adjust Preferences",
                  onClick: () => setActiveTab("preferences"),
                }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match: RoommateMatch) => {
                const scorePercent = Math.min(100, Math.max(0, Math.round(match.matchScore)));
                const isHighMatch = scorePercent >= 80;

                return (
                  <Card key={match.user.id} className="relative overflow-hidden hover:border-primary/40 transition-all">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* User Avatar + Info */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 border text-primary flex items-center justify-center font-bold text-base shrink-0">
                            {match.user.avatar ? (
                              <Image
                                src={match.user.avatar}
                                alt={match.user.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              match.user.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                              {match.user.name}
                              <UserCheck className="w-3.5 h-3.5 text-primary" />
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {match.preference.preferredCity || "Flexible location"}
                            </p>
                          </div>
                        </div>

                        {/* Match Score Circular Ring / Badge */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center font-mono shadow-xs",
                              isHighMatch
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            <span className="text-xs font-bold leading-none">{scorePercent}%</span>
                            <span className="text-[8px] uppercase tracking-wider font-semibold">Match</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {match.preference.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 italic bg-muted/30 p-2.5 rounded-lg border">
                          &ldquo;{match.preference.bio}&rdquo;
                        </p>
                      )}

                      {/* Budget & Target date */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t text-muted-foreground">
                        <span>
                          Budget: <MoneyText amount={match.preference.budgetMin} /> –{" "}
                          <MoneyText amount={match.preference.budgetMax} />
                        </span>
                        {match.preference.moveInFrom && (
                          <span>Move-in: {formatDate(match.preference.moveInFrom)}</span>
                        )}
                      </div>

                      {/* Matching Tags Chips */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-muted-foreground">Matching habits:</span>
                        <div className="flex flex-wrap gap-1">
                          {match.matchingTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="default"
                              className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20"
                            >
                              ✓ {tag}
                            </Badge>
                          ))}
                          {match.preference.lifestyleTags
                            .filter((t) => !match.matchingTags.includes(t))
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 text-muted-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Rooms for Me */}
        <TabsContent value="rooms" className="space-y-6">
          {!hasPreference ? (
            <Card className="p-8 border-dashed">
              <EmptyState
                title="Preferences needed to recommend rooms"
                description="Set your budget and preferred city to see available rooms that match your criteria."
                icon={SlidersHorizontal}
                action={{
                  label: "Configure Preferences",
                  onClick: () => setActiveTab("preferences"),
                }}
              />
            </Card>
          ) : loadingRooms ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Fetching matching rooms...
            </div>
          ) : matchingRooms.length === 0 ? (
            <Card className="p-8 border-dashed">
              <EmptyState
                title="No matching rooms currently available"
                description="There are currently no open rooms within your exact budget or location preference. Explore all published properties or adjust your budget range."
                icon={Home}
                action={{
                  label: "Browse All Properties",
                  href: "/properties",
                }}
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {matchingRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  propertyTitle={room.property?.title || "Property"}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
