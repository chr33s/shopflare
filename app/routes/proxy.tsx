import {Outlet} from 'react-router';

import {APP_URL} from '#app/const';
import {Provider} from '#app/components/proxy';

export default function Proxy() {
	return (
		<Provider appUrl={APP_URL}>
			<Outlet />
		</Provider>
	);
}

export {links} from './app';
