import { useFuel } from "@/contexts/FuelContext";
import { TrendingUp, Droplet, DollarSign, Calendar } from "lucide-react";
import { useMemo } from "react";

export default function StatisticsPanel() {
  const { records } = useFuel();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRecords = records.filter((r) => {
      const recordDate = new Date(r.date);
      return (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    const totalSpent = monthRecords.reduce((sum, r) => sum + r.totalCost, 0);
    const totalLiters = monthRecords.reduce((sum, r) => sum + r.liters, 0);
    const averagePrice = totalLiters > 0 ? totalSpent / totalLiters : 0;

    return {
      totalSpent,
      totalLiters,
      averagePrice,
      refuelCount: monthRecords.length,
    };
  }, [records]);

  const statCards = [
    {
      icon: DollarSign,
      label: "Total Pengeluaran",
      value: `Rp ${stats.totalSpent.toLocaleString("id-ID")}`,
      color: "brutalist-pink",
      shadow: "brutalist-shadow-pink",
    },
    {
      icon: Droplet,
      label: "Total Liter",
      value: `${stats.totalLiters.toFixed(2)}L`,
      color: "brutalist-cyan",
      shadow: "brutalist-shadow-cyan",
    },
    {
      icon: TrendingUp,
      label: "Rata-rata Harga",
      value: `Rp ${Math.round(stats.averagePrice).toLocaleString("id-ID")}/L`,
      color: "brutalist-yellow",
      shadow: "brutalist-shadow-yellow",
    },
    {
      icon: Calendar,
      label: "Jumlah Isi Ulang",
      value: `${stats.refuelCount}x`,
      color: "brutalist-green",
      shadow: "brutalist-shadow",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-3xl text-brutalist-cream mb-6">
        STATISTIK BULAN INI
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`brutalist-border ${stat.shadow} bg-brutalist-charcoal p-6`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 brutalist-border bg-${stat.color}`}>
                <stat.icon className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
              </div>
            </div>
            <p className="font-body text-brutalist-cream/70 text-sm mb-2">
              {stat.label}
            </p>
            <p className={`font-mono text-3xl text-${stat.color} font-bold`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
