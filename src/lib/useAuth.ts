import { useSession, signIn, signOut } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { openModal, closeModal } from '@redux/slice/modalSlice';

export const useAuth = () => {
    const { data: session, status } = useSession();
    const dispatch = useDispatch();

    const handleLogin = async () => {
        try {
            await signIn("spotify", { callbackUrl: process.env.NEXTAUTH_URL });
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            dispatch(closeModal());
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const showLoginModal = () => {
        dispatch(openModal({ modalName: 'LoginModal', isOpen: true }));
    };

    return {
        session,
        status,
        handleLogin,
        handleLogout,
        showLoginModal
    };
};