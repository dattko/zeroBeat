// modalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  modalName: string;
  isOpen: boolean;
}

const initialState: ModalState = {
  modalName: "",
  isOpen: false,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state: ModalState, action: PayloadAction<{ modalType: string; isOpen: boolean }>) => {
      const { modalType, isOpen } = action.payload;
      state.modalName = modalType;
      state.isOpen = isOpen;
    },
    closeModal: (state: ModalState) => {
      state.isOpen = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export const selectModal = (state: { modal: ModalState }) => state.modal;

export default modalSlice.reducer;
