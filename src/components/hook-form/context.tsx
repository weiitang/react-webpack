/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext } from 'react';
import { FormModelType, FormModel } from './form-model';

export const HookFormContext = createContext<FormModelType>(new FormModel());

export const useHookFormContext = (): FormModelType =>
  useContext(HookFormContext);

interface HookFormLayoutContextType {
  refreshCatalog: () => void;
}

export const HookFormLayoutContext = createContext<HookFormLayoutContextType>({
  refreshCatalog: () => {},
});

export const useHookFormLayoutContext = (): HookFormLayoutContextType =>
  useContext(HookFormLayoutContext);
