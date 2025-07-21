import { Typography } from "@mui/material";

export default function EmptyState() {
  return (
    <Typography variant="body1" className="text-gray-600 mt-4">
      No tenants found for your account.
    </Typography>
  );
}
