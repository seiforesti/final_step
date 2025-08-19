import { createTheme } from "@fluentui/react";

const AzureDarkTheme = createTheme({
  palette: {
    themePrimary: "#2899f5",
    themeLighterAlt: "#02060a",
    themeLighter: "#061727",
    themeLight: "#0c2947",
    themeTertiary: "#18528e",
    themeSecondary: "#2280d1",
    themeDarkAlt: "#3da0f6",
    themeDark: "#5bb0f7",
    themeDarker: "#8cc8fa",
    neutralLighterAlt: "#2c2c2c",
    neutralLighter: "#252525",
    neutralLight: "#222222",
    neutralQuaternaryAlt: "#1f1f1f",
    neutralQuaternary: "#1c1c1c",
    neutralTertiaryAlt: "#b3b3b3",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#1b1a19",
  },
  fonts: {
    medium: {
      fontSize: "15px",
      fontWeight: 400,
    },
    large: {
      fontSize: "18px",
      fontWeight: 600,
    },
  },
  spacing: {
    s1: "8px",
    m: "16px",
    l1: "24px",
  },
  effects: {
    roundedCorner2: "8px",
  },
});

export default AzureDarkTheme;
