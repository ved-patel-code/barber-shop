"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FailurePage() {
  const searchParams = useSearchParams(); // <-- Hook
  const message = searchParams.get("message"); // <-- Get message from URL
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <Card className="max-w-lg w-full shadow-md text-center">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <CardTitle className="text-2xl font-bold">Booking Failed</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            {message || "An unexpected error occurred. Please try again."}
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/book">
              <Button>Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
