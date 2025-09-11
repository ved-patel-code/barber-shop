// src/app/(manager)/manager/_components/WalkInDialog.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatISO } from "date-fns";
// --- 1. Import the DollarSign icon ---
import { Loader2, Clock, ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";

import {
  getAllServices,
  getAvailableBarbers,
  createAppointment,
  getShopById,
} from "@/lib/api";
import type { Service, Barber, ServiceSnapshot } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  gender: z.string().optional(),
});
type CustomerFormData = z.infer<typeof customerSchema>;

interface WalkInDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shopId: string;
  onSuccess: () => void;
}

export function WalkInDialog({
  isOpen,
  onOpenChange,
  shopId,
  onSuccess,
}: WalkInDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopDetails, setShopDetails] = useState<{
    name: string;
    tax_rate: number;
  } | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [availableBarbers, setAvailableBarbers] = useState<Barber[]>([]);
  const [isFetchingBarbers, setIsFetchingBarbers] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (isOpen) {
      getShopById(shopId).then(setShopDetails);
      if (allServices.length === 0) {
        setIsFetchingServices(true);
        getAllServices()
          .then(setAllServices)
          .catch(() => toast.error("Failed to load services."))
          .finally(() => setIsFetchingServices(false));
      }
    }
  }, [isOpen, shopId, allServices.length]);

  // --- 2. Update the useMemo hook to calculate totalPrice ---
  const { totalDuration, totalPrice, selectedServices } = useMemo(() => {
    const selected = allServices.filter((s) => selectedServiceIds.has(s.id));
    const duration = selected.reduce((sum, s) => sum + s.duration, 0);
    const price = selected.reduce((sum, s) => sum + s.price, 0); // Calculate price
    return {
      totalDuration: duration,
      totalPrice: price, // Return price
      selectedServices: selected,
    };
  }, [selectedServiceIds, allServices]);

  useEffect(() => {
    if (totalDuration === 0) {
      setAvailableBarbers([]);
      setSelectedBarberId(null);
      return;
    }
    setIsFetchingBarbers(true);
    const handler = setTimeout(() => {
      getAvailableBarbers(shopId, totalDuration)
        .then(setAvailableBarbers)
        .catch(() => toast.error("Failed to find available barbers."))
        .finally(() => setIsFetchingBarbers(false));
    }, 500);
    return () => clearTimeout(handler);
  }, [totalDuration, shopId]);

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    const newIds = new Set(selectedServiceIds);
    checked ? newIds.add(serviceId) : newIds.delete(serviceId);
    setSelectedServiceIds(newIds);
    setSelectedBarberId(null);
  };

  const resetAllState = () => {
    setCurrentStep(1);
    setSelectedServiceIds(new Set());
    setSelectedBarberId(null);
    setAvailableBarbers([]);
    resetForm({ name: "", phone: "", gender: "" });
  };

  const onDialogChange = (open: boolean) => {
    if (!open) {
      resetAllState();
    }
    onOpenChange(open);
  };

  const onFinalSubmit = async (data: CustomerFormData) => {
    if (!selectedBarberId || !shopDetails) {
      toast.error("Missing barber or shop information.");
      return;
    }
    setIsSubmitting(true);
    const selectedBarber = availableBarbers.find(
      (b) => b.id === selectedBarberId
    );
    if (!selectedBarber) {
      toast.error("Selected barber not found.");
      setIsSubmitting(false);
      return;
    }
    const service_snapshots: ServiceSnapshot[] = selectedServices.map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration,
      price: s.price,
    }));
    try {
      await createAppointment({
        customer_name: data.name,
        customer_phone: data.phone,
        customer_gender: data.gender || null,
        shop_id: shopId,
        shop_name: shopDetails.name,
        barber_id: selectedBarber.id,
        barber_name: selectedBarber.name,
        start_time: formatISO(new Date()),
        service_snapshots,
        tax_rate: shopDetails.tax_rate,
        is_walk_in: true,
        status: "InProgress",
      });
      toast.success("Walk-in appointment created successfully!");
      resetAllState();
      onSuccess();
    } catch (_error) {
      toast.error("Failed to create appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. Add a currency formatting helper function ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderStepOne = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h4 className="font-semibold">Select Services</h4>
          <ScrollArea className="h-64 border rounded-md p-4">
            {isFetchingServices ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {allServices.map((service) => (
                  <div key={service.id} className="flex items-center gap-3">
                    <Checkbox
                      id={service.id}
                      checked={selectedServiceIds.has(service.id)}
                      onCheckedChange={(checked) =>
                        handleServiceSelection(service.id, !!checked)
                      }
                    />
                    <label
                      htmlFor={service.id}
                      className="flex-grow text-sm font-medium cursor-pointer"
                    >
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold">Summary</h4>
          <div className="border rounded-md p-4 space-y-3">
            {/* --- 4. Add the Total Price display to the UI --- */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Price</span>
              <div className="flex items-center gap-2 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Duration</span>
              <div className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4" />
                <span>{totalDuration} mins</span>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium">Available Barbers</label>
              <div className="flex items-center gap-2 mt-2">
                <Select
                  value={selectedBarberId || ""}
                  onValueChange={setSelectedBarberId}
                  disabled={
                    totalDuration === 0 ||
                    isFetchingBarbers ||
                    availableBarbers.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        totalDuration === 0
                          ? "Select services first"
                          : isFetchingBarbers
                          ? "Finding barbers..."
                          : "Select a barber"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBarbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isFetchingBarbers && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button onClick={() => setCurrentStep(2)} disabled={!selectedBarberId}>
          Next
        </Button>
      </DialogFooter>
    </>
  );

  const renderStepTwo = () => (
    <form onSubmit={handleSubmit(onFinalSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input id="name" {...register("name")} placeholder="John Doe" />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register("phone")} placeholder="9876543210" />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender (Optional)</Label>
          <Input id="gender" {...register("gender")} placeholder="Male" />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Appointment
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onDialogChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Walk-in Appointment</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 2:{" "}
            {currentStep === 1
              ? "Select services and an available barber."
              : "Enter customer details."}
          </DialogDescription>
        </DialogHeader>
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
      </DialogContent>
    </Dialog>
  );
}
