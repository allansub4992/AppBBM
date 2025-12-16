import { useState, useRef } from "react";
import { FuelType, StationChain, Vehicle } from "@/types/fuel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, X, Image as ImageIcon, Trash2, QrCode, Loader2 } from "lucide-react";
import { useFuel } from "@/contexts/FuelContext";
import { useAuth } from "@/contexts/AuthContext";
import QRScanner from "./QRScanner";
import { uploadReceiptImage } from "@/services/imageStorage";

interface RefuelLogFormProps {
  onClose: () => void;
  onSuccess?: (message: string) => void;
  editRecord?: {
    id: string;
    date: Date;
    station: StationChain;
    fuelType: FuelType;
    liters: number;
    totalCost: number;
    pricePerLiter: number;
    vehicleId?: string;
  } | undefined;
}

export default function RefuelLogForm({ onClose, onSuccess, editRecord }: RefuelLogFormProps) {
  const { addRecord, updateRecord, prices, vehicles } = useFuel();
  const { user } = useAuth();

  const [date, setDate] = useState(
    editRecord?.date ? new Date(editRecord.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [station, setStation] = useState<StationChain>(editRecord?.station || "Pertamina");
  const [fuelType, setFuelType] = useState<FuelType>(editRecord?.fuelType || "Pertalite");
  const [liters, setLiters] = useState(editRecord?.liters ? Math.round(editRecord.liters).toString() : "");
  const [totalCost, setTotalCost] = useState(editRecord?.totalCost.toString() || "");
  const [manualPrice, setManualPrice] = useState(editRecord?.pricePerLiter.toString() || "");
  const [vehicleId, setVehicleId] = useState<string>(editRecord?.vehicleId || "");
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPrice = prices?.find(
    (p) => p.fuelType === fuelType && p.station === station
  );

  const handleLitersChange = (value: string) => {
    setLiters(value);
    if (value && currentPrice) {
      const calculatedCost = parseFloat(value) * currentPrice.price;
      setTotalCost(calculatedCost.toString());
    }
  };

  // Handle camera capture - works on both web and mobile
  const handleCameraCapture = async () => {
    // Check if running in native app (WebView)
    if ((window as any).isNativeApp && (window as any).requestCameraPermission) {
      (window as any).requestCameraPermission();
    }

    // Trigger file input click (with camera capture on mobile)
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection from camera or gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCapturing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhoto(reader.result as string);
        setIsCapturing(false);
      };
      reader.onerror = () => {
        setIsCapturing(false);
        alert("Gagal membaca file");
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove captured photo
  const handleRemovePhoto = () => {
    setReceiptPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle QR scan result
  const handleQRScan = (data: string) => {
    // Try to parse QR data - format may vary by gas station
    console.log('QR Data:', data);
    // Attempt to extract data if it's JSON or structured
    try {
      const parsed = JSON.parse(data);
      if (parsed.liters) setLiters(Math.round(parsed.liters).toString());
      if (parsed.total) setTotalCost(parsed.total.toString());
      if (parsed.station) {
        const stationMap: Record<string, StationChain> = {
          'pertamina': 'Pertamina',
          'shell': 'Shell',
          'bp': 'BP',
          'total': 'Total',
          'vivo': 'Vivo'
        };
        const mappedStation = stationMap[parsed.station.toLowerCase()];
        if (mappedStation) setStation(mappedStation);
      }
    } catch {
      // If not JSON, just log it
      console.log('QR contains non-JSON data:', data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const litersNum = Math.round(parseFloat(liters));
    const costNum = parseFloat(totalCost);
    const pricePerLiter = manualPrice ? parseFloat(manualPrice) : costNum / litersNum;

    // Upload receipt photo to Supabase if present
    let receiptPhotoUrl: string | undefined;
    if (receiptPhoto && user) {
      setIsUploading(true);
      const { url, error } = await uploadReceiptImage(receiptPhoto, user.uid);
      if (url) {
        receiptPhotoUrl = url;
      } else {
        console.error('Failed to upload receipt:', error);
      }
      setIsUploading(false);
    }

    if (editRecord) {
      updateRecord(editRecord.id, {
        date: new Date(date),
        station,
        fuelType,
        liters: litersNum,
        totalCost: costNum,
        pricePerLiter,
        vehicleId: vehicleId || undefined,
        receiptPhoto: receiptPhotoUrl,
      });
      onSuccess?.("Catatan berhasil diperbarui");
    } else {
      addRecord({
        date: new Date(date),
        station,
        fuelType,
        liters: litersNum,
        totalCost: costNum,
        pricePerLiter,
        vehicleId: vehicleId || undefined,
        receiptPhoto: receiptPhotoUrl,
      });
      onSuccess?.("Catatan berhasil ditambahkan");
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg brutalist-border brutalist-shadow-yellow bg-brutalist-charcoal p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl text-brutalist-yellow">
            {editRecord ? "EDIT REFUEL" : "LOG REFUEL"}
          </h2>
          <button
            onClick={onClose}
            className="brutalist-border bg-brutalist-pink p-2 hover:scale-95 transition-transform"
          >
            <X className="w-6 h-6 text-brutalist-charcoal" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <Label className="font-body text-brutalist-cream text-base mb-2 block">
              Tanggal
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto"
              required
            />
          </div>

          {/* Station */}
          <div>
            <Label className="font-body text-brutalist-cream text-base mb-2 block">
              SPBU
            </Label>
            <Select value={station} onValueChange={(v) => setStation(v as StationChain)}>
              <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
                <SelectItem value="Pertamina" className="font-body text-lg">Pertamina</SelectItem>
                <SelectItem value="Shell" className="font-body text-lg">Shell</SelectItem>
                <SelectItem value="BP" className="font-body text-lg">BP</SelectItem>
                <SelectItem value="Total" className="font-body text-lg">Total</SelectItem>
                <SelectItem value="Vivo" className="font-body text-lg">Vivo</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Vehicle Selection */}
          {vehicles?.length > 0 && (
            <div>
              <Label className="font-body text-brutalist-cream text-base mb-2 block">
                Kendaraan (Opsional)
              </Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body text-lg p-4 h-auto">
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent className="brutalist-border bg-brutalist-charcoal text-brutalist-cream">
                  <SelectItem value="" className="font-body text-lg">Tidak ada</SelectItem>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id} className="font-body text-lg">
                      {vehicle.brand} {vehicle.model} {vehicle.licensePlate ? `(${vehicle.licensePlate})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Liters */}
          <div>
            <Label className="font-body text-brutalist-cream text-base mb-2 block">
              Liter
            </Label>
            <Input
              type="number"
              step="1"
              min="1"
              value={liters}
              onChange={(e) => handleLitersChange(e.target.value)}
              className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-mono text-2xl p-4 h-auto"
              placeholder="0"
              required
            />
          </div>

          {/* Total Cost */}
          <div>
            <Label className="font-body text-brutalist-cream text-base mb-2 block">
              Total Biaya (Rp)
            </Label>
            <Input
              type="number"
              step="1"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-mono text-2xl p-4 h-auto"
              placeholder="0"
              required
            />
            {currentPrice && liters && (
              <p className="font-body text-brutalist-cream/50 text-sm mt-2">
                Harga saat ini: Rp {currentPrice.price.toLocaleString("id-ID")}/L
              </p>
            )}
          </div>

          {/* Receipt Photo */}
          <div>
            <Label className="font-body text-brutalist-cream text-base mb-2 block">
              Foto Struk (Opsional)
            </Label>

            {/* Hidden file input for camera/gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {receiptPhoto ? (
              // Show captured photo preview
              <div className="relative">
                <div className="brutalist-border overflow-hidden">
                  <img
                    src={receiptPhoto}
                    alt="Struk"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="flex-1 brutalist-border brutalist-shadow-cyan bg-brutalist-charcoal p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5 text-brutalist-cyan" strokeWidth={3} />
                    <span className="font-body text-brutalist-cyan text-sm">Ganti Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="brutalist-border brutalist-shadow-pink bg-brutalist-pink p-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75"
                  >
                    <Trash2 className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ) : (
              // Show capture buttons
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  disabled={isCapturing}
                  className="flex-1 brutalist-border brutalist-shadow-cyan bg-brutalist-charcoal p-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75 disabled:opacity-50"
                >
                  {isCapturing ? (
                    <>
                      <div className="w-6 h-6 border-4 border-brutalist-cyan border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                      <span className="font-body text-brutalist-cyan text-sm">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-brutalist-cyan mx-auto mb-1" strokeWidth={3} />
                      <span className="font-body text-brutalist-cyan text-sm">Foto Struk</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  className="flex-1 brutalist-border brutalist-shadow-green bg-brutalist-charcoal p-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-75"
                >
                  <QrCode className="w-6 h-6 text-brutalist-green mx-auto mb-1" strokeWidth={3} />
                  <span className="font-body text-brutalist-green text-sm">Scan QR</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading}
            className="w-full brutalist-border brutalist-shadow-yellow bg-brutalist-yellow hover:bg-brutalist-yellow/90 text-brutalist-charcoal font-display text-xl py-6 h-auto transition-all duration-75 hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-[0.97] disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Mengunggah...
              </>
            ) : (
              editRecord ? "UPDATE" : "SIMPAN"
            )}
          </Button>
        </form>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </div>
  );
}
