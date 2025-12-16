import { useState, useMemo } from "react";
import { useFuel } from "@/contexts/FuelContext";
import { useAuth } from "@/contexts/AuthContext";
import FuelPriceCard from "./FuelPriceCard";
import RefuelRecordCard from "./RefuelRecordCard";
import RefuelLogForm from "./RefuelLogForm";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ToastContainer from "./ToastContainer";
import EmptyState from "./EmptyState";
import AccountPage from "./AccountPage";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, WifiOff, History, Fuel as FuelIcon, Search, FileText, MapPin, Home, User, BarChart3 } from "lucide-react";
import { RefuelRecord, FuelType, Region } from "@/types/fuel";
import { useToastNotification } from "@/hooks/useToast";

type ViewMode = "home" | "prices" | "history" | "account";

export default function Dashboard() {
  const { user } = useAuth();
  const { prices, records, isOnline, isSyncing, lastSyncTime, refreshPrices, syncData, deleteRecord, selectedRegion, setSelectedRegion, vehicles } = useFuel();
  const { toasts, addToast, removeToast } = useToastNotification();

  const [showLogForm, setShowLogForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RefuelRecord | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFuelType, setFilterFuelType] = useState<FuelType | "all">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '6m' | '1y'>('30d');

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

  // Calculate quick stats for home
  const thisMonthRecords = records.filter(r => {
    const now = new Date();
    const recordDate = new Date(r.date);
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });
  const totalSpentThisMonth = thisMonthRecords.reduce((sum, r) => sum + r.totalCost, 0);
  const totalLitersThisMonth = thisMonthRecords.reduce((sum, r) => sum + Math.round(r.liters), 0);

  // Time range options
  const timeRangeOptions = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: '6m', label: '6 Bulan' },
    { value: '1y', label: '1 Tahun' },
  ];

  // Calculate chart data based on time range
  const chartData = useMemo(() => {
    const now = new Date();
    const data: { label: string; spending: number; liters: number }[] = [];

    let daysBack: number;
    let groupBy: 'day' | 'week' | 'month';

    switch (timeRange) {
      case '7d':
        daysBack = 7;
        groupBy = 'day';
        break;
      case '30d':
        daysBack = 30;
        groupBy = 'day';
        break;
      case '90d':
        daysBack = 90;
        groupBy = 'week';
        break;
      case '6m':
        daysBack = 180;
        groupBy = 'month';
        break;
      case '1y':
        daysBack = 365;
        groupBy = 'month';
        break;
      default:
        daysBack = 30;
        groupBy = 'day';
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);

    const filteredRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= startDate && recordDate <= now;
    });

    if (groupBy === 'day') {
      // Group by day (show last N days)
      const days = timeRange === '7d' ? 7 : 10; // Show 7 or 10 data points
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayRecords = filteredRecords.filter(r => {
          const rd = new Date(r.date);
          return rd.toDateString() === date.toDateString();
        });
        data.push({
          label: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          spending: dayRecords.reduce((sum, r) => sum + r.totalCost, 0),
          liters: dayRecords.reduce((sum, r) => sum + Math.round(r.liters), 0)
        });
      }
    } else if (groupBy === 'week') {
      // Group by week
      const weeks = 12;
      for (let i = weeks - 1; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekRecords = filteredRecords.filter(r => {
          const rd = new Date(r.date);
          return rd >= weekStart && rd <= weekEnd;
        });
        data.push({
          label: `W${weeks - i}`,
          spending: weekRecords.reduce((sum, r) => sum + r.totalCost, 0),
          liters: weekRecords.reduce((sum, r) => sum + Math.round(r.liters), 0)
        });
      }
    } else {
      // Group by month
      const months = timeRange === '6m' ? 6 : 12;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthRecords = filteredRecords.filter(r => {
          const rd = new Date(r.date);
          return rd.getMonth() === date.getMonth() && rd.getFullYear() === date.getFullYear();
        });
        data.push({
          label: monthNames[date.getMonth()],
          spending: monthRecords.reduce((sum, r) => sum + r.totalCost, 0),
          liters: monthRecords.reduce((sum, r) => sum + Math.round(r.liters), 0)
        });
      }
    }

    return data;
  }, [records, timeRange]);

  const maxSpending = Math.max(...chartData.map(m => m.spending), 1);

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
    <div className="min-h-screen bg-brutalist-charcoal halftone-bg pb-24">
      {/* Header - Simplified */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="brutalist-border-b border-b-4 border-black bg-brutalist-charcoal sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brutalist-border bg-brutalist-yellow flex items-center justify-center">
                <FuelIcon className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
              </div>
              <div>
                <h1 className="font-display text-xl text-brutalist-yellow">
                  BBM TRACKER
                </h1>
                <p className="font-body text-brutalist-cream/50 text-xs">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Online/Offline Status */}
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-brutalist-green' : 'bg-brutalist-pink'}`}></div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isSyncing}
                className="p-2 text-brutalist-cream/70 hover:text-brutalist-cyan transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} strokeWidth={2} />
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
                className="mt-2 bg-brutalist-pink/20 px-3 py-2 flex items-center gap-2"
              >
                <WifiOff className="w-4 h-4 text-brutalist-pink" strokeWidth={2} />
                <span className="font-body text-brutalist-cream text-xs">Mode Offline</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {/* HOME VIEW */}
          {viewMode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  variants={itemVariants}
                  className="brutalist-border bg-brutalist-yellow/10 p-3 sm:p-4"
                >
                  <p className="font-body text-brutalist-cream/60 text-[10px] sm:text-xs mb-1">Bulan Ini</p>
                  <p className="font-display text-lg sm:text-2xl text-brutalist-yellow">
                    Rp {totalSpentThisMonth.toLocaleString('id-ID')}
                  </p>
                  <p className="font-body text-brutalist-cream/50 text-[10px] sm:text-xs mt-1">
                    {thisMonthRecords.length} transaksi
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="brutalist-border bg-brutalist-cyan/10 p-3 sm:p-4"
                >
                  <p className="font-body text-brutalist-cream/60 text-[10px] sm:text-xs mb-1">Total Liter</p>
                  <p className="font-display text-lg sm:text-2xl text-brutalist-cyan">
                    {totalLitersThisMonth} L
                  </p>
                  <p className="font-body text-brutalist-cream/50 text-[10px] sm:text-xs mt-1">
                    {vehicles.length} kendaraan
                  </p>
                </motion.div>
              </div>

              {/* Spending Chart with Time Range */}
              <motion.div
                variants={itemVariants}
                className="brutalist-border bg-brutalist-charcoal p-3 sm:p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-brutalist-pink" strokeWidth={2} />
                    <h3 className="font-body text-brutalist-cream/80 text-xs sm:text-sm font-bold">STATISTIK PENGELUARAN</h3>
                  </div>
                  {/* Time Range Selector */}
                  <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                    <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-xs p-1 h-7 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
                      {timeRangeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="font-body text-xs">{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Line Chart */}
                <div className="relative h-28 sm:h-32">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                    {/* Line path */}
                    {chartData.length > 1 && (
                      <>
                        {/* Area fill */}
                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          transition={{ duration: 0.5 }}
                          d={`
                            M 0 100
                            ${chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1)) * 400;
                            const y = 100 - (d.spending / maxSpending) * 90;
                            return `L ${x} ${y}`;
                          }).join(' ')}
                            L 400 100
                            Z
                          `}
                          fill="url(#lineGradient)"
                        />
                        {/* Line */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                          d={chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1)) * 400;
                            const y = 100 - (d.spending / maxSpending) * 90;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#FF6B9D"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Data points */}
                        {chartData.map((d, i) => {
                          const x = (i / (chartData.length - 1)) * 400;
                          const y = 100 - (d.spending / maxSpending) * 90;
                          return (
                            <motion.circle
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              cx={x}
                              cy={y}
                              r="4"
                              fill={i === chartData.length - 1 ? "#FFE156" : "#FF6B9D"}
                              stroke="#1A1A1A"
                              strokeWidth="2"
                            />
                          );
                        })}
                      </>
                    )}
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF6B9D" />
                        <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between mt-1 overflow-x-auto">
                  {chartData.filter((_, i) => chartData.length <= 7 || i % Math.ceil(chartData.length / 7) === 0 || i === chartData.length - 1).map((d, i) => (
                    <span key={i} className="text-[8px] sm:text-[10px] font-body text-brutalist-cream/50 whitespace-nowrap">
                      {d.label}
                    </span>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-brutalist-cream/10 flex justify-between text-[10px] sm:text-xs font-body text-brutalist-cream/50">
                  <span>Total: Rp {chartData.reduce((s, m) => s + m.spending, 0).toLocaleString('id-ID')}</span>
                  <span>{chartData.reduce((s, m) => s + m.liters, 0)} L</span>
                </div>
              </motion.div>

              {/* Region Selector */}
              <div className="brutalist-border bg-brutalist-charcoal p-4">
                <label className="font-body text-brutalist-cream/60 text-xs mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={2} />
                  Wilayah Harga BBM
                </label>
                <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as Region)}>
                  <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-base p-3 h-auto w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
                    <SelectItem value="Kalimantan Timur" className="font-body">Kalimantan Timur</SelectItem>
                    <SelectItem value="DKI Jakarta" className="font-body">DKI Jakarta</SelectItem>
                    <SelectItem value="Jawa Barat" className="font-body">Jawa Barat</SelectItem>
                    <SelectItem value="Jawa Tengah" className="font-body">Jawa Tengah</SelectItem>
                    <SelectItem value="Jawa Timur" className="font-body">Jawa Timur</SelectItem>
                    <SelectItem value="Sumatera Utara" className="font-body">Sumatera Utara</SelectItem>
                    <SelectItem value="Sumatera Selatan" className="font-body">Sumatera Selatan</SelectItem>
                    <SelectItem value="Sulawesi Selatan" className="font-body">Sulawesi Selatan</SelectItem>
                    <SelectItem value="Bali" className="font-body">Bali</SelectItem>
                    <SelectItem value="Papua" className="font-body">Papua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recent Transactions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg text-brutalist-cream">TRANSAKSI TERAKHIR</h2>
                  <button
                    onClick={() => setViewMode("history")}
                    className="font-body text-xs text-brutalist-cyan hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>

                {records.length === 0 ? (
                  <div className="brutalist-border bg-brutalist-charcoal/50 p-6 text-center">
                    <FileText className="w-10 h-10 text-brutalist-cream/30 mx-auto mb-2" />
                    <p className="font-body text-brutalist-cream/50 text-sm">Belum ada catatan</p>
                    <button
                      onClick={() => setShowLogForm(true)}
                      className="mt-3 brutalist-border bg-brutalist-yellow px-4 py-2 font-body text-sm text-brutalist-charcoal"
                    >
                      + Tambah Catatan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.slice(0, 3).map((record) => (
                      <RefuelRecordCard
                        key={record.id}
                        record={record}
                        onEdit={handleEditRecord}
                        onDelete={handleDeleteRecord}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PRICES VIEW */}
          {viewMode === "prices" && (
            <motion.div
              key="prices"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h2 className="font-display text-xl text-brutalist-yellow mb-4">HARGA BBM - {selectedRegion}</h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredPrices.length === 0 ? (
                  <div className="brutalist-border bg-brutalist-charcoal/50 p-6 text-center">
                    <FuelIcon className="w-10 h-10 text-brutalist-cream/30 mx-auto mb-2" />
                    <p className="font-body text-brutalist-cream/50 text-sm">Tidak ada data harga BBM</p>
                  </div>
                ) : (
                  filteredPrices.map((price) => (
                    <motion.div key={price.id} variants={itemVariants}>
                      <FuelPriceCard price={price} />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* HISTORY VIEW */}
          {viewMode === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display text-xl text-brutalist-cyan mb-4">RIWAYAT PENGISIAN</h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutalist-cream/50" strokeWidth={2} />
                <Input
                  type="text"
                  placeholder="Cari SPBU atau jenis BBM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body pl-10 py-3 text-sm"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                {["all", "Pertalite", "Pertamax", "Solar"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterFuelType(type as FuelType | "all")}
                    className={`brutalist-border px-3 py-1 font-body text-xs whitespace-nowrap transition-all ${filterFuelType === type
                      ? "bg-brutalist-cyan text-brutalist-charcoal"
                      : "bg-brutalist-charcoal text-brutalist-cream"
                      }`}
                  >
                    {type === "all" ? "SEMUA" : type.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Records */}
              <div className="space-y-3">
                {filteredRecords.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Belum Ada Catatan"
                    description={
                      searchQuery || filterFuelType !== "all"
                        ? "Tidak ada catatan yang sesuai dengan filter"
                        : "Mulai catat pengeluaran BBM Anda"
                    }
                    action={
                      searchQuery || filterFuelType !== "all"
                        ? undefined
                        : {
                          label: "TAMBAH CATATAN",
                          onClick: () => setShowLogForm(true),
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
              </div>
            </motion.div>
          )}

          {/* ACCOUNT VIEW */}
          {viewMode === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AccountPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brutalist-charcoal border-t-4 border-black z-50">
        <div className="flex justify-around items-center py-2 px-2 sm:px-4 safe-area-pb">
          <button
            onClick={() => setViewMode("home")}
            className={`flex flex-col items-center py-2 px-2 sm:px-4 transition-all ${viewMode === "home" ? "text-brutalist-yellow" : "text-brutalist-cream/50"
              }`}
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={viewMode === "home" ? 3 : 2} />
            <span className="font-body text-[9px] sm:text-[10px] mt-1">Home</span>
          </button>

          <button
            onClick={() => setViewMode("prices")}
            className={`flex flex-col items-center py-2 px-2 sm:px-4 transition-all ${viewMode === "prices" ? "text-brutalist-yellow" : "text-brutalist-cream/50"
              }`}
          >
            <FuelIcon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={viewMode === "prices" ? 3 : 2} />
            <span className="font-body text-[9px] sm:text-[10px] mt-1">Harga</span>
          </button>

          {/* Center FAB Button */}
          <button
            onClick={() => setShowLogForm(true)}
            className="brutalist-border bg-brutalist-yellow p-3 sm:p-4 -mt-6 sm:-mt-8 shadow-lg"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-brutalist-charcoal" strokeWidth={3} />
          </button>

          <button
            onClick={() => setViewMode("history")}
            className={`flex flex-col items-center py-2 px-2 sm:px-4 transition-all ${viewMode === "history" ? "text-brutalist-cyan" : "text-brutalist-cream/50"
              }`}
          >
            <History className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={viewMode === "history" ? 3 : 2} />
            <span className="font-body text-[9px] sm:text-[10px] mt-1">Riwayat</span>
          </button>

          <button
            onClick={() => setViewMode("account")}
            className={`flex flex-col items-center py-2 px-2 sm:px-4 transition-all ${viewMode === "account" ? "text-brutalist-green" : "text-brutalist-cream/50"
              }`}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={viewMode === "account" ? 3 : 2} />
            <span className="font-body text-[9px] sm:text-[10px] mt-1">Akun</span>
          </button>
        </div>
      </nav>

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

