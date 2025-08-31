import * as React from "react";
import { Chip as MChip } from "@mui/material";

export type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

export default function Chip({
  label,
  color = "default",
  size = "small",
  onDelete,
}: {
  label: React.ReactNode;
  color?: ChipColor;
  size?: "small" | "medium";
  onDelete?: () => void;
}) {
  return <MChip label={label} color={color as any} size={size} onDelete={onDelete} />;
}
