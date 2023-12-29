import { createSlice } from "@reduxjs/toolkit";
import { GraphState } from "../types";

const initialState: GraphState = {
    selectedDate: (new Date).toISOString(),
}

const graphSlice = createSlice({
    name: 'graph',
    initialState,
    reducers: {
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
    },
});

export const {
    setSelectedDate,
} = graphSlice.actions;
export default graphSlice.reducer;