import {Outlet} from 'react-router';

import {APP_URL} from '~/const';
import {Provider} from '~/components/proxy';

export default function ProxyRoute() {
	return (
		<Provider appUrl={APP_URL}>
			<Outlet />
		</Provider>
	);
}
