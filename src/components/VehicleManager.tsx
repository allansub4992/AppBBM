import { useState } from "react";
import { useFuel } from "@/contexts/FuelContext";
import { Vehicle, VehicleType, FuelType } from "@/types/fuel";
import { indonesianMotorcycles, indonesianCars } from "@/data/vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Bike, Plus, Edit2, Trash2, X } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

export default function VehicleManager() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useFuel();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const [vehicleType, setVehicleType] = useState<VehicleType>("motor");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("Pertalite");

  const vehicleData = vehicleType === "motor" ? indonesianMotorcycles : indonesianCars;
  const selectedBrandData = vehicleData.find((v) => v.brand === brand);

  const handleOpenForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleType(vehicle.type);
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year?.toString() || "");
      setLicensePlate(vehicle.licensePlate || "");
      setFuelType(vehicle.fuelType);
    } else {
      setEditingVehicle(undefined);
      setVehicleType("motor");
      setBrand("");
      setModel("");
      setYear("");
      setLicensePlate("");
      setFuelType("Pertalite");
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vehicleData = {
      type: vehicleType,
      brand,
      model,
      year: year ? parseInt(year) : undefined,
      licensePlate: licensePlate || undefined,
      fuelType,
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteVehicle(vehicleToDelete);
      setVehicleToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-brutalist-cream">
          KENDARAAN SAYA
        </h2>
        <button
          onClick={() => handleOpenForm()}
          className="brutalist-border brutalist-shadow-yellow bg-brutalist-yellow text-brutalist-charcoal p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75"
        >
          <Plus className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.length === 0 ? (
          <div className="col-span-full brutalist-border brutalist-shadow bg-brutalist-charcoal p-12 text-center">
            <p className="font-body text-brutalist-cream/50 text-lg">
              Belum ada kendaraan terdaftar
            </p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="brutalist-border brutalist-shadow bg-brutalist-charcoal p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 brutalist-border ${vehicle.type === "motor" ? "bg-brutalist-cyan" : "bg-brutalist-pink"}`}>
                    {vehicle.type === "motor" ? (
                      <Bike className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
                    ) : (
                      <Car className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-brutalist-cream">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    {vehicle.year && (
                      <p className="font-body text-brutalist-cream/70 text-sm">
                        Tahun {vehicle.year}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenForm(vehicle)}
                    className="brutalist-border bg-brutalist-cyan p-2 hover:scale-95 transition-transform"
                  >
                    <Edit2 className="w-4 h-4 text-brutalist-charcoal" strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="brutalist-border bg-brutalist-pink p-2 hover:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4 text-brutalist-charcoal" strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {vehicle.licensePlate && (
                  <div className="flex items-center gap-2">
                    <span className="font-body text-brutalist-cream/50 text-sm">Plat:</span>
                    <span className="font-mono text-brutalist-yellow font-bold">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-body text-brutalist-cream/50 text-sm">BBM:</span>
                  <span className="font-body text-brutalist-cream">{vehicle.fuelType}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg brutalist-border brutalist-shadow-yellow bg-brutalist-charcoal p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl text-brutalist-yellow">
                {editingVehicle ? "EDIT KENDARAAN" : "TAMBAH KENDARAAN"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="brutalist-border bg-brutalist-pink p-2 hover:scale-95 transition-transform"
              >
                <X className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Type */}
              <div>
                <Label className="font-body text-brutalist-cream text-base mb-2 block">
                  Jenis Kendaraan
                </Label>
                <Select value={vehicleType} onValueChange={(v) => {
                  setVehicleType(v as VehicleType);
                  setBrand("");
                  setModel("");
                }}>
                  <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
                    <SelectItem value="motor" className="font-body text-lg">Motor</SelectItem>
                    <SelectItem value="mobil" className="font-body text-lg">Mobil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div>
                <Label className="font-body text-brutalist-cream text-base mb-2 block">
                  Merek
                </Label>
                <Select value={brand} onValueChange={(v) => {
                  setBrand(v);
                  setModel("");
                }}>
                  <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto">
                    <SelectValue placeholder="Pilih merek" />
                  </SelectTrigger>
                  <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream max-h-60">
                    {vehicleData.map((v) => (
                      <SelectItem key={v.brand} value={v.brand} className="font-body text-lg">
                        {v.brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model */}
              {brand && (
                <div>
                  <Label className="font-body text-brutalist-cream text-base mb-2 block">
                    Model
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto">
                      <SelectValue placeholder="Pilih model" />
                    </SelectTrigger>
                    <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream max-h-60">
                      {selectedBrandData?.models.map((m) => (
                        <SelectItem key={m} value={m} className="font-body text-lg">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Year */}
              <div>
                <Label className="font-body text-brutalist-cream text-base mb-2 block">
                  Tahun (Opsional)
                </Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto"
                  placeholder="2024"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              {/* License Plate */}
              <div>
                <Label className="font-body text-brutalist-cream text-base mb-2 block">
                  Nomor Plat (Opsional)
                </Label>
                <Input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-mono text-lg p-4 h-auto"
                  placeholder="B 1234 XYZ"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <Label className="font-body text-brutalist-cream text-base mb-2 block">
                  Jenis BBM
                </Label>
                <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                  <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
                    <SelectItem value="Pertalite" className="font-body text-lg">Pertalite</SelectItem>
                    <SelectItem value="Pertamax" className="font-body text-lg">Pertamax</SelectItem>
                    <SelectItem value="Pertamax Turbo" className="font-body text-lg">Pertamax Turbo</SelectItem>
                    <SelectItem value="Solar" className="font-body text-lg">Solar</SelectItem>
                    <SelectItem value="Dexlite" className="font-body text-lg">Dexlite</SelectItem>
                    <SelectItem value="Pertamax Green 95" className="font-body text-lg">Pertamax Green 95</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!brand || !model}
                className="w-full brutalist-border brutalist-shadow-yellow bg-brutalist-yellow hover:bg-brutalist-yellow/90 text-brutalist-charcoal font-display text-xl py-6 h-auto transition-all duration-75 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.97] disabled:opacity-50"
              >
                {editingVehicle ? "UPDATE" : "SIMPAN"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
