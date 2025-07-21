"use client";

import { Card, CardContent, Typography } from "@mui/material";

type Props = {
  group: string;
  onClick: (groupName: string) => void;
};

export default function TenantCard({ group, onClick }: Props) {
  return (
    <Card
      variant="outlined"
      onClick={() => onClick(group)}
      className="transition duration-200 border hover:shadow-md rounded-xl cursor-pointer"
      sx={{
        height: "100%",
        borderColor: "#E0E0E0",
        "&:hover": { borderColor: "#FF9800" },
        width: "250px",
      }}
    >
      <CardContent>
        <Typography variant="h6" className="font-semibold text-gray-800">
          {group}
        </Typography>
      </CardContent>
    </Card>
  );
}
