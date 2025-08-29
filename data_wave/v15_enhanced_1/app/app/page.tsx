"use client";

import { ErrorBoundary } from "../../components/error-boundary/ErrorBoundary";
import { RacineMainManagerSPA } from "../../components/racine-main-manager";

export default function AppSPA() {
  return (
    <ErrorBoundary>
      <RacineMainManagerSPA />
    </ErrorBoundary>
  );
}
