import { toast } from "react-hot-toast";

export function handleConvexError(error: unknown) {
  console.error("Convex operation failed:", error);
  
  // Extract error message from various error types
  let message = "An error occurred";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  // Show error toast to user
  toast.error(message);
}
