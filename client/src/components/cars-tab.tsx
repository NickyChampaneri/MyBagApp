import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Plus, AlertTriangle, Leaf, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CarsTabProps {
  onAddCar: () => void;
}

export default function CarsTab({ onAddCar }: CarsTabProps) {
  const { user } = useAuth();

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ["/api/cars"],
    enabled: !!user,
  });

  const { data: bagTypes } = useQuery({
    queryKey: ["/api/bag-types"],
    enabled: !!user,
  });

  if (carsLoading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-ios-lg"></div>
          <div className="h-32 bg-gray-200 rounded-ios-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ios-text">My Cars</h1>
          <Button
            onClick={onAddCar}
            className="ios-button w-8 h-8 bg-ios-blue hover:bg-ios-blue/90 rounded-full flex items-center justify-center p-0"
          >
            <Plus className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      {/* Cars List */}
      <div className="px-6 space-y-4">
        {cars && cars.length > 0 ? (
          cars.map((car: any) => (
            <CarCard key={car.id} car={car} bagTypes={bagTypes || []} />
          ))
        ) : (
          <Card className="ios-card rounded-ios-lg p-6 shadow-sm text-center">
            <Car className="w-12 h-12 mx-auto mb-4 text-ios-secondary opacity-50" />
            <h3 className="font-semibold text-ios-text mb-2">No cars added yet</h3>
            <p className="text-sm text-ios-secondary mb-4">
              Add your first car to start tracking bag inventory
            </p>
            <Button onClick={onAddCar} className="bg-ios-blue hover:bg-ios-blue/90 text-white">
              Add Your First Car
            </Button>
          </Card>
        )}

        {/* Add Car Card */}
        {cars && cars.length > 0 && (
          <Button
            onClick={onAddCar}
            className="w-full ios-card rounded-ios-lg p-6 shadow-sm border-2 border-dashed border-ios-secondary border-opacity-30 ios-button bg-transparent hover:bg-ios-bg"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-ios-secondary bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Plus className="w-6 h-6 text-ios-secondary" />
              </div>
              <span className="text-ios-secondary font-medium">Add New Car</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}

function CarCard({ car, bagTypes }: { car: any; bagTypes: any[] }) {
  const { data: inventory } = useQuery({
    queryKey: ["/api/cars", car.id, "inventory"],
  });

  const getBagTypeById = (id: number) => {
    return bagTypes.find(type => type.id === id);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "leaf":
        return Leaf;
      case "shopping-bag":
        return ShoppingBag;
      default:
        return ShoppingBag;
    }
  };

  return (
    <Card className="ios-card rounded-ios-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-ios-blue to-blue-600 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-ios-text">{car.name}</h3>
            {car.model && (
              <p className="text-sm text-ios-secondary">{car.model}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="ios-button text-ios-blue">
          <i className="fas fa-ellipsis-h"></i>
        </Button>
      </div>

      {/* Bag Inventory */}
      <div className="space-y-3">
        <h4 className="font-medium text-ios-text">Bag Inventory</h4>

        {inventory && inventory.length > 0 ? (
          inventory.map((item: any) => {
            const bagType = getBagTypeById(item.bagTypeId);
            if (!bagType) return null;

            const IconComponent = getIconComponent(bagType.icon);
            const isLowStock = item.quantity <= item.lowStockThreshold;

            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-ios-bg rounded-ios">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: bagType.color }}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-ios-text">{bagType.name}</span>
                    <p className="text-xs text-ios-secondary">${bagType.pricePerBag} each</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${isLowStock ? 'text-red-500' : 'text-ios-text'}`}>
                    {item.quantity}
                  </span>
                  <Button 
                    size="sm"
                    className="ios-button w-6 h-6 rounded-full flex items-center justify-center p-0"
                    style={{ backgroundColor: bagType.color }}
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 text-ios-secondary">
            <p className="text-sm">No bag inventory set up</p>
            <p className="text-xs">Add bag types to start tracking</p>
          </div>
        )}

        {/* Low Stock Alert */}
        {inventory && inventory.some((item: any) => item.quantity <= item.lowStockThreshold) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-ios">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">Low stock alert</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
