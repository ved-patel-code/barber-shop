// src/app/(manager)/manager/[shop_id]/active-appointments/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { PlusCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { getManagerAppointments, updateAppointmentStatus } from "@/lib/api";
import type { ManagerAppointment } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ActiveAppointmentCard } from "../../_components/ActiveAppointmentCard";
import { WalkInDialog } from "../../_components/WalkInDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActiveAppointmentsPage() {
  const params = useParams();
  const shopId = params.shop_id as string;

  const [activeAppointments, setActiveAppointments] = useState<
    ManagerAppointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [isWalkInDialogOpen, setWalkInDialogOpen] = useState(false);

  const fetchAndFilterAppointments = useCallback(async () => {
    if (!shopId) return;

    setIsLoading(true);
    try {
      const dateString = format(new Date(), "yyyy-MM-dd");
      const allAppointments = await getManagerAppointments(shopId, dateString);
      const inProgress = allAppointments.filter(
        (appt) => appt.status === "InProgress"
      );
      setActiveAppointments(inProgress);
    } catch (_error) {
      // --- FIX 1: Unused variable 'error' is now prefixed with an underscore ---
      console.error("Failed to fetch active appointments", _error);
      toast.error("Could not fetch appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchAndFilterAppointments();
  }, [fetchAndFilterAppointments]);

  const handleCompleteAppointment = async (appointmentId: string) => {
    setCompletingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "Completed");
      toast.success("Appointment completed!");
      setActiveAppointments((current) =>
        current.filter((appt) => appt.id !== appointmentId)
      );
    } catch (_error) {
      // --- FIX 1 (Consistency): Also applied here ---
      toast.error("Failed to complete appointment.");
    } finally {
      setCompletingId(null);
    }
  };

  const handleWalkInSuccess = () => {
    setWalkInDialogOpen(false);
    fetchAndFilterAppointments();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Active Appointments
          </h1>
          <p className="text-muted-foreground">
            A real-time view of appointments currently in progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setWalkInDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Walk-in
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAndFilterAppointments}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-lg" />
          ))}
        </div>
      ) : activeAppointments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeAppointments.map((appt) => (
            <ActiveAppointmentCard
              key={appt.id}
              appointment={appt}
              onComplete={handleCompleteAppointment}
              isCompleting={completingId === appt.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 min-h-[400px]">
          <h2 className="text-xl font-semibold">No Active Appointments</h2>
          {/* --- FIX 2: Unescaped quotes are replaced with HTML entities --- */}
          <p className="mt-2 text-muted-foreground">
            When an appointment status is changed to &quot;InProgress&quot;, it
            will appear here.
          </p>
        </div>
      )}

      {shopId && (
        <WalkInDialog
          isOpen={isWalkInDialogOpen}
          onOpenChange={setWalkInDialogOpen}
          shopId={shopId}
          onSuccess={handleWalkInSuccess}
        />
      )}
    </div>
  );
}
