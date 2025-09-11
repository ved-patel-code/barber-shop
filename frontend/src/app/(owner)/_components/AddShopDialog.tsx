"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { createShop } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

/**
 * Zod schema: keep preprocess to turn string -> number.
 * Note: we DON'T rely on z.infer to define the TS shape used by useForm.
 * Instead we declare ShopFormValues explicitly below (keeps TS/RHF happy).
 */
const shopFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Shop name must be at least 2 characters." }),
  address: z
    .string()
    .min(10, { message: "Address must be at least 10 characters." }),
  phone_number: z
    .string()
    .min(10, { message: "Please enter a valid phone number." }),
  tax_rate_percentage: z.preprocess((val) => {
    // If the input is a string (from the DOM), convert to number.
    // If it's already a number, return it.
    // If it can't be converted, return undefined so Zod treats it as missing/invalid.
    if (typeof val === "string") {
      const n = Number(val);
      return Number.isFinite(n) ? n : undefined;
    }
    if (typeof val === "number") {
      return Number.isFinite(val) ? val : undefined;
    }
    return undefined;
  }, z.number().min(0, { message: "Tax rate cannot be negative." }).max(100, { message: "Tax rate cannot exceed 100." })),
});

/**
 * Explicit TS type that matches what we want from the form.
 * Defining it explicitly avoids the generic-mismatch between RHF and the resolver.
 */
type ShopFormValues = {
  name: string;
  address: string;
  phone_number: string;
  tax_rate_percentage: number; // always a number in our form values
};

interface AddShopDialogProps {
  onShopAdded: () => void;
  children: React.ReactNode;
}

export function AddShopDialog({ onShopAdded, children }: AddShopDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // zodResolver returns a Resolver that TypeScript can't always infer as the exact generic shape.
  // We assert its type to Resolver<ShopFormValues> — this is a typed assertion (not any),
  // keeping everything fully typed for compile-time checking.
  const resolver = zodResolver(
    shopFormSchema
  ) as unknown as Resolver<ShopFormValues>;

  const form = useForm<ShopFormValues>({
    resolver,
    defaultValues: {
      name: "",
      address: "",
      phone_number: "",
      tax_rate_percentage: 18,
    },
  });

  async function onSubmit(data: ShopFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        address: data.address,
        phone_number: data.phone_number,
        tax_rate: data.tax_rate_percentage / 100, // convert percentage to decimal
      };

      const created = await createShop(payload);

      toast.success("Shop created successfully!");
      onShopAdded(); // notify parent to refresh
      form.reset();
      setIsOpen(false);
      return created;
    } catch (error) {
      console.error("Create shop error:", error);
      toast.error("Failed to create shop. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Shop</DialogTitle>
          <DialogDescription>
            Enter the details for the new shop location. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Spread the useForm return into the Form wrapper */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Downtown Cuts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Info</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tax_rate_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    {/* Input type=number returns strings from DOM; preprocess handles conversion */}
                    <Input type="number" placeholder="18" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
