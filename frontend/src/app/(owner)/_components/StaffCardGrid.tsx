// src/app/(owner)/_components/StaffCardGrid.tsx
"use client";

import type { OwnerStaffMember } from "@/lib/types";
import { StaffCard } from "./StaffCard";

interface StaffCardGridProps {
  staff: OwnerStaffMember[];
}

export function StaffCardGrid({ staff }: StaffCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {staff.length > 0 ? (
        staff.map((member, index) => {
          // prefer a real ID; fallback to index-based stable key if missing
          const key =
            member.id !== undefined && member.id !== null
              ? String(member.id)
              : `staff-${member.name ?? "unknown"}-${index}`;

          return (
            // key must be on this wrapper — the grid's immediate child
            <div key={key} className="w-full">
              <StaffCard member={member} />
            </div>
          );
        })
      ) : (
        <p className="text-center text-muted-foreground col-span-full">
          No staff members found.
        </p>
      )}
    </div>
  );
}
