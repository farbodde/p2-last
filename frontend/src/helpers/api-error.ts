export const getApiErrorList = (
  error: unknown,
  fallbackMessage: string,
): string[] => {
  if (error && typeof error === "object" && !Array.isArray(error)) {
    const errors = Object.values(error).flatMap((value) =>
      Array.isArray(value)
        ? value
        : typeof value === "string"
          ? [value]
          : [],
    );

    if (errors.length > 0) {
      return errors;
    }

    if ("message" in error && typeof error.message === "string") {
      return [error.message];
    }

    if ("detail" in error && typeof error.detail === "string") {
      return [error.detail];
    }
  }

  if (typeof error === "string" && error.trim()) {
    return [error];
  }

  if (error instanceof Error && error.message.trim()) {
    return [error.message];
  }

  return [fallbackMessage];
};
