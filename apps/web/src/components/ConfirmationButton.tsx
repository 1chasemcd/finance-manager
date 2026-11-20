import { Check, Clear } from "@mui/icons-material";
import { Box, Button, ButtonGroup } from "@mui/material";
import { useState } from "react";

interface ConfirmationButtonProps {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const HALF_ANIMATION_DURATION = (200).toString();

export function ConfirmationButton({ children, onClick }: ConfirmationButtonProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const toggleConfirmVisible = () => {
    setConfirmVisible((v) => !v);
  };

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <ButtonGroup
        color="error"
        sx={{
          position: "absolute",
          right: 0,
          width: "50%",
          opacity: confirmVisible ? 1 : 0,
          visibility: confirmVisible ? "visible" : "hidden",
          transition: confirmVisible
            ? `opacity ${HALF_ANIMATION_DURATION}ms ease ${HALF_ANIMATION_DURATION}ms`
            : `opacity ${HALF_ANIMATION_DURATION}ms ease, visibility 0s linear ${HALF_ANIMATION_DURATION}ms`,
        }}
      >
        <span />
        <Button>
          <Clear />
        </Button>
      </ButtonGroup>
      <Button variant="outlined" color="error" onClick={toggleConfirmVisible}>
        <Box
          component="span"
          sx={{
            opacity: confirmVisible ? 0 : 1,
            transition: confirmVisible
              ? `opacity ${HALF_ANIMATION_DURATION}ms ease`
              : `opacity ${HALF_ANIMATION_DURATION}ms ease ${HALF_ANIMATION_DURATION}ms`,
          }}
        >
          {children}
        </Box>
      </Button>
      <ButtonGroup
        color="error"
        sx={{
          position: "absolute",
          width: "50%",
          opacity: confirmVisible ? 1 : 0,
          visibility: confirmVisible ? "visible" : "hidden",
          transition: confirmVisible
            ? `opacity ${HALF_ANIMATION_DURATION}ms ease ${HALF_ANIMATION_DURATION}ms`
            : `opacity ${HALF_ANIMATION_DURATION}ms ease, visibility 0s linear ${HALF_ANIMATION_DURATION}ms`,
        }}
      >
        <Button variant="contained" onClick={onClick}>
          <Check />
        </Button>
        <span></span>
      </ButtonGroup>
    </Box>
  );
}
