import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Helper function to convert Firebase error codes to Indonesian messages
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credential': 'Email atau password salah',
    'auth/user-not-found': 'Email tidak terdaftar',
    'auth/wrong-password': 'Password salah',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti',
    'auth/email-already-in-use': 'Email sudah digunakan',
    'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter)',
    'auth/invalid-email': 'Format email tidak valid',
    'auth/user-disabled': 'Akun telah dinonaktifkan',
    'auth/operation-not-allowed': 'Operasi tidak diizinkan',
    'auth/requires-recent-login': 'Silakan login ulang untuk melanjutkan',
    'auth/network-request-failed': 'Gagal terhubung ke jaringan',
  };
  return errorMessages[errorCode] || 'Terjadi kesalahan. Silakan coba lagi';
};

export interface UserProfile {
  displayName: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<{ error: any }>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>;
  updateUserEmail: (newEmail: string, currentPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "user_profiles", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // Create default profile
        const defaultProfile: UserProfile = {
          displayName: user?.displayName || "",
          email: user?.email || "",
          phone: ""
        };
        await setDoc(docRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert("Failed to sign in with Google. Check console for details.");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { error: getAuthErrorMessage(error.code) };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { error: getAuthErrorMessage(error.code) };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const docRef = doc(db, "user_profiles", user.uid);
      const updatedProfile = { ...userProfile, ...profile };
      await setDoc(docRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile as UserProfile);
      return { error: null };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { error: error.message || "Failed to update profile" };
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) return { error: "Not authenticated" };

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      return { error: null };
    } catch (error: any) {
      console.error("Error updating password:", error);
      return { error: getAuthErrorMessage(error.code) };
    }
  };

  const updateUserEmail = async (newEmail: string, currentPassword: string) => {
    if (!user || !user.email) return { error: "Tidak terautentikasi" };

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Send verification email to new address
      await verifyBeforeUpdateEmail(user, newEmail);

      return { error: null };
    } catch (error: any) {
      console.error("Error updating email:", error);
      return { error: getAuthErrorMessage(error.code) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserProfile,
        updateUserPassword,
        updateUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

