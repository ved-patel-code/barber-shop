// src/app/components/booking/ServiceCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/lib/types";

// Props for ServiceCard
export interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onAddService: (service: Service) => void;
  onRemoveService: (serviceId: string) => void;
}

export default function ServiceCard({
  service,
  isSelected,
  onAddService,
  onRemoveService,
}: ServiceCardProps) {
  const handleToggle = () => {
    if (isSelected) {
      onRemoveService(service.id);
    } else {
      onAddService(service);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{service.name}</CardTitle>
      </CardHeader>
      <div className="flex-grow" />
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
          <span>{service.duration} mins</span>
          <span className="font-semibold text-foreground">
            ${service.price.toFixed(2)}
          </span>
        </div>
        <Button
          onClick={handleToggle}
          className="w-full cursor-pointer"
          variant={isSelected ? "destructive" : "default"}
        >
          {isSelected ? "Remove Service" : "Add Service"}
        </Button>
      </CardFooter>
    </Card>
  );
}
