import { createSlice } from '@reduxjs/toolkit';
import { UserState } from "../types";

const initialState: UserState = {
    userName: '',
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, actions) => {
            state.userName = actions.payload;
        },
    },
});

export const { 
    setUser,
} = userSlice.actions;
export default userSlice.reducer;