"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

type AccessibilityContextType = {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Load preferences from localStorage on client side
  useEffect(() => {
    const storedPreference = localStorage.getItem("animationsEnabled");
    if (storedPreference !== null) {
      setAnimationsEnabled(storedPreference === "true");
    }
  }, []);

  // Update localStorage when preference changes
  useEffect(() => {
    localStorage.setItem("animationsEnabled", animationsEnabled.toString());

    // Apply or remove the no-animation class to the document
    if (animationsEnabled) {
      document.documentElement.classList.remove("no-animation");
    } else {
      document.documentElement.classList.add("no-animation");
    }
  }, [animationsEnabled]);

  const toggleAnimations = () => {
    setAnimationsEnabled((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{ animationsEnabled, toggleAnimations }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
