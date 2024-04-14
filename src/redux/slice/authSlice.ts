import { createSlice, PayloadAction } from "@reduxjs/toolkit";


type InitialState = {
  value: AuthState;
};


type AuthState = {
  isAuth: boolean; // 로그인
  username: string; // 유저
  isModerator: boolean; // 관리자
};


const initialState = {
  value: {
    isAuth: false,
    username: "",
    isModerator: false,
  } as AuthState,
} as InitialState;

export const auth = createSlice({
  name: "auth", // slice name
  initialState, // initial state
  reducers: {
    logOut: () => { 
      return initialState;
    },
    logIn: (state, action: PayloadAction<string>) => {
      return {
        value: {
          isAuth: true,
          username: action.payload,
          isModerator: false,
        },
      };
    },
    // 로그인을 하면 받아온 유저 정보로 변경
  },
});

export const { logIn, logOut } = auth.actions;
// 정의한 액션들을 export 
export default auth.reducer;
// authReducer를 export