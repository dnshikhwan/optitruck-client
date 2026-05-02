import { io } from "socket.io-client";

export const socket = io(
    "https://optitruck-server.danishikhwan.dev/delivery-jobs",
    {
        autoConnect: false,
    },
);
