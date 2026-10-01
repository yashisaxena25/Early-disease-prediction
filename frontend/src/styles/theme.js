import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#f44336" },
    background: { default: "#f9f9f9" }
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h2: { fontWeight: 600, color: "#1976d2" },
    body1: { fontSize: "1rem", lineHeight: 1.6 }
  }
});
export default theme;
