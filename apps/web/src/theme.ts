import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f5f5f5",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },
    MuiSnackbar: {
      defaultProps: {
        autoHideDuration: 5000,
        anchorOrigin: { horizontal: "center", vertical: "bottom" },
      },
    },
  },
});
