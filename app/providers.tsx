"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { rehydrateAuth } from "@/store/slices/authSlice";
import { Toaster } from "sonner";

function RehydrateAuth() {
  useEffect(() => {
    store.dispatch(rehydrateAuth());
  }, []);
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <RehydrateAuth />
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
