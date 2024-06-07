import { createContext } from 'react';
import type { IFormContext } from './types';

export const FormContext = createContext<IFormContext>({});

export const SubmittingContext = createContext<boolean>(false);

export const FormItemContext = createContext(null);
