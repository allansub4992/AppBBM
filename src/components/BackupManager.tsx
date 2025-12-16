import { useState, useEffect } from "react";
import { useFuel } from "@/contexts/FuelContext";
import { Download, Save, AlertTriangle, Database, Cloud, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { migrateSupabaseToFirebase, getBackupStatus, MigrationResult } from "@/services/migrationService";

export default function BackupManager() {
    const { downloadBackup, isSyncing, lastSyncTime, records, vehicles, prices, syncData } = useFuel();
    const { user } = useAuth();
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
    const [backupStatus, setBackupStatus] = useState<{ exists: boolean; timestamp: string | null; recordCount: number; priceCount: number }>({
        exists: false,
        timestamp: null,
        recordCount: 0,
        priceCount: 0
    });

    useEffect(() => {
        // Check localStorage backup status on mount
        const status = getBackupStatus();
        setBackupStatus(status);
    }, []);

    const handleMigration = async () => {
        if (isMigrating) return;

        const confirmed = window.confirm(
            "Ini akan menyalin semua data dari Supabase ke Firebase dan membuat backup di localStorage.\n\nLanjutkan?"
        );
        if (!confirmed) return;

        setIsMigrating(true);
        setMigrationResult(null);

        try {
            const result = await migrateSupabaseToFirebase();
            setMigrationResult(result);

            // Update backup status
            const status = getBackupStatus();
            setBackupStatus(status);

            if (result.success) {
                // Trigger a sync to refresh the UI with new data
                await syncData();
            }
        } catch (e: any) {
            setMigrationResult({
                success: false,
                recordsMigrated: 0,
                pricesMigrated: 0,
                errors: [e.message || "Unknown error"]
            });
        } finally {
            setIsMigrating(false);
        }
    };

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
                            <span className="text-brutalist-cream/70">Harga BBM (Firebase)</span>
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

                {/* Backup Card */}
                <div className="brutalist-border bg-brutalist-charcoal p-6 brutalist-shadow-pink">
                    <h3 className="font-display text-2xl text-brutalist-pink mb-4 flex items-center gap-2">
                        <Database className="w-8 h-8" strokeWidth={3} />
                        BACKUP DATA
                    </h3>

                    <p className="font-body text-brutalist-cream/70 mb-6">
                        Unduh salinan lengkap data Anda (Catatan, Kendaraan, dan Referensi Harga) dalam format JSON.
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

                    {backupStatus.exists && (
                        <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 text-sm font-body text-green-300">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-bold">Backup Tersimpan di LocalStorage</span>
                            </div>
                            <div className="text-xs text-green-400/70">
                                {backupStatus.recordCount} catatan, {backupStatus.priceCount} harga BBM
                                <br />
                                Timestamp: {backupStatus.timestamp}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Migration Card */}
            <div className="brutalist-border bg-brutalist-charcoal p-6 brutalist-shadow-cyan">
                <h3 className="font-display text-2xl text-brutalist-cyan mb-4 flex items-center gap-2">
                    <RefreshCw className="w-8 h-8" strokeWidth={3} />
                    MIGRASI SUPABASE → FIREBASE
                </h3>

                <p className="font-body text-brutalist-cream/70 mb-4">
                    Salin semua data dari database Supabase lama ke Firebase baru. Data juga akan disimpan di localStorage sebagai backup.
                </p>

                <div className="bg-brutalist-pink/10 border border-brutalist-pink/30 p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-brutalist-pink flex-shrink-0 mt-0.5" strokeWidth={3} />
                        <div className="text-sm font-body text-brutalist-cream/80">
                            <strong className="text-brutalist-pink">Perhatian:</strong> Proses ini akan membaca semua data dari Supabase dan menulis ke Firebase. Pastikan koneksi internet stabil.
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="w-full brutalist-border bg-brutalist-cyan text-brutalist-charcoal font-display text-xl py-4 flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none brutalist-shadow-cyan"
                >
                    {isMigrating ? (
                        <>
                            <div className="w-6 h-6 border-4 border-brutalist-charcoal border-t-transparent rounded-full animate-spin"></div>
                            MIGRASI BERJALAN...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-6 h-6" strokeWidth={3} />
                            MULAI MIGRASI
                        </>
                    )}
                </button>

                {/* Migration Result */}
                {migrationResult && (
                    <div className={`mt-4 p-4 border ${migrationResult.success ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            {migrationResult.success ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                            )}
                            <span className={`font-display text-lg ${migrationResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {migrationResult.success ? 'MIGRASI BERHASIL' : 'MIGRASI GAGAL'}
                            </span>
                        </div>
                        <div className="font-body text-sm text-brutalist-cream/80">
                            <div>Catatan dimigrasikan: <strong>{migrationResult.recordsMigrated}</strong></div>
                            <div>Harga BBM dimigrasikan: <strong>{migrationResult.pricesMigrated}</strong></div>
                            {migrationResult.errors.length > 0 && (
                                <div className="mt-2 text-red-300">
                                    Errors: {migrationResult.errors.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
