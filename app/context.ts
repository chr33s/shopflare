import {
	type AppLoadContext,
	unstable_createContext as createContext,
} from 'react-router';

export type AppLoad = AppLoadContext;
export const appLoad = createContext<AppLoad>();
