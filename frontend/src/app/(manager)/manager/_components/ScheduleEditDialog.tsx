// src/app/(manager)/manager/_components/ScheduleEditDialog.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateBarberSchedule } from "@/lib/api";
import type { ScheduleDay } from "@/lib/types";

// Import our new custom component
import { TimeInput } from "./TimeInput";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const scheduleSchema = z
  .object({
    start_time: z.string(),
    end_time: z.string(),
    is_day_off: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_day_off) {
      if (!data.start_time)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start_time"],
          message: "Start time is required.",
        });
      if (!data.end_time)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_time"],
          message: "End time is required.",
        });
    }
  });
type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleEditDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  scheduleDay: ScheduleDay | null;
  barberId: string;
  shopId: string; // <-- Add shopId to props
  onSuccess: () => void;
}

export function ScheduleEditDialog({
  isOpen,
  onOpenChange,
  scheduleDay,
  barberId,
  shopId,
  onSuccess,
}: ScheduleEditDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    mode: "onChange",
  });

  const isDayOff = watch("is_day_off");

  useEffect(() => {
    if (scheduleDay) {
      reset({
        start_time: scheduleDay.is_day_off ? "" : scheduleDay.start_time,
        end_time: scheduleDay.is_day_off ? "" : scheduleDay.end_time,
        is_day_off: scheduleDay.is_day_off,
      });
    }
  }, [scheduleDay, reset]);

  useEffect(() => {
    if (isDayOff) {
      setValue("start_time", "");
      setValue("end_time", "");
    }
  }, [isDayOff, setValue]);

  const onSubmit = async (data: ScheduleFormData) => {
    if (!scheduleDay || !shopId) return; // Guard against missing shopId

    try {
      // Pass shopId to the API call
      await updateBarberSchedule(barberId, shopId, {
        schedules: [
          {
            day_of_week: scheduleDay.day_of_week,
            start_time: data.is_day_off ? "00:00" : data.start_time,
            end_time: data.is_day_off ? "00:00" : data.end_time,
            is_day_off: data.is_day_off,
          },
        ],
      });
      toast.success(
        `Schedule for ${scheduleDay.day_of_week} updated successfully!`
      );
      onSuccess();
    } catch (error) {
      toast.error("Failed to update schedule.");
    }
  };

  if (!scheduleDay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              Edit Schedule for {scheduleDay.day_of_week}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              {/* Use the new TimeInput component */}
              <TimeInput
                {...register("start_time")}
                readOnly={isDayOff}
                className={isDayOff ? "opacity-50 cursor-not-allowed" : ""}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500">
                  {errors.start_time.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              {/* Use the new TimeInput component */}
              <TimeInput
                {...register("end_time")}
                readOnly={isDayOff}
                className={isDayOff ? "opacity-50 cursor-not-allowed" : ""}
              />
              {errors.end_time && (
                <p className="text-sm text-red-500">
                  {errors.end_time.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="is_day_off"
                checked={watch("is_day_off")} // explicitly control checked
                onCheckedChange={(checked) => setValue("is_day_off", !!checked)}
              />
              <Label htmlFor="is_day_off" className="font-medium">
                On Leave
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
