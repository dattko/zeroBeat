// modalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
  modalName: string;
  isOpen: boolean;
  modalTitle?: string;
  header?:boolean;
  footer?:boolean;
  width?: number;
}

const initialState: ModalState = {
  modalName: "",
  isOpen: false,
  modalTitle: '',
  header: true,
  footer: true,
  width: 580,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state: ModalState, action: PayloadAction<{ modalType: string; isOpen: boolean; title?:string; header?: boolean, footer?: boolean }>) => {
      const { modalType, isOpen, title,header,footer } = action.payload;
      if (modalType === 'LoginModal') {
        state.modalName = 'LoginModal';
        state.isOpen = isOpen;
        state.header = false;
        state.footer = false;
        state.width = 580;
      } else {
        state.modalName = modalType;
        state.isOpen = isOpen;
        state.modalTitle = title;
        state.header = header;
        state.footer = footer;
        state.width = 580;
      }
    },
    closeModal: (state: ModalState) => {
      state.isOpen = false;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export const selectModal = (state: { modal: ModalState }) => state.modal;

export default modalSlice.reducer;
