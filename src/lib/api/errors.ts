export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public status: number;
  public errors: FieldError[];
  public code?: string;

  constructor(
    message: string,
    status = 500,
    errors: FieldError[] = [],
    code?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}
