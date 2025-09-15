import { Snackbar, Button, Slide, IconButton, SlideProps } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { forwardRef } from "react";

type SnackbarVariant = "default" | "success" | "error" | "warning" | "info";

type GlobalSnackbarProps = {
  open: boolean;
  message: string;
  autoHideDuration?: number;
  onClose: () => void;
  actionLabel?: string;
  onActionClick?: () => void;
  variant?: SnackbarVariant;
};

// Gmail-like pastel colors
const variantStyles: Record<
  SnackbarVariant,
  { backgroundColor: string; color: string; actionColor: string }
> = {
  default: { backgroundColor: "#e6f4ea", color: "#202124", actionColor: "#FFB74D" },
  success: { backgroundColor: "#e6f4ea", color: "#202124", actionColor: "#188038" },
  error: { backgroundColor: "#fce8e6", color: "#202124", actionColor: "#d93025" },
  warning: { backgroundColor: "#fef7e0", color: "#202124", actionColor: "#b06000" },
  info: { backgroundColor: "#e8f0fe", color: "#202124", actionColor: "#174ea6" },
};

// ✅ Properly typed Slide transition
const SlideDown = forwardRef(function SlideDown(
  props: SlideProps,
  ref: React.Ref<unknown>
) {
  return <Slide {...props} ref={ref} direction="down" />;
});

export default function GlobalSnackbar({
  open,
  message,
  autoHideDuration = 2000,
  onClose,
  actionLabel,
  onActionClick,
  variant = "default",
}: GlobalSnackbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { backgroundColor, color, actionColor } = variantStyles[variant];

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideDown}
      anchorOrigin={{
        vertical: "top",
        horizontal: isMobile ? "center" : "center",
      }}
      ContentProps={{
        sx: {
          backgroundColor,
          color,
          borderRadius: "8px",
          px: 2.5,
          py: 1.5,
          boxShadow: "0px 8px 24px rgba(0,0,0,0.25)",
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          gap: 2,
          backdropFilter: "blur(6px)",
          transition: "all 0.35s ease-in-out",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.95)",
        },
      }}
      message={message}
      action={
        <>
          {actionLabel && (
            <Button
              onClick={onActionClick}
              sx={{
                color: actionColor,
                fontWeight: 600,
                textTransform: "none",
                transition: "all 0.25s ease",
                "&:hover": {
                  color: actionColor,
                  transform: "scale(1.05)",
                },
              }}
            >
              {actionLabel}
            </Button>
          )}
          <IconButton size="small" onClick={onClose} sx={{ color }}>
            <span className="material-symbols-outlined">close</span>
          </IconButton>
        </>
      }
    />
  );
}
