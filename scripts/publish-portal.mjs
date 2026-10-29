import {copyFileSync} from 'node:fs';
// Vite first builds the learning app; keep its entry before installing the portal.
copyFileSync(new URL('../docs/index.html', import.meta.url), new URL('../docs/learning.html', import.meta.url));
copyFileSync(new URL('../portal/index.html', import.meta.url), new URL('../docs/index.html', import.meta.url));
