import { supabase } from "@/lib/supabase"; // Use centralized Supabase client
import { db } from "@/lib/firebase";
import { RefuelRecord, Vehicle, FuelPrice } from "@/types/fuel";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";

export interface BackupData {
    version: string;
    timestamp: string;
    data: {
        records: RefuelRecord[];
        vehicles: Vehicle[];
        fuelPrices: FuelPrice[];
    };
}

export const backupService = {
    async exportData(userId: string): Promise<BackupData> {
        // 1. Fetch Records
        const q = query(
            collection(db, "refuel_records"),
            where("user_id", "==", userId)
        );
        const recordsSnap = await getDocs(q);

        const records: RefuelRecord[] = [];
        recordsSnap.forEach((d) => {
            const r = d.data();
            records.push({
                id: d.id,
                date: new Date(r.date),
                station: r.station,
                fuelType: r.fuel_type,
                liters: r.liters,
                totalCost: r.total_cost,
                pricePerLiter: r.price_per_liter,
                vehicleId: r.vehicle_id,
                createdAt: new Date(r.created_at),
                synced: true
            });
        });

        // 2. Fetch Fuel Prices
        const pricesSnap = await getDocs(collection(db, "fuel_prices"));
        const fuelPrices: FuelPrice[] = [];
        pricesSnap.forEach((d) => {
            const p = d.data();
            fuelPrices.push({
                id: d.id,
                region: p.region,
                city: p.city,
                station: p.station,
                fuelType: p.fuel_type,
                price: Number(p.price),
                lastUpdated: p.last_updated ? new Date(p.last_updated) : new Date(),
            });
        });

        return {
            version: "1.0",
            timestamp: new Date().toISOString(),
            data: {
                records,
                vehicles: [], // To be populated by caller if local
                fuelPrices,
            },
        };
    },

    async importData(backup: BackupData, userId: string) {
        // Import Records
        if (backup.data.records.length > 0) {
            for (const r of backup.data.records) {
                // If ID is preserved, use it as doc ID
                const docRef = doc(db, "refuel_records", r.id);
                // Ensure dates are strings for Firestore
                const dateStr = r.date instanceof Date ? r.date.toISOString() : r.date;
                const createdAtStr = r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt;

                const recordData = {
                    user_id: userId,
                    date: dateStr,
                    station: r.station,
                    fuel_type: r.fuelType,
                    liters: r.liters,
                    total_cost: r.totalCost,
                    price_per_liter: r.pricePerLiter,
                    vehicle_id: r.vehicleId,
                    created_at: createdAtStr
                };

                try {
                    await setDoc(docRef, recordData, { merge: true });
                } catch (e: any) {
                    console.error(`Failed to import record ${r.id}:`, e);
                    throw new Error(`Error importing records: ${e.message}`);
                }
            }
        }

        // Import Fuel Prices (Optional, skipped as per original logic)
    }
};
