"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <Card className="max-w-lg w-full shadow-md text-center">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl font-bold">
              Booking Confirmed!
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for booking with us. We look forward to seeing you at your
            appointment.
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
            <Link href="/services">
              <Button variant="outline">View More Services</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
