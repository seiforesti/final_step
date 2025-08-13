// Databricks-style Sample Data Tab (custom design, no libraries)
import React from "react";

const theme = {
  bg: "#f7f7f8",
  card: "#fff",
  border: "#e0e0e0",
  accent: "#0072e5",
  text: "#222",
  textSecondary: "#666",
  shadow: "0 2px 12px #0001",
};

const SampleDataTab: React.FC = () => {
  return (
    <div
      style={{
        minHeight: 520,
        background: theme.bg,
        borderRadius: 14,
        boxShadow: theme.shadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "48px 0 0 0",
      }}
    >
      <div
        style={{
          background: theme.card,
          borderRadius: 12,
          boxShadow: theme.shadow,
          padding: "32px 36px 28px 36px",
          minWidth: 340,
          maxWidth: 520,
          margin: "0 auto",
          border: `1.5px solid ${theme.border}`,
        }}
      >
        <h2
          style={{
            fontSize: "1.35rem",
            fontWeight: 700,
            marginBottom: 18,
            color: theme.text,
          }}
        >
          Sample Data (Databricks-style UI)
        </h2>
        {/* Sample data widgets will go here */}
      </div>
    </div>
  );
};

export default SampleDataTab;
