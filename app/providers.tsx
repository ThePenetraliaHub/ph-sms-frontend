"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { rehydrateAuth } from "@/store/slices/authSlice";
import { Toaster } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { selectToken } from "@/store/slices/authSlice";

function RehydrateAuth() {
  const token = useAppSelector(selectToken);

  useEffect(() => {
    if (!token) store.dispatch(rehydrateAuth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
