// src/app/(owner)/_components/StaffCard.tsx
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StaffCardProps {
  member: OwnerStaffMember;
}

export function StaffCard({ member }: StaffCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg">{member.name}</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* ADD 'cursor-pointer' CLASS HERE AS WELL */}
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
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Contact Info
          </span>
          <p className="text-base">{member.contact_info || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
