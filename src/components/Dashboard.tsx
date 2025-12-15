import { useState } from "react";
import { useFuel } from "@/contexts/FuelContext";
import { useAuth } from "@/contexts/AuthContext";
import FuelPriceCard from "./FuelPriceCard";
import RefuelRecordCard from "./RefuelRecordCard";
import RefuelLogForm from "./RefuelLogForm";
import StatisticsPanel from "./StatisticsPanel";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ToastContainer from "./ToastContainer";
import EmptyState from "./EmptyState";
import VehicleManager from "./VehicleManager";
import BackupManager from "./BackupManager";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, LogOut, WifiOff, TrendingUp, History, Fuel as FuelIcon, Search, FileText, Car, MapPin, Database } from "lucide-react";
import { RefuelRecord, FuelType, Region } from "@/types/fuel";
import { useToastNotification } from "@/hooks/useToast";

type ViewMode = "prices" | "history" | "stats" | "vehicles" | "backup";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { prices, records, isOnline, isSyncing, lastSyncTime, refreshPrices, syncData, deleteRecord, selectedRegion, setSelectedRegion } = useFuel();
  const { toasts, addToast, removeToast } = useToastNotification();

  const [showLogForm, setShowLogForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RefuelRecord | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("prices");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFuelType, setFilterFuelType] = useState<FuelType | "all">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Filter prices by selected region
  const filteredPrices = prices.filter((price) => price.region === selectedRegion);

  const handleRefresh = async () => {
    try {
      await refreshPrices();
      await syncData();
      addToast("Data berhasil diperbarui", "success");
    } catch (error) {
      addToast("Gagal memperbarui data", "error");
    }
  };

  const handleEditRecord = (record: RefuelRecord) => {
    setEditingRecord(record);
    setShowLogForm(true);
  };

  const handleDeleteRecord = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteRecord(recordToDelete);
      addToast("Catatan berhasil dihapus", "success");
      setRecordToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.fuelType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterFuelType === "all" || record.fuelType === filterFuelType;
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-brutalist-charcoal halftone-bg">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="brutalist-border-b border-b-4 border-black bg-brutalist-charcoal sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-brutalist-yellow">
                BBM TRACKER
              </h1>
              <p className="font-body text-brutalist-cream/70 text-xs sm:text-sm">
                Kaltim
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sync Status */}
              {isSyncing && (
                <div className="flex items-center gap-2 text-brutalist-green">
                  <div className="w-2 h-2 rounded-full bg-brutalist-green animate-pulse"></div>
                  <span className="font-body text-sm hidden md:inline">Syncing...</span>
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isSyncing}
                className="brutalist-border brutalist-shadow bg-brutalist-cyan p-2 md:p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-brutalist-charcoal ${isSyncing ? "animate-spin" : ""}`} strokeWidth={3} />
              </button>

              {/* User Menu */}
              <button
                onClick={signOut}
                className="brutalist-border brutalist-shadow-pink bg-brutalist-pink p-2 md:p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 active:scale-95"
              >
                <LogOut className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Offline Banner */}
          <AnimatePresence>
            {!isOnline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="brutalist-border bg-brutalist-pink/20 overflow-hidden"
              >
                <div className="p-3 flex items-center gap-3">
                  <WifiOff className="w-5 h-5 text-brutalist-pink" strokeWidth={3} />
                  <div className="flex-1">
                    <p className="font-body text-brutalist-cream text-sm">
                      Mode Offline
                    </p>
                    {lastSyncTime && (
                      <p className="font-body text-brutalist-cream/50 text-xs">
                        Sync terakhir: {new Date(lastSyncTime).toLocaleTimeString("id-ID")}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        {/* Region Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <label className="font-body text-brutalist-cream text-sm sm:text-base mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
            Wilayah
          </label>
          <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as Region)}>
            <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-base sm:text-lg p-3 sm:p-4 h-auto w-full sm:max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
              <SelectItem value="Kalimantan Timur" className="font-body text-base sm:text-lg">Kalimantan Timur</SelectItem>
              <SelectItem value="DKI Jakarta" className="font-body text-base sm:text-lg">DKI Jakarta</SelectItem>
              <SelectItem value="Jawa Barat" className="font-body text-base sm:text-lg">Jawa Barat</SelectItem>
              <SelectItem value="Jawa Tengah" className="font-body text-base sm:text-lg">Jawa Tengah</SelectItem>
              <SelectItem value="Jawa Timur" className="font-body text-base sm:text-lg">Jawa Timur</SelectItem>
              <SelectItem value="Sumatera Utara" className="font-body text-base sm:text-lg">Sumatera Utara</SelectItem>
              <SelectItem value="Sumatera Selatan" className="font-body text-base sm:text-lg">Sumatera Selatan</SelectItem>
              <SelectItem value="Sulawesi Selatan" className="font-body text-base sm:text-lg">Sulawesi Selatan</SelectItem>
              <SelectItem value="Bali" className="font-body text-base sm:text-lg">Bali</SelectItem>
              <SelectItem value="Papua" className="font-body text-base sm:text-lg">Papua</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-5 sm:flex gap-1 sm:gap-2 mb-6"
        >
          <button
            onClick={() => setViewMode("prices")}
            className={`brutalist-border px-2 sm:px-6 py-3 font-body font-bold transition-all duration-75 hover:translate-x-1 hover:translate-y-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 ${viewMode === "prices"
              ? "bg-brutalist-yellow text-brutalist-charcoal brutalist-shadow-yellow"
              : "bg-brutalist-charcoal text-brutalist-cream brutalist-shadow"
              }`}
          >
            <FuelIcon className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="hidden sm:inline">HARGA BBM</span>
          </button>
          <button
            onClick={() => setViewMode("history")}
            className={`brutalist-border px-2 sm:px-6 py-3 font-body font-bold transition-all duration-75 hover:translate-x-1 hover:translate-y-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 ${viewMode === "history"
              ? "bg-brutalist-cyan text-brutalist-charcoal brutalist-shadow-cyan"
              : "bg-brutalist-charcoal text-brutalist-cream brutalist-shadow"
              }`}
          >
            <History className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="hidden sm:inline">RIWAYAT</span>
          </button>
          <button
            onClick={() => setViewMode("stats")}
            className={`brutalist-border px-2 sm:px-6 py-3 font-body font-bold transition-all duration-75 hover:translate-x-1 hover:translate-y-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 ${viewMode === "stats"
              ? "bg-brutalist-pink text-brutalist-charcoal brutalist-shadow-pink"
              : "bg-brutalist-charcoal text-brutalist-cream brutalist-shadow"
              }`}
          >
            <TrendingUp className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="hidden sm:inline">STATISTIK</span>
          </button>
          <button
            onClick={() => setViewMode("vehicles")}
            className={`brutalist-border px-2 sm:px-6 py-3 font-body font-bold transition-all duration-75 hover:translate-x-1 hover:translate-y-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 ${viewMode === "vehicles"
              ? "bg-brutalist-green text-brutalist-charcoal brutalist-shadow"
              : "bg-brutalist-charcoal text-brutalist-cream brutalist-shadow"
              }`}
          >
            <Car className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="hidden sm:inline">KENDARAAN</span>
          </button>
          <button
            onClick={() => setViewMode("backup")}
            className={`brutalist-border px-2 sm:px-6 py-3 font-body font-bold transition-all duration-75 hover:translate-x-1 hover:translate-y-1 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 ${viewMode === "backup"
              ? "bg-brutalist-yellow/80 text-brutalist-charcoal brutalist-shadow-yellow"
              : "bg-brutalist-charcoal text-brutalist-cream brutalist-shadow"
              }`}
          >
            <Database className="w-5 h-5 flex-shrink-0" strokeWidth={3} />
            <span className="hidden sm:inline">BACKUP</span>
          </button>
        </motion.div>

        {/* Content */}
        <div className="pb-24">
          <AnimatePresence mode="wait">
            {viewMode === "prices" && (
              <motion.div
                key="prices"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPrices.map((price) => (
                  <motion.div key={price.id} variants={itemVariants}>
                    <FuelPriceCard price={price} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {viewMode === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brutalist-cream/50" strokeWidth={3} />
                    <Input
                      type="text"
                      placeholder="Cari SPBU atau jenis BBM..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body pl-12 py-6 text-lg"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    {["all", "Pertalite", "Pertamax", "Pertamax Turbo", "Solar"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterFuelType(type as FuelType | "all")}
                        className={`brutalist-border px-4 py-2 font-body text-sm whitespace-nowrap transition-all duration-75 ${filterFuelType === type
                          ? "bg-brutalist-yellow text-brutalist-charcoal"
                          : "bg-brutalist-charcoal text-brutalist-cream"
                          }`}
                      >
                        {type === "all" ? "SEMUA" : type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Records List */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {filteredRecords.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="Belum Ada Catatan"
                      description={
                        searchQuery || filterFuelType !== "all"
                          ? "Tidak ada catatan yang sesuai dengan filter Anda"
                          : "Mulai catat pengeluaran BBM Anda dengan menekan tombol + di bawah"
                      }
                      action={
                        searchQuery || filterFuelType !== "all"
                          ? undefined
                          : {
                            label: "TAMBAH CATATAN",
                            onClick: () => {
                              setEditingRecord(undefined);
                              setShowLogForm(true);
                            },
                          }
                      }
                    />
                  ) : (
                    filteredRecords.map((record) => (
                      <motion.div key={record.id} variants={itemVariants}>
                        <RefuelRecordCard
                          record={record}
                          onEdit={handleEditRecord}
                          onDelete={handleDeleteRecord}
                        />
                      </motion.div>
                    ))
                  )}
                </motion.div>
              </motion.div>
            )}

            {viewMode === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <StatisticsPanel />
              </motion.div>
            )}

            {viewMode === "vehicles" && (
              <motion.div
                key="vehicles"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <VehicleManager />
              </motion.div>
            )}

            {viewMode === "backup" && (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <BackupManager />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setEditingRecord(undefined);
          setShowLogForm(true);
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 brutalist-border brutalist-shadow-yellow bg-brutalist-yellow p-3 sm:p-5 z-30 pb-safe"
      >
        <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-brutalist-charcoal" strokeWidth={3} />
      </motion.button>

      {/* Log Form Modal */}
      <AnimatePresence>
        {showLogForm && (
          <RefuelLogForm
            onClose={() => {
              setShowLogForm(false);
              setEditingRecord(undefined);
            }}
            onSuccess={(message) => addToast(message, "success")}
            editRecord={editingRecord}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
