import { RefuelRecord } from "@/types/fuel";
import { Fuel, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

interface RefuelRecordCardProps {
  record: RefuelRecord;
  onEdit: (record: RefuelRecord) => void;
  onDelete: (id: string) => void;
}

const fuelColors = {
  Pertalite: "brutalist-yellow",
  Pertamax: "brutalist-pink",
  "Pertamax Turbo": "brutalist-pink",
  Solar: "brutalist-cyan",
  Dexlite: "brutalist-green",
  "Pertamax Green 95": "brutalist-green",
};

export default function RefuelRecordCard({
  record,
  onEdit,
  onDelete,
}: RefuelRecordCardProps) {
  const [showActions, setShowActions] = useState(false);
  const colorClass = fuelColors[record.fuelType];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="brutalist-border brutalist-shadow bg-brutalist-charcoal p-4 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 brutalist-border bg-${colorClass} flex-shrink-0`}>
              <Fuel className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-display text-lg text-${colorClass}`}>
                  {record.fuelType}
                </h4>
                {!record.synced && (
                  <span className="w-2 h-2 rounded-full bg-brutalist-green animate-pulse"></span>
                )}
              </div>
              <p className="font-body text-brutalist-cream/70 text-sm mb-2">
                {record.station}
              </p>
              <div className="flex items-center gap-4 text-xs font-body text-brutalist-cream/60">
                <span>
                  {new Date(record.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>{record.liters}L</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-2xl text-brutalist-cream font-bold">
              {record.totalCost.toLocaleString("id-ID")}
            </p>
            <p className="font-body text-brutalist-cream/50 text-xs mt-1">
              @{record.pricePerLiter.toLocaleString("id-ID")}/L
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div
        className={`absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4 transition-all duration-300 ${
          showActions ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <button
          onClick={() => onEdit(record)}
          className="brutalist-border brutalist-shadow-cyan bg-brutalist-cyan p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 active:scale-95"
        >
          <Edit2 className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
        </button>
        <button
          onClick={() => onDelete(record.id)}
          className="brutalist-border brutalist-shadow-pink bg-brutalist-pink p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 active:scale-95"
        >
          <Trash2 className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
