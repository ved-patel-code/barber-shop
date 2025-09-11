// src/app/(manager)/manager/[shop_id]/staff/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

import { getBarbersByShopId } from "@/lib/api";
import type { Barber } from "@/lib/types";

// Import our new dialog component
import { AddStaffDialog } from "../../_components/AddStaffDialog";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StaffPage() {
  const params = useParams();
  const shopId = params.shop_id as string;

  const [staff, setStaff] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddStaffDialogOpen, setAddStaffDialogOpen] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!shopId) return;
    try {
      const staffList = await getBarbersByShopId(shopId);
      setStaff(staffList);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Could not load staff members.");
    }
  }, [shopId]);

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      await fetchStaff();
      setIsLoading(false);
    };
    initialFetch();
  }, [fetchStaff]);

  // This function is the callback for a successful submission
  const handleAddStaffSuccess = () => {
    setAddStaffDialogOpen(false); // Close the dialog
    fetchStaff(); // Refresh the staff list
  };

  const handleDeleteStaff = (barberId: string) => {
    console.log("Deleting staff member:", barberId);
    toast.info("Delete functionality will be added in a future step.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Staff Management
          </h1>
          <p className="text-muted-foreground">
            Add, view, and manage your shop&apos;s staff members.
          </p>
        </div>
        <Button onClick={() => setAddStaffDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff Table */}
      <div className="border rounded-lg w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[40%]">Contact Info</TableHead>
              <TableHead className="text-right w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : staff.length > 0 ? (
              staff.map((barber) => (
                <TableRow key={barber.id}>
                  <TableCell className="font-medium">{barber.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {barber.contact_info || "Not provided"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStaff(barber.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Render the fully functional Add Staff Dialog */}
      <AddStaffDialog
        isOpen={isAddStaffDialogOpen}
        onOpenChange={setAddStaffDialogOpen}
        shopId={shopId}
        onSuccess={handleAddStaffSuccess}
      />
    </div>
  );
}
