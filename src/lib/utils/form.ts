import { type UseFormReturn, type FieldValues, type Path } from "react-hook-form";
import { ApiError } from "@/lib/api/errors";

/**
 * Maps backend validation errors (errors[].field and errors[].message) onto React Hook Form fields.
 */
export function applyServerErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown
): void {
  if (!(error instanceof ApiError)) {
    return;
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    for (const err of error.errors) {
      if (err.field && err.message) {
        form.setError(err.field as Path<TFieldValues>, {
          type: "server",
          message: err.message,
        });
      }
    }
  }
}
