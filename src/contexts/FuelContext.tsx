import React, { createContext, useContext, useState, useEffect } from "react";
import { FuelPrice, RefuelRecord, FuelType, StationChain, Vehicle, Region } from "@/types/fuel";
import { generateFuelPrices } from "@/data/fuelPrices";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { backupService, BackupData } from "@/services/backupService";




interface FuelContextType {
  prices: FuelPrice[];
  records: RefuelRecord[];
  vehicles: Vehicle[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  addRecord: (record: Omit<RefuelRecord, "id" | "createdAt" | "synced">) => void;
  updateRecord: (id: string, record: Partial<RefuelRecord>) => void;
  deleteRecord: (id: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id" | "createdAt">) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  refreshPrices: () => Promise<void>;
  syncData: () => Promise<void>;
  downloadBackup: () => Promise<void>;
}

const FuelContext = createContext<FuelContextType | undefined>(undefined);

// Generate initial local prices as fallback
const localPrices = generateFuelPrices();

export function FuelProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [prices, setPrices] = useState<FuelPrice[]>(localPrices);
  const [records, setRecords] = useState<RefuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>("Kalimantan Timur");

  useEffect(() => {
    // Load local state first
    const loadLocal = () => {
      const storedRecords = localStorage.getItem("bbm_records");
      if (storedRecords) {
        try {
          const parsed = JSON.parse(storedRecords, (key, value) => {
            if (key === 'date' || key === 'createdAt') return new Date(value);
            return value;
          });
          if (Array.isArray(parsed)) {
            setRecords(parsed);
          }
        } catch (e) {
          console.error("Failed to parse stored records", e);
        }
      }

      const storedVehicles = localStorage.getItem("bbm_vehicles");
      if (storedVehicles) {
        try {
          const parsed = JSON.parse(storedVehicles, (key, value) => {
            if (key === 'createdAt') return new Date(value);
            return value;
          });
          if (Array.isArray(parsed)) {
            setVehicles(parsed);
          }
        } catch (e) {
          console.error("Failed to parse stored vehicles", e);
        }
      }

      const storedRegion = localStorage.getItem("bbm_selected_region");
      if (storedRegion) setSelectedRegion(storedRegion as Region);
    };

    loadLocal();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync with Firestore on auth change or online
  useEffect(() => {
    if (user && isOnline) {
      syncData();
      refreshPrices(); // Initial fetch of global prices
    }
  }, [user, isOnline]);

  useEffect(() => {
    localStorage.setItem("bbm_selected_region", selectedRegion);
  }, [selectedRegion]);

  const saveRecords = (newRecords: RefuelRecord[]) => {
    localStorage.setItem("bbm_records", JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const saveVehicles = (newVehicles: Vehicle[]) => {
    localStorage.setItem("bbm_vehicles", JSON.stringify(newVehicles));
    setVehicles(newVehicles);
  };

  const addRecord = async (record: Omit<RefuelRecord, "id" | "createdAt" | "synced">) => {
    const newRecord: RefuelRecord = {
      ...record,
      id: "record_" + Date.now(),
      createdAt: new Date(),
      synced: false,
    };

    // Optimistic update
    const updatedRecords = [newRecord, ...records];
    saveRecords(updatedRecords);

    if (user && isOnline) {
      try {
        const docRef = await addDoc(collection(db, 'refuel_records'), {
          user_id: user.uid,
          date: newRecord.date.toISOString(),
          station: newRecord.station,
          fuel_type: newRecord.fuelType,
          liters: newRecord.liters,
          total_cost: newRecord.totalCost,
          price_per_liter: newRecord.pricePerLiter,
          vehicle_id: newRecord.vehicleId, // Added vehicleId mapping
          created_at: newRecord.createdAt.toISOString()
        });

        // Update local record to mark as synced. 
        // Note: In a real app we might want to update the local ID to docRef.id, 
        // but for now we keep the local ID to avoid complexity in this refactor.
        updateRecord(newRecord.id, { synced: true });
      } catch (e) {
        console.error("Firestore insert exception:", e);
      }
    }
  };

  const updateRecord = (id: string, updates: Partial<RefuelRecord>) => {
    const updatedRecords = records.map((r) =>
      r.id === id ? { ...r, ...updates, synced: updates.synced ?? false } : r
    );
    saveRecords(updatedRecords);
    // TODO: Implement updates to Firestore
  };

  const deleteRecord = (id: string) => {
    const filteredRecords = records.filter((r) => r.id !== id);
    saveRecords(filteredRecords);
    // TODO: Implement delete from Firestore
  };

  const addVehicle = (vehicle: Omit<Vehicle, "id" | "createdAt">) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: "vehicle_" + Date.now(),
      createdAt: new Date(),
    };
    saveVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );
    saveVehicles(updatedVehicles);
  };

  const deleteVehicle = (id: string) => {
    const filteredVehicles = vehicles.filter((v) => v.id !== id);
    saveVehicles(filteredVehicles);
  };

  const refreshPrices = async () => {
    setIsSyncing(true);

    if (isOnline) {
      try {
        const querySnapshot = await getDocs(collection(db, "fuel_prices"));
        const remotePrices: FuelPrice[] = [];
        querySnapshot.forEach((doc) => {
          const p = doc.data();
          remotePrices.push({
            id: doc.id,
            region: p.region,
            city: p.city,
            station: p.station,
            fuelType: p.fuel_type,
            price: Number(p.price),
            lastUpdated: p.last_updated ? new Date(p.last_updated) : new Date()
          });
        });

        if (remotePrices.length > 0) {
          setPrices(remotePrices);
        } else {
          console.warn("Using local prices fallback (Firestore empty)");
          setPrices(localPrices);
        }
      } catch (e) {
        console.error("Error fetching prices:", e);
        setPrices(localPrices);
      }
    } else {
      setPrices(localPrices);
    }

    setLastSyncTime(new Date());
    localStorage.setItem("bbm_last_sync", new Date().toISOString());
    setIsSyncing(false);
  };

  const syncData = async () => {
    if (!isOnline || !user) return;
    setIsSyncing(true);

    try {
      // Pull latest records
      const q = query(
        collection(db, 'refuel_records'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const remoteRecords: RefuelRecord[] = [];

      querySnapshot.forEach((doc) => {
        const d = doc.data();
        remoteRecords.push({
          id: doc.id, // Use Firestore ID
          date: new Date(d.date),
          station: d.station,
          fuelType: d.fuel_type,
          liters: d.liters,
          totalCost: d.total_cost,
          pricePerLiter: d.price_per_liter,
          vehicleId: d.vehicle_id,
          createdAt: new Date(d.created_at),
          synced: true
        });
      });

      if (remoteRecords.length > 0) {
        saveRecords(remoteRecords);
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setLastSyncTime(new Date());
      setIsSyncing(false);
    }
  };
  const downloadBackup = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);

      // Get cloud data
      const backup = await backupService.exportData(user.uid);

      // Inject local vehicles (as we don't sync them to DB yet)
      backup.data.vehicles = vehicles;

      // Create blob and download
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_bbm_tracker_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Backup failed:", e);
      alert("Backup failed. Check console.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <FuelContext.Provider
      value={{
        prices,
        records,
        vehicles,
        isOnline,
        isSyncing,
        lastSyncTime,
        selectedRegion,
        setSelectedRegion,
        addRecord,
        updateRecord,
        deleteRecord,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        refreshPrices,
        syncData,
        downloadBackup
      }}
    >
      {children}
    </FuelContext.Provider>
  );
}

export function useFuel() {
  const context = useContext(FuelContext);
  if (context === undefined) {
    throw new Error("useFuel must be used within a FuelProvider");
  }
  return context;
}
