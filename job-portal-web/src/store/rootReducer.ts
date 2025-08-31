import { combineReducers } from "@reduxjs/toolkit";
import auth from "./slices/authSlice";
import jobs from "./slices/jobsSlice";
import ui from "./slices/uiSlice";
import errors from "./slices/errorSlice";
import notifications from "./slices/notificationsSlice";
import search from "./slices/searchSlice";

export const rootReducer = combineReducers({ auth, jobs, ui, errors, notifications, search });
export type RootState = ReturnType<typeof rootReducer>;
