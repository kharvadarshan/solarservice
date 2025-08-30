import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    user:null,
    token:null
};

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        loginSuccess: (state,action)=>{
            state.user = action.payload
        },
        logout: (state)=>{
            state.user=null
        },
        setToken:(state,action)=>{
            state.token=action.payload
        },
        removeToken:(state)=>{
            state.token=null
        }
    }
});


export const { loginSuccess,logout,setToken,removeToken} = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state)=>state.auth.user;
export const selectCurrentRole = (state)=>state.auth.user?.role;
export const getToken= (state)=>state.auth.token;