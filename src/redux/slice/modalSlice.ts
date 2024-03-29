// modalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  modalName: string;
  isOpen: boolean;
  modalTitle: string;
}

const initialState: ModalState = {
  modalName: "",
  isOpen: false,
  modalTitle: '',
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state: ModalState, action: PayloadAction<{ modalType: string; isOpen: boolean; title:string }>) => {
      const { modalType, isOpen, title } = action.payload;
      state.modalName = modalType;
      state.isOpen = isOpen;
      state.modalTitle = title;
    },
    closeModal: (state: ModalState) => {
      state.isOpen = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export const selectModal = (state: { modal: ModalState }) => state.modal;

export default modalSlice.reducer;
