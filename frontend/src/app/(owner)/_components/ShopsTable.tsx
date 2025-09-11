// src/app/(owner)/_components/ShopsTable.tsx
"use client";

import type { Shop } from "@/lib/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShopsTableProps {
  shops: Shop[];
}

export function ShopsTable({ shops }: ShopsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shop Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead className="text-right">Tax Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.length > 0 ? (
            shops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.name}</TableCell>
                <TableCell>{shop.address}</TableCell>
                <TableCell>{shop.phone_number}</TableCell>
                <TableCell className="text-right">
                  {/* Format the decimal tax rate into a percentage */}
                  {(shop.tax_rate * 100).toFixed(0)}%
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No shops found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
