'use client'

import { io } from "socket.io-client";
import { useEffect } from "react";
import useCurrentUser from "../hooks/useCurrentUser";

const PresenceComponent = () => {
    const {user} = useCurrentUser();

useEffect(()=>{
    if (!user)return;
    const socket = io();
    return () => {socket.disconnect()}; 
  },[user?.id]);
  return (null);
}
export default PresenceComponent 