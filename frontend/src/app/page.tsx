// src/app/page.tsx
"use client";
import ServiceCard from "./components/booking/ServiceCard"; // Update path if needed

export default function Home() {
  const handleDummyAdd = (service: any) => {
    // In a real scenario, this function would add the service to a cart.
    // For this test, we'll just log it to the browser's console.
    console.log("Service added:", service);
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Testing Service Card</h1>
      <div className="w-full max-w-xs">
        <ServiceCard
          id="1"
          name="Men's Haircut"
          price={25}
          duration={30}
          onAddService={handleDummyAdd}
        />
      </div>
    </main>
  );
}
