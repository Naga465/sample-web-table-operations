import { createContext } from "react";

export type SnackBarPropsType = {
    message: string;
    error?: boolean;
    show: boolean;
    showAlert?: any;
  };

const initContextData: SnackBarPropsType = { message: "", show:false };

export const SnackBarContext = createContext<SnackBarPropsType>(initContextData);
