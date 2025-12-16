import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

export default function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = async () => {
        if (!containerRef.current) return;

        try {
            setError(null);
            setIsScanning(true);

            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // QR code successfully scanned
                    onScan(decodedText);
                    stopScanner();
                    onClose();
                },
                (errorMessage) => {
                    // QR code not found in frame - this is normal, don't show error
                    console.debug('QR scan frame:', errorMessage);
                }
            );
        } catch (err: any) {
            console.error('Scanner error:', err);
            setError(err.message || 'Gagal membuka kamera');
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md brutalist-border brutalist-shadow-cyan bg-brutalist-charcoal p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-6 h-6 text-brutalist-cyan" strokeWidth={3} />
                            <h2 className="font-display text-2xl text-brutalist-cyan">SCAN QR</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="brutalist-border bg-brutalist-pink p-2 hover:scale-95 transition-transform"
                        >
                            <X className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
                        </button>
                    </div>

                    {/* Scanner Container */}
                    <div className="relative">
                        <div
                            id="qr-reader"
                            ref={containerRef}
                            className="w-full aspect-square brutalist-border bg-black overflow-hidden"
                        />

                        {/* Scanning overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-64 h-64 border-4 border-brutalist-cyan animate-pulse" />
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <div className="text-center p-4">
                                    <Camera className="w-12 h-12 text-brutalist-pink mx-auto mb-2" />
                                    <p className="font-body text-brutalist-pink text-sm">{error}</p>
                                    <button
                                        onClick={startScanner}
                                        className="mt-4 brutalist-border bg-brutalist-cyan px-4 py-2 font-body text-brutalist-charcoal text-sm"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-4 text-center">
                        <p className="font-body text-brutalist-cream/70 text-sm">
                            Arahkan kamera ke QR code pada nota bensin
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
