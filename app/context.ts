import {
	unstable_createContext as createContext,
	type AppLoadContext,
} from 'react-router';

export const appLoad = createContext<AppLoadContext>();
