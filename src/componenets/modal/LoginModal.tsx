import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from "@redux/store";
import { closeModal } from '@redux/slice/modalSlice';
import { logOut, logIn } from "@redux/slice/authSlice";

type LoginProps = {
    name: string;
  };


const LoginModal = ( ) => {
    const [username, setUsername] = useState("");
    const dispatch = useDispatch();


    const onClickLogIn = () => {
        dispatch(logIn(username));
        dispatch(closeModal());
      };
      
      const onClickLogOut = () => {
        dispatch(logOut());
        dispatch(closeModal());
      };

    return (
        <>
        <div className='input-box'>
            <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
            />
        </div>
            <button onClick={onClickLogIn}>
                Log In
            </button>
            <button onClick={onClickLogOut}>
                 Log Out
            </button>
        </>
    )
}

export default LoginModal;