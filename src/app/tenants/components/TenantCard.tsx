"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";

type Props = {
  group: string; // tenant_name
  status: string; // tenant_status
  onClick: () => void;
};

export default function TenantCard({ group, status, onClick }: Props) {
  const isDisabled = status === "inactive" || status === "flagged_to_delete";

  let statusText = "";

  if (status === "flagged_to_delete") {
    statusText = "DELETE";
  } else {
    statusText = status.toUpperCase(); // Fallback in case of unknown status
  }

  return (
    <Card
      variant="outlined"
      onClick={() => {
        if (!isDisabled) onClick();
      }}
      sx={{
        width: "100%",
        height: "100%",
        borderColor: isDisabled ? "#BDBDBD" : "#E0E0E0",
        cursor: isDisabled ? "not-allowed" : "pointer",
        pointerEvents: isDisabled ? "none" : "auto",
        opacity: isDisabled ? 0.5 : 1,
        filter: isDisabled ? "grayscale(80%)" : "none",
        borderRadius: 3,
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: isDisabled ? undefined : "#FF9800",
          boxShadow: isDisabled
            ? undefined
            : "0 6px 15px rgba(255, 152, 0, 0.45)",
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 1.5,
          height: "100%", // Fill height to push spacing
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
            wordBreak: "break-word",
            width: "100%",
            pb: 0.5,
          }}
          title={group}
        >
          {group}
        </Typography>

        <Box
          sx={{
            bgcolor: status === "inactive" ? "#9E9E9E" : "#FF7043",
            color: "#fff",
            px: 2,
            py: 0.5,
            borderRadius: "16px",
            fontSize: { xs: 11, sm: 12 },
            fontWeight: "bold",
            textTransform: "uppercase",
            userSelect: "none",
            minWidth: 100,
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {statusText}
        </Box>
      </CardContent>
    </Card>
  );
}