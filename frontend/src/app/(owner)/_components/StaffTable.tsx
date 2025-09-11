"use client";

import { Trash2 } from "lucide-react";
import type { OwnerStaffMember } from "@/lib/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// 1. CREATE A DEDICATED COMPONENT FOR THE ROW LOGIC
// Accepts rowKey so we can also apply the same stable key on the actual TableRow element.
function StaffTableRow({
  member,
  rowKey,
}: {
  member: OwnerStaffMember;
  rowKey?: string;
}) {
  return (
    // Setting key here as well (on the actual TableRow) helps if the table wrapper
    // clones/inspects children. The primary list key is still set by the parent
    // when mapping <StaffTableRow key={...} ... />.
    <TableRow key={rowKey}>
      <TableCell className="font-medium">{member.name}</TableCell>
      <TableCell>{member.contact_info || "N/A"}</TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* 2. ADD 'cursor-pointer' CLASS FOR THE CURSOR CHANGE */}
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete {member.name}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Feature Not Available</AlertDialogTitle>
              <AlertDialogDescription>
                Delete functionality will be added in a future step.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

interface StaffTableProps {
  staff: OwnerStaffMember[];
}

export function StaffTable({ staff }: StaffTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No staff members found.
              </TableCell>
            </TableRow>
          ) : (
            // 3. MAP OVER THE DATA AND RENDER THE NEW COMPONENT WITH A STABLE KEY
            staff.map((member, index) => {
              const key =
                member.id !== undefined && member.id !== null
                  ? String(member.id)
                  : `staff-${member.name ?? "unknown"}-${index}`;

              return <StaffTableRow key={key} rowKey={key} member={member} />;
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
