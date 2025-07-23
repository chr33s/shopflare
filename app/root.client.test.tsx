import {createRoot} from 'react-dom/client';
import {test} from 'vitest';

import Component from './root';

test('component', () => {
	const app = window.document.createElement('div');
	const root = createRoot(app);
	root.render(<Component />);
	root.unmount();
});
