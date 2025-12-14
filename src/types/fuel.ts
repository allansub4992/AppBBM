export type FuelType = "Pertalite" | "Pertamax" | "Pertamax Turbo" | "Solar" | "Dexlite" | "Pertamina DEX" | "Pertamax Green 95";

export type StationChain = "Pertamina" | "Shell" | "BP" | "Total" | "Vivo";

export type Region = "Kalimantan Timur" | "DKI Jakarta" | "Jawa Barat" | "Jawa Tengah" | "Jawa Timur" | "Sumatera Utara" | "Sumatera Selatan" | "Sulawesi Selatan" | "Bali" | "Papua";

export interface FuelPrice {
  id: string;
  fuelType: FuelType;
  station: StationChain;
  region: Region;
  city: string;
  price: number;
  lastUpdated: Date;
}

export interface RefuelRecord {
  id: string;
  date: Date;
  station: StationChain;
  fuelType: FuelType;
  liters: number;
  totalCost: number;
  pricePerLiter: number;
  receiptPhoto?: string;
  vehicleId?: string;
  createdAt: Date;
  synced: boolean;
}

export interface MonthlyStats {
  totalSpent: number;
  totalLiters: number;
  averagePricePerLiter: number;
  refuelCount: number;
}

export type VehicleType = "motor" | "mobil";

export interface Vehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  year?: number;
  licensePlate?: string;
  fuelType: FuelType;
  createdAt: Date;
}

export interface IndonesianMotorcycle {
  brand: string;
  models: string[];
}

export interface IndonesianCar {
  brand: string;
  models: string[];
}
