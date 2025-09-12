"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const shopSchedule = [
  { day: "Monday", time: "9:00 AM - 7:00 PM" },
  { day: "Tuesday", time: "9:00 AM - 7:00 PM" },
  { day: "Wednesday", time: "9:00 AM - 7:00 PM" },
  { day: "Thursday", time: "9:00 AM - 8:00 PM" },
  { day: "Friday", time: "9:00 AM - 8:00 PM" },
  { day: "Saturday", time: "10:00 AM - 6:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export default function ShopTimingsPage() {
  return (
    <>
      <section className="bg-muted/40 py-12 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Our Hours
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We are here to serve you throughout the week. Find our operational
            hours below.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-12 sm:py-16 px-4">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px] sm:w-[180px] font-semibold text-base">
                      Day
                    </TableHead>
                    <TableHead className="text-right font-semibold text-base">
                      Hours
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopSchedule.map((item) => (
                    <TableRow key={item.day}>
                      <TableCell className="font-medium text-muted-foreground">
                        {item.day}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* The Footer component has been REMOVED from here */}
    </>
  );
}
