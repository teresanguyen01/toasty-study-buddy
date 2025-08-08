"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChange, getUserProfile } from "@/lib/firebase/auth";
import { UserProfile } from "@/lib/firebase/auth";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Setting up Firebase auth listener");

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log(
        "Auth state changed:",
        firebaseUser ? "User logged in" : "User logged out"
      );

      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          // Get user profile from Firestore
          console.log("Fetching user profile for:", firebaseUser.uid);
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
          setError(null);
        } else {
          setUserProfile(null);
          setError(null);
        }
      } catch (err) {
        console.error("Error in auth state change:", err);
        setError(err instanceof Error ? err.message : "Authentication error");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up Firebase auth listener");
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("Signing out user");
      const { signOutUser } = await import("@/lib/firebase/auth");
      await signOutUser();
      setUser(null);
      setUserProfile(null);
      setError(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError(error instanceof Error ? error.message : "Sign out failed");
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
