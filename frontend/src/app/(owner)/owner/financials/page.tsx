// src/app/(owner)/owner/financials/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DollarSign, ReceiptText, CalendarIcon, Hash } from "lucide-react";

import { getOwnerFinancials, getOwnerShops } from "@/lib/api"; // <-- Add getOwnerShops import
import type { FinancialsReport, Shop } from "@/lib/types"; // <-- Add Shop type import
import { cn } from "@/lib/utils";

import { MetricCard } from "../../_components/MetricCard";
import { MonthYearPicker } from "../../_components/MonthYearPicker";


import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialReportState: FinancialsReport = {
  total_revenue_before_tax: 0,
  total_tax_collected: 0,
  total_revenue_after_tax: 0,
  total_appointments: 0,
  filter_period: "Loading...",
};

export default function FinancialsPage() {
  // const { shops, isLoading: isLoadingShops } = useShops(); // <-- REMOVED

  // NEW: Local state for shops
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);

  const [report, setReport] = useState<FinancialsReport>(initialReportState);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedShopId, setSelectedShopId] = useState<string | undefined>(
    undefined
  );
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [monthFilter, setMonthFilter] = useState<string | undefined>(undefined);

  // NEW: useEffect to fetch shops when the page loads
  useEffect(() => {
    const loadShops = async () => {
      setIsLoadingShops(true);
      const fetchedShops = await getOwnerShops();
      setShops(fetchedShops);
      setIsLoadingShops(false);
    };
    loadShops();
  }, []); // Empty dependency array means this runs once on mount

  // Callback to fetch financial report data (no changes here)
  const fetchReport = useCallback(
    async (filters: { shop_id?: string; date?: string; month?: string }) => {
      setIsLoading(true);
      try {
        const data = await getOwnerFinancials(filters);
        setReport(
          data || {
            ...initialReportState,
            filter_period: "No data for this period.",
          }
        );
      } catch (error: unknown) {
        // <-- FIX: Changed 'any' to 'unknown'
        // Type guard to safely handle the error
        let errorMessage = "An error occurred while fetching the report.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        setReport(initialReportState);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial fetch on component mount (no changes here)
  useEffect(() => {
    fetchReport({ date: format(new Date(), "yyyy-MM-dd") });
  }, [fetchReport]);

  // All handler functions (handleDateSelect, handleMonthSelect, etc.) remain unchanged.
  const handleDateSelect = (date: Date | undefined) => {
    setDateFilter(date);
    if (date) {
      setMonthFilter(undefined);
      toast.info("Date filter selected. Click 'Apply Filter' to update data.");
    }
  };

  const handleMonthSelect = (month: string | undefined) => {
    setMonthFilter(month);
    if (month) {
      setDateFilter(undefined);
      toast.info("Month filter selected. Click 'Apply Filter' to update data.");
    }
  };

  const handleShopSelect = (shopValue: string) => {
    console.log("Selected shop value:", shopValue);
    setSelectedShopId(shopValue === "all" ? undefined : shopValue);
    toast.info("Shop filter selected. Click 'Apply Filter' to update data.");
  };

  const handleApplyFilter = () => {
    const filters: { shop_id?: string; date?: string; month?: string } = {};
    if (selectedShopId) filters.shop_id = selectedShopId;
    if (dateFilter) filters.date = format(dateFilter, "yyyy-MM-dd");
    else if (monthFilter) filters.month = monthFilter;
    else {
      toast.info(
        "No date or month filter selected. Applying for today's date."
      );
      filters.date = format(new Date(), "yyyy-MM-dd");
      setDateFilter(new Date());
    }
    toast.info("Applying filters..."); 
    fetchReport(filters);
  };

  const handleResetFilter = () => {
    setSelectedShopId(undefined);
    setDateFilter(undefined);
    setMonthFilter(undefined);
    fetchReport({ date: format(new Date(), "yyyy-MM-dd") });
    toast.info("Filters reset to today's date for all shops.");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  // The JSX below is unchanged, as it now reads from the local 'shops' and 'isLoadingShops' state.

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
        <p className="text-muted-foreground">
          {isLoading ? "Loading report..." : report.filter_period}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenue (Before Tax)"
          value={formatCurrency(report.total_revenue_before_tax)}
          icon={<DollarSign />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Tax Collected"
          value={formatCurrency(report.total_tax_collected)}
          icon={<ReceiptText />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Revenue (After Tax)"
          value={formatCurrency(report.total_revenue_after_tax)}
          icon={<DollarSign className="text-green-500" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Appointments"
          value={report.total_appointments}
          icon={<Hash />}
          isLoading={isLoading}
        />
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
            {/* Shop Filter */}
            <Select
              onValueChange={handleShopSelect}
              value={selectedShopId || "all"}
              disabled={isLoadingShops || isLoading}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Shops" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shops</SelectItem>
                {isLoadingShops ? (
                  <SelectItem value="loading-shops" disabled>
                    Loading shops...
                  </SelectItem>
                ) : (
                  // The key prop is here, on the direct child of the map
                  shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground text-center sm:hidden">
              AND
            </span>

            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                  disabled={!!monthFilter || isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? (
                    format(dateFilter, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <p className="text-sm text-muted-foreground text-center">OR</p>

            {/* Month/Year Filter */}
            <MonthYearPicker
              value={monthFilter}
              onValueChange={handleMonthSelect}
              disabled={!!dateFilter || isLoading}
            />
          </div>

          {/* Apply and Reset Buttons */}
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
            <Button onClick={handleApplyFilter} disabled={isLoading}>
              Apply Filter
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilter}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
