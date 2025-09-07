// src/app/components/booking/ServiceCard.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the structure of the props this component expects to receive
interface ServiceCardProps {
  id: string;
  name: string;
  price: number;
  duration: number;
  onAddService: (service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  }) => void;
}

export default function ServiceCard({
  id,
  name,
  price,
  duration,
  onAddService,
}: ServiceCardProps) {
  const handleAddClick = () => {
    // When the button is clicked, call the onAddService function
    // and pass all the service details back to the parent component.
    onAddService({ id, name, price, duration });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* You can add a service description here later if you want */}
        <p className="text-sm text-muted-foreground">
          A brief description of the service can go here.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex justify-between w-full text-sm text-muted-foreground">
          <span>{duration} mins</span>
          <span className="font-semibold text-foreground">
            ${price.toFixed(2)}
          </span>
        </div>
        <Button onClick={handleAddClick} className="w-full">
          Add Service
        </Button>
      </CardFooter>
    </Card>
  );
}
