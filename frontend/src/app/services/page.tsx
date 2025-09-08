"use client";
import { useEffect, useState } from "react";
import ServiceCard from "../components/booking/ServiceCard";
import Cart from "../components/booking/Cart";
import { useCart } from "../components/context/CartContext";
import { getAllServices } from "@/lib/api"; // Import our new API function
import type { Service } from "@/lib/types"; // Import our central type

export default function ServicesPage() {
  const {
    selectedServices,
    addService,
    removeService,
    totalPrice,
    totalDuration,
  } = useCart();

  // State for managing fetched services and loading/error status
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const fetchedServices = await getAllServices();
        setServices(fetchedServices);
        setError(null);
      } catch (err) {
        setError("Failed to load services. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []); // The empty dependency array [] means this runs only once on mount

  // --- Render logic based on state ---
  if (isLoading) {
    return (
      <div className="container text-center py-12">Loading services...</div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-12 text-red-500">{error}</div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>

      {services.length === 0 ? (
        <p>No services are available at this time.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-40">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              // Check if this service is in our cart context
              isSelected={selectedServices.some((s) => s.id === service.id)}
              // Pass the context functions directly to the card
              onAddService={addService}
              onRemoveService={removeService}
            />
          ))}
        </div>
      )}

      <Cart
        selectedServices={selectedServices}
        totalPrice={totalPrice}
        totalDuration={totalDuration}
      />
    </div>
  );
}
