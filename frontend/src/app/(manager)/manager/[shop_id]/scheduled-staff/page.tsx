// src/app/(manager)/manager/[shop_id]/scheduled-staff/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Clock, PlusCircle, Edit } from "lucide-react";

import { getBarbersByShopId, getBarberSchedule } from "@/lib/api";
import type { Barber, ScheduleDay } from "@/lib/types";
import { ScheduleEditDialog } from "../../_components/ScheduleEditDialog";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- UPDATED TIME FORMAT HELPER ---
// Simply return the time string as is for 24-hour format.
const formatScheduleTime = (time: string) => time || "";

export default function ScheduledStaffPage() {
  const params = useParams();
  const shopId = params.shop_id as string;

  const [staffList, setStaffList] = useState<Barber[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);


  const fetchStaff = useCallback(() => {
    if (!shopId) return;
    setIsLoadingStaff(true);
    getBarbersByShopId(shopId)
      .then(setStaffList)
      .catch(() => toast.error("Failed to load staff list."))
      .finally(() => setIsLoadingStaff(false));
  }, [shopId]);

  const fetchSchedule = useCallback(() => {
    if (!selectedBarberId) return;
    setIsLoadingSchedule(true);
    getBarberSchedule(selectedBarberId)
      .then(setSchedule)
      .catch(() => toast.error("Failed to load schedule."))
      .finally(() => setIsLoadingSchedule(false));
  }, [selectedBarberId]);

  useEffect(fetchStaff, [fetchStaff]);
  useEffect(fetchSchedule, [fetchSchedule]);

  const handleOpenDialog = (day: ScheduleDay) => {
    setEditingDay(day);
    setIsDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsDialogOpen(false);
    fetchSchedule(); // Re-fetch the schedule to show updated data
  };

  const selectedBarber = staffList.find((b) => b.id === selectedBarberId);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header and Barber Selector (No changes here) */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Scheduling</h1>
        <p className="text-muted-foreground">
          Select a staff member to view or manage their weekly schedule.
        </p>
      </div>
      <div className="max-w-xs">
        {isLoadingStaff ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            onValueChange={setSelectedBarberId}
            disabled={staffList.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  staffList.length > 0
                    ? "Select a staff member..."
                    : "No staff available"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((barber) => (
                <SelectItem key={barber.id} value={barber.id}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Schedule Display Area */}
      {selectedBarberId ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule for {selectedBarber?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {isLoadingSchedule
                ? Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))
                : schedule.map((daySchedule) => (
                    <div
                      key={daySchedule.day_of_week}
                      className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/40 min-h-[160px]"
                    >
                      <h3 className="font-semibold text-center text-lg">
                        {daySchedule.day_of_week}
                      </h3>
                      <div className="flex-grow flex flex-col items-center justify-center text-center">
                        {daySchedule.is_day_off ? (
                          <p className="font-semibold text-gray-500">
                            On Leave
                          </p>
                        ) : (
                          // --- UPDATED LAYOUT FOR FIXED CLOCK POSITION ---
                          <div className="space-y-1 font-mono text-sm">
                            <div className="flex items-center gap-2 w-full">
                              <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="w-14 text-left">
                                {formatScheduleTime(daySchedule.start_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                              <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                              <span className="w-14 text-left">
                                {formatScheduleTime(daySchedule.end_time)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(daySchedule)}
                      >
                        {daySchedule.is_day_off ? (
                          <PlusCircle className="mr-2 h-4 w-4" />
                        ) : (
                          <Edit className="mr-2 h-4 w-4" />
                        )}
                        {daySchedule.is_day_off ? "Set Schedule" : "Change"}
                      </Button>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 min-h-[400px]">
          <h2 className="text-xl font-semibold">Select a Staff Member</h2>
          <p className="mt-2 text-muted-foreground">
            Choose a staff member from the dropdown above to see their schedule.
          </p>
        </div>
      )}

      {/* --- Render the Dialog --- */}
      {selectedBarberId && (
        <ScheduleEditDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          scheduleDay={editingDay}
          barberId={selectedBarberId}
          shopId={shopId} // <-- PASS THE shopId PROP HERE
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}