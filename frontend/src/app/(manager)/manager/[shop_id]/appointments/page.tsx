"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format as formatDate } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getManagerAppointments, updateAppointmentStatus } from "@/lib/api";
import type { ManagerAppointment } from "@/lib/types";
import { cn, SHOP_TIMEZONE } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
  const params = useParams();
  const shopId = params.shop_id as string;

  const [appointments, setAppointments] = useState<ManagerAppointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!shopId) return;

    const fetchAppointments = async () => {
      setIsLoading(true);
      const dateString = formatDate(selectedDate, "yyyy-MM-dd");
      try {
        const data = await getManagerAppointments(shopId, dateString);
        const filteredData = data.filter(
          (appt) => appt.status === "Booked" || appt.status === "Completed"
        );
        setAppointments(filteredData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [shopId, selectedDate]);

  const handleStartAppointment = async (appointmentId: string) => {
    setUpdatingId(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, "InProgress");
      toast.success("Appointment started successfully!");
      setAppointments((currentAppointments) =>
        currentAppointments.filter((appt) => appt.id !== appointmentId)
      );
    } catch (error) {
      toast.error("Failed to start appointment. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header and Date Picker (No changes here) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            View appointments for the selected date.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                formatDate(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) setSelectedDate(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg w-full">
        {/* By adding the 'table-fixed' class, we tell the table to respect the widths we set on the headers */}
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              {/* --- NEW EVENLY DISTRIBUTED WIDTHS --- */}
              <TableHead className="w-[25%]">Customer</TableHead>
              <TableHead className="w-[20%]">Barber</TableHead>
              <TableHead className="hidden md:table-cell w-[15%]">
                Time
              </TableHead>
              <TableHead className="text-right w-[15%] pr-6">Amount</TableHead>
              <TableHead className="hidden sm:table-cell text-center w-[15%]">
                Status
              </TableHead>
              <TableHead className="text-center w-[10%]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-3/4" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-5 w-1/2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-1/2 ml-auto" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-5 w-3/4 mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-20 mx-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : appointments.length > 0 ? (
              appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell className="font-medium truncate">
                    {appt.customer_name}
                  </TableCell>
                  <TableCell className="truncate">{appt.barber_name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatInTimeZone(appt.start_time, SHOP_TIMEZONE, "p")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {formatCurrency(appt.total_amount)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        appt.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      )}
                    >
                      {appt.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {appt.status === "Booked" && (
                      <Button
                        size="sm"
                        onClick={() => handleStartAppointment(appt.id)}
                        disabled={updatingId === appt.id}
                      >
                        {updatingId === appt.id && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Start
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="no-appointments-row">
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No appointments found for this date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
