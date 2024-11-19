const handleApiError = (error: { status: number; error: string; message: string }): string => {
  switch (error.status) {
    case 400:
      return `Bad Request: ${error.message}`;
    case 401:
      return `Unauthorized: ${error.message}`;
    case 403:
      return `Forbidden: ${error.message}`;
    case 404:
      return `Not Found: ${error.message}`;
    case 409:
      return `Conflict: ${error.message}`;
    case 500:
      return `Server Error: ${error.message}`;
    default:
      return `Unknown Error: ${error.message}`;
  }
};
