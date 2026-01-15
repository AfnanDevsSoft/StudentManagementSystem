import React from "react";
import { cn } from "../../lib/utils";

interface OnlineStatusProps {
  status: "online" | "away" | "busy" | "offline";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  status,
  size = "md",
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  };

  const statusLabels = {
    online: "Online",
    away: "Away",
    busy: "Busy",
    offline: "Offline",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          statusColors[status]
        )}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
      )}
    </div>
  );
};
