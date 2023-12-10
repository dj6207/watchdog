import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "../slices";

export const store = configureStore({
    reducer: {
        user: userSlice,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;