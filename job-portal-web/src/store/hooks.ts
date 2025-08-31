﻿import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from './index';
import type { RootState } from './rootReducer';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
