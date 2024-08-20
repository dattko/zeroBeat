import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  modalName: string;
  isOpen: boolean;
  modalTitle?: string;
  header?: boolean;
  footer?: boolean;
  width?: number;
  loginAttempts: number;
}

const initialState: ModalState = {
  modalName: "",
  isOpen: false,
  modalTitle: '',
  header: true,
  footer: true,
  width: 580,
  loginAttempts: 0,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ modalName: string; isOpen: boolean }>) => {
      state.modalName = action.payload.modalName;
      state.isOpen = action.payload.isOpen;
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
    incrementLoginAttempts: (state) => {
      if (state.modalName === 'LoginModal') {
        state.loginAttempts += 1;
      }
    },
  },
});

export const { openModal, closeModal, incrementLoginAttempts } = modalSlice.actions;
export const selectModal = (state: { modal: ModalState }) => state.modal;
export default modalSlice.reducer;