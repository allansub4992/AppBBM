import { useFuel } from "@/contexts/FuelContext";
import { Download, Save, AlertTriangle, Database, Cloud } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function BackupManager() {
    const { downloadBackup, isSyncing, lastSyncTime, records, vehicles, prices } = useFuel();
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="brutalist-border bg-brutalist-pink/20 p-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-12 h-12 text-brutalist-pink mb-4" strokeWidth={3} />
                <h3 className="font-display text-2xl text-brutalist-cream mb-2">LOGIN DIPERLUKAN</h3>
                <p className="font-body text-brutalist-cream/70">
                    Anda harus login untuk mengakses fitur backup dan sinkronisasi data.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="brutalist-border bg-brutalist-charcoal p-6 brutalist-shadow">
                    <h3 className="font-display text-2xl text-brutalist-cyan mb-4 flex items-center gap-2">
                        <Cloud className="w-8 h-8" strokeWidth={3} />
                        STATUS DATA
                    </h3>

                    <div className="space-y-4 font-body text-brutalist-cream">
                        <div className="flex justify-between items-center border-b border-brutalist-cream/20 pb-2">
                            <span className="text-brutalist-cream/70">Total Catatan</span>
                            <span className="font-bold text-xl">{records.length}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brutalist-cream/20 pb-2">
                            <span className="text-brutalist-cream/70">Kendaraan</span>
                            <span className="font-bold text-xl">{vehicles.length}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-brutalist-cream/20 pb-2">
                            <span className="text-brutalist-cream/70">Harga BBM (Supabase)</span>
                            <span className="font-bold text-xl">{prices.length}</span>
                        </div>
                        <div className="pt-2">
                            <div className="text-sm text-brutalist-cream/50 mb-1">Terakhir Sinkronisasi</div>
                            <div className="font-mono text-brutalist-yellow">
                                {lastSyncTime ? lastSyncTime.toLocaleString("id-ID") : "Belum pernah"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="brutalist-border bg-brutalist-charcoal p-6 brutalist-shadow-pink">
                    <h3 className="font-display text-2xl text-brutalist-pink mb-4 flex items-center gap-2">
                        <Database className="w-8 h-8" strokeWidth={3} />
                        BACKUP DATA
                    </h3>

                    <p className="font-body text-brutalist-cream/70 mb-6">
                        Unduh salinan lengkap data Anda (Catatan, Kendaraan, dan Referensi Harga) dalam format JSON. File ini dapat digunakan untuk pemulihan data manual jika diperlukan.
                    </p>

                    <button
                        onClick={downloadBackup}
                        disabled={isSyncing}
                        className="w-full brutalist-border bg-brutalist-yellow text-brutalist-charcoal font-display text-xl py-4 flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none brutalist-shadow-yellow"
                    >
                        {isSyncing ? (
                            <>
                                <div className="w-6 h-6 border-4 border-brutalist-charcoal border-t-transparent rounded-full animate-spin"></div>
                                MEMPROSES...
                            </>
                        ) : (
                            <>
                                <Download className="w-6 h-6" strokeWidth={3} />
                                DOWNLOAD BACKUP JSON
                            </>
                        )}
                    </button>

                    <div className="mt-4 p-3 bg-brutalist-charcoal/50 border border-brutalist-cream/10 text-xs font-mono text-brutalist-cream/40">
                        * Data disimpan dalam format standar JSON. Simpan file ini di tempat yang aman.
                    </div>
                </div>
            </div>
        </div>
    );
}
