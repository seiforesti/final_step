import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClientProvider } from "@tanstack/react-query";
import { StyledToastContainer } from "./components/common/Toast";
import { secureQueryClient } from "./lib/secure-query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={secureQueryClient}>
      <CssBaseline />
      <StyledToastContainer />
      {children}
    </QueryClientProvider>
  );
}
