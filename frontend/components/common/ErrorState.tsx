import React from "react";
import { EmptyState } from "./EmptyState";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      title="Something went wrong"
      message={message ?? "Please try again."}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
}
