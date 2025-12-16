import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFuel } from "@/contexts/FuelContext";
import VehicleManager from "./VehicleManager";
import BackupManager from "./BackupManager";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Car,
    Shield,
    LogOut,
    ChevronDown,
    ChevronUp,
    Save,
    Mail,
    Phone,
    Lock,
    AlertTriangle,
    CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";

type Section = "profile" | "vehicles" | "account" | null;

export default function AccountPage() {
    const { user, userProfile, signOut, updateUserProfile, updateUserPassword, updateUserEmail } = useAuth();
    const [expandedSection, setExpandedSection] = useState<Section>("profile");

    // Profile form state
    const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
    const [phone, setPhone] = useState(userProfile?.phone || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Email change state
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const toggleSection = (section: Section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setProfileMessage(null);

        const { error } = await updateUserProfile({
            displayName,
            phone,
        });

        if (error) {
            setProfileMessage({ type: "error", text: error });
        } else {
            setProfileMessage({ type: "success", text: "Profil berhasil disimpan" });
        }

        setIsSavingProfile(false);
    };

    const handleChangePassword = async () => {
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "Password baru tidak cocok" });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: "Password minimal 6 karakter" });
            return;
        }

        setIsSavingPassword(true);

        const { error } = await updateUserPassword(currentPassword, newPassword);

        if (error) {
            setPasswordMessage({ type: "error", text: error });
        } else {
            setPasswordMessage({ type: "success", text: "Password berhasil diubah" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }

        setIsSavingPassword(false);
    };

    const handleChangeEmail = async () => {
        setEmailMessage(null);

        if (!newEmail || !emailPassword) {
            setEmailMessage({ type: "error", text: "Masukkan email baru dan password" });
            return;
        }

        if (newEmail === user?.email) {
            setEmailMessage({ type: "error", text: "Email baru sama dengan email saat ini" });
            return;
        }

        setIsChangingEmail(true);

        const { error } = await updateUserEmail(newEmail, emailPassword);

        if (error) {
            setEmailMessage({ type: "error", text: error });
        } else {
            setEmailMessage({ type: "success", text: "Link verifikasi telah dikirim ke email baru Anda. Silakan cek inbox." });
            setNewEmail("");
            setEmailPassword("");
        }

        setIsChangingEmail(false);
    };

    const handleLogout = () => {
        const confirmed = window.confirm("Apakah Anda yakin ingin keluar?");
        if (confirmed) {
            signOut();
        }
    };

    const SectionHeader = ({
        title,
        icon: Icon,
        section,
        color
    }: {
        title: string;
        icon: any;
        section: Section;
        color: string;
    }) => (
        <button
            onClick={() => toggleSection(section)}
            className={`w-full brutalist-border p-4 flex items-center justify-between transition-all ${expandedSection === section
                ? `bg-${color} text-brutalist-charcoal`
                : "bg-brutalist-charcoal text-brutalist-cream hover:bg-brutalist-charcoal/80"
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                <span className="font-body font-bold text-sm">{title}</span>
            </div>
            {expandedSection === section ? (
                <ChevronUp className="w-5 h-5" />
            ) : (
                <ChevronDown className="w-5 h-5" />
            )}
        </button>
    );

    return (
        <div className="space-y-4 pb-8">
            <h2 className="font-display text-xl text-brutalist-cream mb-4">AKUN SAYA</h2>

            {/* User Avatar/Info */}
            <div className="brutalist-border bg-brutalist-charcoal p-4 flex items-center gap-4">
                <div className="w-14 h-14 brutalist-border bg-brutalist-yellow flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-brutalist-charcoal" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-body font-bold text-brutalist-cream truncate">
                        {userProfile?.displayName || user?.displayName || "User"}
                    </p>
                    <p className="font-body text-brutalist-cream/60 text-sm truncate">
                        {user?.email}
                    </p>
                </div>
            </div>

            {/* Edit Profile Section */}
            <div>
                <SectionHeader title="Edit Profil" icon={User} section="profile" color="brutalist-cyan" />
                <AnimatePresence>
                    {expandedSection === "profile" && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="brutalist-border border-t-0 bg-brutalist-charcoal/50 p-4 space-y-4">
                                <div>
                                    <label className="block font-body text-brutalist-cream/70 text-xs mb-2">Nama</label>
                                    <Input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Masukkan nama Anda"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body"
                                    />
                                </div>

                                <div>
                                    <label className="block font-body text-brutalist-cream/70 text-xs mb-2">
                                        <Mail className="w-3 h-3 inline mr-1" />
                                        Email Saat Ini
                                    </label>
                                    <Input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="brutalist-border bg-brutalist-charcoal/50 text-brutalist-cream/50 font-body cursor-not-allowed"
                                    />
                                </div>

                                {/* Email Change Section */}
                                <div className="pt-3 border-t border-brutalist-cream/10">
                                    <label className="block font-body text-brutalist-cream/70 text-xs mb-2">
                                        Email Baru (memerlukan verifikasi)
                                    </label>
                                    <Input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="email.baru@example.com"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body mb-2"
                                    />
                                    <Input
                                        type="password"
                                        value={emailPassword}
                                        onChange={(e) => setEmailPassword(e.target.value)}
                                        placeholder="Password untuk verifikasi"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body"
                                    />
                                    {emailMessage && (
                                        <div className={`mt-2 p-3 flex items-center gap-2 text-sm ${emailMessage.type === "success"
                                            ? "bg-green-900/30 text-green-400 border border-green-500/50"
                                            : "bg-red-900/30 text-red-400 border border-red-500/50"
                                            }`}>
                                            {emailMessage.type === "success" ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4" />
                                            )}
                                            {emailMessage.text}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleChangeEmail}
                                        disabled={isChangingEmail || !newEmail || !emailPassword}
                                        className="mt-2 w-full brutalist-border bg-brutalist-yellow text-brutalist-charcoal font-body font-bold py-2 flex items-center justify-center gap-2 hover:bg-brutalist-yellow/90 disabled:opacity-50"
                                    >
                                        {isChangingEmail ? (
                                            <div className="w-4 h-4 border-2 border-brutalist-charcoal border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Mail className="w-4 h-4" />
                                        )}
                                        UBAH EMAIL
                                    </button>
                                </div>

                                <div>
                                    <label className="block font-body text-brutalist-cream/70 text-xs mb-2">
                                        <Phone className="w-3 h-3 inline mr-1" />
                                        No. Telepon
                                    </label>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body"
                                    />
                                </div>

                                {profileMessage && (
                                    <div className={`p-3 flex items-center gap-2 text-sm ${profileMessage.type === "success"
                                        ? "bg-green-900/30 text-green-400 border border-green-500/50"
                                        : "bg-red-900/30 text-red-400 border border-red-500/50"
                                        }`}>
                                        {profileMessage.type === "success" ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4" />
                                        )}
                                        {profileMessage.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="w-full brutalist-border bg-brutalist-cyan text-brutalist-charcoal font-body font-bold py-3 flex items-center justify-center gap-2 hover:bg-brutalist-cyan/90 disabled:opacity-50"
                                >
                                    {isSavingProfile ? (
                                        <div className="w-5 h-5 border-2 border-brutalist-charcoal border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    SIMPAN PROFIL
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Vehicles Section */}
            <div>
                <SectionHeader title="Kendaraan" icon={Car} section="vehicles" color="brutalist-green" />
                <AnimatePresence>
                    {expandedSection === "vehicles" && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="brutalist-border border-t-0 bg-brutalist-charcoal/50 p-4">
                                <VehicleManager />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Account Settings Section */}
            <div>
                <SectionHeader title="Keamanan Akun" icon={Shield} section="account" color="brutalist-pink" />
                <AnimatePresence>
                    {expandedSection === "account" && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="brutalist-border border-t-0 bg-brutalist-charcoal/50 p-4 space-y-4">
                                <div className="pb-4 border-b border-brutalist-cream/10">
                                    <label className="block font-body text-brutalist-cream/70 text-xs mb-2">Email Terdaftar</label>
                                    <p className="font-body text-brutalist-cream">{user?.email}</p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-body text-brutalist-cream font-bold text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Ganti Password
                                    </h4>

                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Password saat ini"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body"
                                    />

                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Password baru"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body"
                                    />

                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Konfirmasi password baru"
                                        className="brutalist-border bg-brutalist-charcoal text-brutalist-cream font-body"
                                    />

                                    {passwordMessage && (
                                        <div className={`p-3 flex items-center gap-2 text-sm ${passwordMessage.type === "success"
                                            ? "bg-green-900/30 text-green-400 border border-green-500/50"
                                            : "bg-red-900/30 text-red-400 border border-red-500/50"
                                            }`}>
                                            {passwordMessage.type === "success" ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4" />
                                            )}
                                            {passwordMessage.text}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        className="w-full brutalist-border bg-brutalist-pink text-brutalist-charcoal font-body font-bold py-3 flex items-center justify-center gap-2 hover:bg-brutalist-pink/90 disabled:opacity-50"
                                    >
                                        {isSavingPassword ? (
                                            <div className="w-5 h-5 border-2 border-brutalist-charcoal border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Lock className="w-5 h-5" />
                                        )}
                                        UBAH PASSWORD
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full brutalist-border bg-red-600 text-white font-body font-bold py-4 flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
            >
                <LogOut className="w-5 h-5" />
                KELUAR
            </button>

            {/* Credits Footer */}
            <div className="text-center pt-6 pb-4 border-t border-brutalist-cream/10">
                <p className="font-display text-brutalist-yellow text-lg">BBM TRACKER</p>
                <p className="font-body text-brutalist-cream/40 text-xs mt-1">
                    Versi 1.0.0 • © 2025
                </p>
                <p className="font-body text-brutalist-cream/30 text-[10px] mt-2">
                    Dibuat dengan ❤️ untuk pengguna BBM Indonesia
                </p>
            </div>
        </div>
    );
}
