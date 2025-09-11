"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthYearPickerProps {
  value?: string; // e.g., "2025-09"
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
}

const MONTHS = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export function MonthYearPicker({
  value,
  onValueChange,
  disabled,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear();

  const selectedYear = value ? value.split("-")[0] : "";
  const selectedMonth = value ? value.split("-")[1] : "";

  const handleYearChange = (year: string) => {
    if (selectedMonth) {
      onValueChange(`${year}-${selectedMonth}`);
    } else {
      // store only year until month is selected
      onValueChange(`${year}-`);
    }
  };

  const handleMonthChange = (month: string) => {
    if (selectedYear) {
      onValueChange(`${selectedYear}-${month}`);
    } else {
      // store only month until year is selected
      onValueChange(`${currentYear}-${month}`);
    }
  };

  return (
    <div className="flex gap-2">
      <Select
        onValueChange={handleYearChange}
        value={selectedYear || undefined}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 7 }, (_, i) => (currentYear - 5 + i).toString())
            .reverse()
            .map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={handleMonthChange}
        value={selectedMonth || undefined}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select month..." />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
