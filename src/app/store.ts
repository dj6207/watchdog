import { configureStore } from "@reduxjs/toolkit";
import { userSlice, graphSlice } from "../slices";

export const store = configureStore({
    reducer: {
        user: userSlice,
        graph: graphSlice,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;