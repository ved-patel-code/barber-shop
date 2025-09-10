// src/app/failure/page.tsx
import { Suspense } from "react";
import FailureContent from "./FailureContent";

// A simple fallback component to show while the dynamic part is loading
function FailurePageLoading() {
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <p>Loading result...</p>
    </div>
  );
}

export default function FailurePage() {
  return (
    <div className="container mx-auto py-12 px-4 flex justify-center">
      <Suspense fallback={<FailurePageLoading />}>
        <FailureContent />
      </Suspense>
    </div>
  );
}
