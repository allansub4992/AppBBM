
import { FuelPrice } from "@/types/fuel";
import { Card, CardContent } from "@/components/ui/card";
import { Fuel, MapPin, Calendar } from "lucide-react";

interface FuelPriceCardProps {
  price: FuelPrice;
}

export default function FuelPriceCard({ price }: FuelPriceCardProps) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price.price);

  return (
    <Card className="brutalist-border brutalist-shadow bg-brutalist-charcoal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-brutalist-yellow brutalist-border rounded-lg">
            <Fuel className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
          </div>
          <span className="font-display text-2xl text-brutalist-yellow tracking-wider">
            {formattedPrice}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-xl text-brutalist-cream">
            {price.fuelType}
          </h3>

          <div className="flex items-center gap-2 text-brutalist-cream/70">
            <MapPin className="w-4 h-4" />
            <span className="font-body text-sm uppercase">
              {price.station} - {price.city}
            </span>
          </div>

          <div className="flex items-center gap-2 text-brutalist-cream/50 pt-2 border-t border-brutalist-cream/10 mt-4">
            <Calendar className="w-4 h-4" />
            <span className="font-body text-xs">
              Updated: {new Date(price.lastUpdated).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
