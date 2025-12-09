import {createContext, useContext} from 'react'
import {AlertColor} from "@mui/material";

export type SnackBarType  = {
  severity: AlertColor,
  text: string
}

export type SnackbarContextType = {
  active: SnackBarType[],
  createSnackbar: (severity: AlertColor, text: string) => void
}


// @ts-expect-error - The context is initialized with undefined, but will be provided a value.
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbarContext = (): SnackbarContextType => useContext(SnackbarContext)
