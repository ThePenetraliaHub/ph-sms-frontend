import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "@/services/baseApi";
import { errorSlice } from "./errorSlice";
import authReducer, { logout } from "./slices/authSlice";
import schoolReducer from "./slices/schoolSlice";

const authListener = createListenerMiddleware();
authListener.startListening({
  actionCreator: logout,
  effect: () => {
    if (typeof window !== "undefined") {
      fetch("/api/auth/session", { method: "DELETE" });
    }
  },
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    error: errorSlice.reducer,
    auth: authReducer,
    school: schoolReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authListener.middleware)
      .concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
