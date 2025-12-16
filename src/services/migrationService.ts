import { supabase } from "@/lib/supabase"; // Use centralized Supabase client
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { RefuelRecord, FuelPrice } from "@/types/fuel";

export interface MigrationResult {
    success: boolean;
    recordsMigrated: number;
    pricesMigrated: number;
    errors: string[];
}

export interface LocalBackup {
    timestamp: string;
    records: RefuelRecord[];
    fuelPrices: FuelPrice[];
}

/**
 * Fetches all refuel records from Supabase
 * Returns empty array if table doesn't exist
 */
async function fetchSupabaseRecords(): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('refuel_records')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            // If table doesn't exist, return empty array instead of throwing
            if (error.message.includes("Could not find the table") || error.code === '42P01') {
                console.warn("Supabase table 'refuel_records' not found. Returning empty array.");
                return [];
            }
            throw new Error(`Failed to fetch records from Supabase: ${error.message}`);
        }

        return data || [];
    } catch (e: any) {
        console.warn("Error fetching from Supabase:", e.message);
        return [];
    }
}

/**
 * Fetches all fuel prices from Supabase
 * Returns empty array if table doesn't exist
 */
async function fetchSupabasePrices(): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from('fuel_prices')
            .select('*');

        if (error) {
            // If table doesn't exist, return empty array instead of throwing
            if (error.message.includes("Could not find the table") || error.code === '42P01') {
                console.warn("Supabase table 'fuel_prices' not found. Returning empty array.");
                return [];
            }
            throw new Error(`Failed to fetch fuel prices from Supabase: ${error.message}`);
        }

        return data || [];
    } catch (e: any) {
        console.warn("Error fetching prices from Supabase:", e.message);
        return [];
    }
}

/**
 * Saves records to Firebase Firestore
 */
async function saveRecordsToFirebase(records: any[]): Promise<number> {
    let count = 0;
    for (const record of records) {
        try {
            const docRef = doc(db, 'refuel_records', record.id.toString());
            await setDoc(docRef, {
                user_id: record.user_id,
                date: record.date,
                station: record.station,
                fuel_type: record.fuel_type,
                liters: record.liters,
                total_cost: record.total_cost,
                price_per_liter: record.price_per_liter,
                vehicle_id: record.vehicle_id || null,
                created_at: record.created_at
            });
            count++;
        } catch (e: any) {
            console.error(`Failed to migrate record ${record.id}:`, e);
        }
    }
    return count;
}

/**
 * Saves fuel prices to Firebase Firestore
 */
async function savePricesToFirebase(prices: any[]): Promise<number> {
    let count = 0;
    for (const price of prices) {
        try {
            const docRef = doc(db, 'fuel_prices', price.id.toString());
            await setDoc(docRef, {
                region: price.region,
                city: price.city,
                station: price.station,
                fuel_type: price.fuel_type,
                price: price.price,
                last_updated: price.last_updated
            });
            count++;
        } catch (e: any) {
            console.error(`Failed to migrate price ${price.id}:`, e);
        }
    }
    return count;
}

/**
 * Saves data to localStorage as backup
 */
function saveToLocalStorage(records: any[], prices: any[]): void {
    // Transform Supabase format to app format for records
    const transformedRecords: RefuelRecord[] = records.map(r => ({
        id: r.id.toString(),
        date: new Date(r.date),
        station: r.station,
        fuelType: r.fuel_type,
        liters: r.liters,
        totalCost: r.total_cost,
        pricePerLiter: r.price_per_liter,
        vehicleId: r.vehicle_id,
        createdAt: new Date(r.created_at),
        synced: true
    }));

    // Transform Supabase format to app format for prices
    const transformedPrices: FuelPrice[] = prices.map(p => ({
        id: p.id.toString(),
        region: p.region,
        city: p.city,
        station: p.station,
        fuelType: p.fuel_type,
        price: Number(p.price),
        lastUpdated: new Date(p.last_updated)
    }));

    // Save to localStorage
    const backup: LocalBackup = {
        timestamp: new Date().toISOString(),
        records: transformedRecords,
        fuelPrices: transformedPrices
    };

    localStorage.setItem('bbm_migration_backup', JSON.stringify(backup));
    localStorage.setItem('bbm_records', JSON.stringify(transformedRecords));
    localStorage.setItem('bbm_fuel_prices', JSON.stringify(transformedPrices));

    console.log('Data saved to localStorage backup.');
}

/**
 * Migration function: copies all data from Supabase to Firebase and localStorage
 */
export async function migrateSupabaseToFirebase(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        recordsMigrated: 0,
        pricesMigrated: 0,
        errors: []
    };

    try {
        console.log('Starting migration from Supabase to Firebase...');

        // Step 1: Fetch all data from Supabase
        console.log('Fetching records from Supabase...');
        const records = await fetchSupabaseRecords();
        console.log(`Found ${records.length} records in Supabase.`);

        console.log('Fetching fuel prices from Supabase...');
        const prices = await fetchSupabasePrices();
        console.log(`Found ${prices.length} fuel prices in Supabase.`);

        // Step 2: Save to localStorage as backup FIRST
        console.log('Saving backup to localStorage...');
        saveToLocalStorage(records, prices);

        // Step 3: Migrate records to Firebase
        console.log('Migrating records to Firebase...');
        result.recordsMigrated = await saveRecordsToFirebase(records);
        console.log(`Migrated ${result.recordsMigrated} records to Firebase.`);

        // Step 4: Migrate fuel prices to Firebase
        console.log('Migrating fuel prices to Firebase...');
        result.pricesMigrated = await savePricesToFirebase(prices);
        console.log(`Migrated ${result.pricesMigrated} prices to Firebase.`);

        result.success = true;
        console.log('Migration completed successfully!');

    } catch (error: any) {
        console.error('Migration failed:', error);
        result.errors.push(error.message);
    }

    return result;
}

/**
 * Restores data from localStorage backup
 */
export function restoreFromLocalBackup(): LocalBackup | null {
    const backupStr = localStorage.getItem('bbm_migration_backup');
    if (!backupStr) {
        console.log('No localStorage backup found.');
        return null;
    }

    try {
        const backup: LocalBackup = JSON.parse(backupStr, (key, value) => {
            if (key === 'date' || key === 'createdAt' || key === 'lastUpdated') {
                return new Date(value);
            }
            return value;
        });
        console.log(`Restored backup from ${backup.timestamp}`);
        return backup;
    } catch (e) {
        console.error('Failed to parse localStorage backup:', e);
        return null;
    }
}

/**
 * Gets the current localStorage backup status
 */
export function getBackupStatus(): { exists: boolean; timestamp: string | null; recordCount: number; priceCount: number } {
    const backupStr = localStorage.getItem('bbm_migration_backup');
    if (!backupStr) {
        return { exists: false, timestamp: null, recordCount: 0, priceCount: 0 };
    }

    try {
        const backup = JSON.parse(backupStr);
        return {
            exists: true,
            timestamp: backup.timestamp,
            recordCount: backup.records?.length || 0,
            priceCount: backup.fuelPrices?.length || 0
        };
    } catch {
        return { exists: false, timestamp: null, recordCount: 0, priceCount: 0 };
    }
}
