// src/app/(manager)/manager/[shop_id]/financials/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { DollarSign, ReceiptText, CalendarIcon, Hash } from "lucide-react";

import { getFinancials } from "@/lib/api";
import type { FinancialsReport } from "@/lib/types";
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

const initialReportState: FinancialsReport = {
  total_revenue_before_tax: 0,
  total_tax_collected: 0,
  total_revenue_after_tax: 0,
  total_appointments: 0,
  filter_period: "Loading...",
};

export default function FinancialsPage() {
  const params = useParams();
  const shopId = params.shop_id as string;

  const [report, setReport] = useState<FinancialsReport>(initialReportState);
  const [isLoading, setIsLoading] = useState(true);

  // Separate state for each filter type for intuitive automatic disabling
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());
  const [monthFilter, setMonthFilter] = useState<string | undefined>();

  const fetchReport = useCallback(
    async (filters: { date?: string; month?: string }) => {
      if (!shopId) return;
      setIsLoading(true);
      try {
        const data = await getFinancials(shopId, filters);
        setReport(
          data || {
            ...initialReportState,
            filter_period: "No data for this period.",
          }
        );
      } catch (error) {
        toast.error("An error occurred while fetching the report.");
        setReport(initialReportState);
      } finally {
        setIsLoading(false);
      }
    },
    [shopId]
  );

  useEffect(() => {
    // Initial fetch for today's date
    fetchReport({ date: format(new Date(), "yyyy-MM-dd") });
  }, [fetchReport]);

  const handleDateSelect = (date: Date | undefined) => {
    setDateFilter(date);
    if (date) {
      // clear month if date is picked
      setMonthFilter(undefined);
    }
  };


  const handleMonthSelect = (month: string | undefined) => {
    setMonthFilter(month);
    if (month) {
      // clear date if month is picked
      setDateFilter(undefined);
    }
  };

  const handleApplyFilter = () => {
    if (dateFilter) {
      fetchReport({ date: format(dateFilter, "yyyy-MM-dd") });
    } else if (monthFilter) {
      fetchReport({ month: monthFilter });
    } else {
      toast.info("Please select a date or a month to apply a filter.");
    }
  };

const handleResetFilter = () => {
  // Clear both
  setDateFilter(undefined);
  setMonthFilter(undefined);

  // Re-fetch today’s data
  fetchReport({ date: format(new Date(), "yyyy-MM-dd") });
};


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financials</h1>
        <p className="text-muted-foreground">
          {isLoading ? "Loading report..." : report.filter_period}
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                  disabled={!!monthFilter} // 🔑 disable if month is active
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

            <MonthYearPicker
              value={monthFilter}
              onValueChange={handleMonthSelect}
              disabled={!!dateFilter} 
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilter}>Apply Filter</Button>
            <Button variant="outline" onClick={handleResetFilter}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
