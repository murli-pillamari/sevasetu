import type { ApplicationStatus } from "@prisma/client";
import { statusLabels, statusStyles } from "@/lib/applications/presentation";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
