// src/app/(manager)/manager/_components/AddStaffDialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { addStaff } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Validation schema for the form
const staffSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." }),
  contact_info: z
    .string()
    .min(5, { message: "Please provide valid contact info." }),
});
type StaffFormData = z.infer<typeof staffSchema>;

interface AddStaffDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shopId: string;
  onSuccess: () => void; // Callback to refresh the staff list
}

export function AddStaffDialog({
  isOpen,
  onOpenChange,
  shopId,
  onSuccess,
}: AddStaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
  });

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      reset(); // Reset form fields when dialog is closed
    }
    onOpenChange(open);
  };

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      await addStaff(shopId, data);
      toast.success("Staff member added successfully!");
      onSuccess(); // Trigger the callback to refresh and close
    } catch (error) {
      toast.error("Failed to add staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && (
                <p className="col-span-4 text-right text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_info" className="text-right">
                Contact Info
              </Label>
              <Input
                id="contact_info"
                {...register("contact_info")}
                className="col-span-3"
              />
              {errors.contact_info && (
                <p className="col-span-4 text-right text-sm text-red-500">
                  {errors.contact_info.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
