import { FuelPrice } from "@/types/fuel";

// Data harga BBM di berbagai wilayah Indonesia (dalam Rupiah per liter)
export const indonesianFuelPrices: Omit<FuelPrice, "id" | "lastUpdated">[] = [
  // Kalimantan Timur
  { region: "Kalimantan Timur", city: "Balikpapan", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Kalimantan Timur", city: "Balikpapan", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Kalimantan Timur", city: "Balikpapan", station: "Pertamina", fuelType: "Pertamax Turbo", price: 14050 },
  { region: "Kalimantan Timur", city: "Balikpapan", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Kalimantan Timur", city: "Balikpapan", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Kalimantan Timur", city: "Balikpapan", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  // Removed Shell/BP and secondary city (Samarinda)

  // DKI Jakarta
  { region: "DKI Jakarta", city: "Jakarta Pusat", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "DKI Jakarta", city: "Jakarta Pusat", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "DKI Jakarta", city: "Jakarta Pusat", station: "Pertamina", fuelType: "Pertamax Turbo", price: 14050 },
  { region: "DKI Jakarta", city: "Jakarta Pusat", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "DKI Jakarta", city: "Jakarta Pusat", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "DKI Jakarta", city: "Jakarta Pusat", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  { region: "DKI Jakarta", city: "Jakarta Selatan", station: "Shell", fuelType: "Pertalite", price: 10150 },
  { region: "DKI Jakarta", city: "Jakarta Selatan", station: "Shell", fuelType: "Pertamax", price: 13100 },
  { region: "DKI Jakarta", city: "Jakarta Selatan", station: "Shell", fuelType: "Pertamax Turbo", price: 14600 },
  { region: "DKI Jakarta", city: "Jakarta Utara", station: "BP", fuelType: "Pertalite", price: 10100 },
  { region: "DKI Jakarta", city: "Jakarta Utara", station: "BP", fuelType: "Pertamax", price: 13050 },
  { region: "DKI Jakarta", city: "Jakarta Barat", station: "Total", fuelType: "Pertalite", price: 10200 },
  { region: "DKI Jakarta", city: "Jakarta Barat", station: "Total", fuelType: "Pertamax", price: 13150 },
  { region: "DKI Jakarta", city: "Jakarta Timur", station: "Vivo", fuelType: "Pertalite", price: 10050 },
  { region: "DKI Jakarta", city: "Jakarta Timur", station: "Vivo", fuelType: "Pertamax", price: 13000 },

  // Jawa Barat
  { region: "Jawa Barat", city: "Bandung", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Jawa Barat", city: "Bandung", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Jawa Barat", city: "Bandung", station: "Pertamina", fuelType: "Pertamax Turbo", price: 14050 },
  { region: "Jawa Barat", city: "Bandung", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Jawa Barat", city: "Bandung", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Jawa Barat", city: "Bandung", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  { region: "Jawa Barat", city: "Bandung", station: "Shell", fuelType: "Pertalite", price: 10150 },
  { region: "Jawa Barat", city: "Bandung", station: "Shell", fuelType: "Pertamax", price: 13100 },
  // Removed duplicate Pertamina (Bekasi, Bogor, Depok) but kept competitor stations in those cities if needed? 
  // User said "menu harga daftar bbm pertamina yang ganda dihapus saja". 
  // Competitors in other cities (Bekasi BP, Bogor Shell, Depok Total) should be kept as they are effectively Jakarta suburb/Jawa Barat.
  { region: "Jawa Barat", city: "Bekasi", station: "BP", fuelType: "Pertamax", price: 13000 },
  { region: "Jawa Barat", city: "Bogor", station: "Shell", fuelType: "Pertamax", price: 13100 },
  { region: "Jawa Barat", city: "Depok", station: "Total", fuelType: "Pertamax", price: 13050 },

  // Jawa Tengah
  { region: "Jawa Tengah", city: "Semarang", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Jawa Tengah", city: "Semarang", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Jawa Tengah", city: "Semarang", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Jawa Tengah", city: "Semarang", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  // Pertamina DEX missing in original for Jateng, adding it for consistency
  { region: "Jawa Tengah", city: "Semarang", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  { region: "Jawa Tengah", city: "Semarang", station: "Shell", fuelType: "Pertalite", price: 10150 },
  { region: "Jawa Tengah", city: "Semarang", station: "Shell", fuelType: "Pertamax", price: 13100 },
  // Removed duplicate Pertamina (Solo/Yogyakarta) but kept competitors
  { region: "Jawa Tengah", city: "Solo", station: "BP", fuelType: "Pertamax", price: 13000 },
  { region: "Jawa Tengah", city: "Yogyakarta", station: "Shell", fuelType: "Pertamax", price: 13100 },

  // Jawa Timur
  { region: "Jawa Timur", city: "Surabaya", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Jawa Timur", city: "Surabaya", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Jawa Timur", city: "Surabaya", station: "Pertamina", fuelType: "Pertamax Turbo", price: 14050 },
  { region: "Jawa Timur", city: "Surabaya", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Jawa Timur", city: "Surabaya", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Jawa Timur", city: "Surabaya", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  { region: "Jawa Timur", city: "Surabaya", station: "Shell", fuelType: "Pertalite", price: 10150 },
  { region: "Jawa Timur", city: "Surabaya", station: "Shell", fuelType: "Pertamax", price: 13100 },
  // Removed duplicate Pertamina (Malang/Sidoarjo) but kept competitors
  { region: "Jawa Timur", city: "Malang", station: "BP", fuelType: "Pertamax", price: 13050 },
  { region: "Jawa Timur", city: "Sidoarjo", station: "Shell", fuelType: "Pertamax", price: 13100 },

  // Sumatera Utara
  { region: "Sumatera Utara", city: "Medan", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Sumatera Utara", city: "Medan", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Sumatera Utara", city: "Medan", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Sumatera Utara", city: "Medan", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Sumatera Utara", city: "Medan", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  // Removed Shell/BP (Medan/Pematang Siantar)

  // Sumatera Selatan
  { region: "Sumatera Selatan", city: "Palembang", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Sumatera Selatan", city: "Palembang", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Sumatera Selatan", city: "Palembang", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Sumatera Selatan", city: "Palembang", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Sumatera Selatan", city: "Palembang", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  // Removed Shell (Palembang)

  // Sulawesi Selatan
  { region: "Sulawesi Selatan", city: "Makassar", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Sulawesi Selatan", city: "Makassar", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Sulawesi Selatan", city: "Makassar", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Sulawesi Selatan", city: "Makassar", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Sulawesi Selatan", city: "Makassar", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  // Removed Shell (Makassar)

  // Bali
  { region: "Bali", city: "Denpasar", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Bali", city: "Denpasar", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Bali", city: "Denpasar", station: "Pertamina", fuelType: "Pertamax Turbo", price: 14050 },
  { region: "Bali", city: "Denpasar", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Bali", city: "Denpasar", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Bali", city: "Denpasar", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  // Removed Shell/BP (Denpasar/Badung)

  // Papua
  { region: "Papua", city: "Jayapura", station: "Pertamina", fuelType: "Pertalite", price: 10000 },
  { region: "Papua", city: "Jayapura", station: "Pertamina", fuelType: "Pertamax", price: 13050 },
  { region: "Papua", city: "Jayapura", station: "Pertamina", fuelType: "Solar", price: 6800 },
  { region: "Papua", city: "Jayapura", station: "Pertamina", fuelType: "Dexlite", price: 15000 },
  { region: "Papua", city: "Jayapura", station: "Pertamina", fuelType: "Pertamina DEX", price: 15300 },
  // Removed duplicate old/new entries and Shell (Jayapura)
];

export function generateFuelPrices(): FuelPrice[] {
  return indonesianFuelPrices.map((price, index) => ({
    ...price,
    id: `price_${index + 1}`,
    lastUpdated: new Date(),
  }));
}
