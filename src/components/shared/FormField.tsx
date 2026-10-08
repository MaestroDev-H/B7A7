"use client";

import * as React from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import {
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BaseFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// 1. Text Field
export function FormTextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  type = "text",
  disabled,
}: BaseFieldProps<TFieldValues, TName> & { type?: string }) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 2. Number Field (automatically casts string input to number)
export function FormNumberField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  min,
  max,
  step,
  disabled,
}: BaseFieldProps<TFieldValues, TName> & {
  min?: number;
  max?: number;
  step?: number | string;
}) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type="number"
              min={min}
              max={max}
              step={step}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === "" ? "" : Number(val));
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 3. Textarea Field
export function FormTextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  rows = 3,
  disabled,
}: BaseFieldProps<TFieldValues, TName> & { rows?: number }) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 4. Select Field
export interface SelectOption {
  label: string;
  value: string;
}

export function FormSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  placeholder = "Select an option",
  options,
  className,
  disabled,
}: BaseFieldProps<TFieldValues, TName> & { options: SelectOption[] }) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
            onValueChange={(val) => field.onChange(val)}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 5. Date Field (input type date)
export function FormDateField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  min,
  max,
  className,
  disabled,
}: BaseFieldProps<TFieldValues, TName> & { min?: string; max?: string }) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type="date"
              min={min}
              max={max}
              disabled={disabled}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 6. Checkbox Group Field
export function FormCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  options,
  className,
  disabled,
}: BaseFieldProps<TFieldValues, TName> & { options: SelectOption[] }) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => {
        const valueList: string[] = Array.isArray(field.value) ? field.value : [];
        return (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {options.map((option) => {
                const checked = valueList.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-2.5 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors",
                      checked
                        ? "bg-primary/5 border-primary/40 text-foreground font-medium"
                        : "bg-card border-border/70 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(isChecked) => {
                        if (isChecked) {
                          field.onChange([...valueList, option.value]);
                        } else {
                          field.onChange(valueList.filter((v) => v !== option.value));
                        }
                      }}
                    />
                    <span className="text-xs sm:text-sm">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// 7. Tag Input Field (with predefined suggestion pills + custom input)
export function FormTagInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  description,
  suggestions = [],
  placeholder = "Add a tag and press Enter...",
  className,
  disabled,
}: BaseFieldProps<TFieldValues, TName> & { suggestions?: string[] }) {
  const { field } = useController({ control, name });
  const [inputValue, setInputValue] = React.useState("");
  const tags: string[] = Array.isArray(field.value) ? field.value : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      field.onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    field.onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            disabled={!inputValue.trim() || disabled}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="pl-2.5 pr-1.5 py-1 text-xs font-normal gap-1 bg-primary/10 text-primary border border-primary/20"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => {
                const isSelected = tags.includes(sug.toLowerCase());
                return (
                  <button
                    key={sug}
                    type="button"
                    disabled={isSelected || disabled}
                    onClick={() => addTag(sug)}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs transition-colors border",
                      isSelected
                        ? "bg-muted text-muted-foreground/50 border-transparent cursor-not-allowed"
                        : "bg-card text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                    )}
                  >
                    + {sug}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
