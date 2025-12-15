import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await signInWithEmail(email, password);
      } else {
        res = await signUpWithEmail(email, password);
      }

      if (res.error) {
        setError(res.error);
      } else if (!isLogin) {
        setError("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
        // Optional: clear password or email
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan tak terduga");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brutalist-charcoal halftone-bg flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md relative">
        {/* Diagonal split background effect - Animated */}
        <motion.div
          initial={{ opacity: 0, skewY: 0, scale: 0.8 }}
          animate={{ opacity: 1, skewY: -6, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="absolute inset-0 bg-gradient-to-br from-brutalist-yellow/20 to-brutalist-pink/20 -z-10"
        />

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative brutalist-border brutalist-shadow-yellow bg-brutalist-charcoal p-8 md:p-12"
        >
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="font-display text-5xl md:text-6xl text-brutalist-yellow mb-2"
            >
              BBM
            </motion.h1>
            <motion.h2
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display text-3xl md:text-4xl text-brutalist-cream"
            >
              TRACKER
            </motion.h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brutalist-cream font-bold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-brutalist-cream border-2 border-brutalist-cream/50 focus:border-brutalist-yellow rounded-none h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brutalist-cream font-bold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-brutalist-cream border-2 border-brutalist-cream/50 focus:border-brutalist-yellow rounded-none h-12"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm font-bold bg-red-900/20 p-2 border border-red-500/50"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full brutalist-border brutalist-shadow-cyan bg-cyan-400 hover:bg-cyan-300 text-brutalist-charcoal font-body font-bold text-lg py-6 transition-all duration-75 active:scale-[0.97] hover:translate-x-1 hover:translate-y-1 hover:shadow-none mb-4"
            >
              {isLoading ? "Loading..." : (isLogin ? "MASUK" : "DAFTAR")}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-brutalist-yellow hover:underline font-bold text-sm"
              >
                {isLogin ? "Belum punya akun? Daftar disini" : "Sudah punya akun? Masuk disini"}
              </button>
            </div>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brutalist-cream/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brutalist-charcoal px-2 text-brutalist-cream/50">
                Atau
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              type="button"
              onClick={signInWithGoogle}
              className="w-full brutalist-border brutalist-shadow bg-brutalist-cream hover:bg-brutalist-cream/90 text-brutalist-charcoal font-body font-bold text-lg py-7 transition-all duration-75 active:scale-[0.97] hover:translate-x-1 hover:translate-y-1 hover:shadow-none group"
            >
              <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-brutalist-cream/50 text-sm font-body mt-6"
          >
            Data Anda akan disinkronkan secara otomatis
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
