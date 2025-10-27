// src/components/ui/Pill.tsx
import type { Status } from "../../types";

interface PillProps {
  status: Status;
}

export const Pill = ({ status }: PillProps) => {
  const statusColors: Record<Status, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${statusColors[status]}`}
    >
      {status}
    </span>
  );
};