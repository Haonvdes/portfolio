// Flattens .design-sync/ds-entry.css into one stylesheet for design-sync's cfg.cssEntry.
// - css/styles/style.css @imports ./chatbox.css, which does not exist (404s on the
//   live site too); it resolves to an empty module here instead of failing the build.
// - `@import url('https://fonts.googleapis.com')` imports an HTML page, not CSS; dropped.
// - Relative SVG url()s are inlined as data URIs so they survive outside the repo.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../.ds-sync/package.json'));
const esbuild = require('esbuild');

const fixups = {
  name: 'site-fixups',
  setup(b) {
    b.onResolve({ filter: /chatbox\.css$/ }, () => ({ path: 'chatbox', namespace: 'empty' }));
    b.onResolve({ filter: /^https:\/\/fonts\.googleapis\.com\/?$/ }, () => ({ path: 'gfonts-root', namespace: 'empty' }));
    b.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: '', loader: 'css' }));
  },
};

await esbuild.build({
  entryPoints: [join(here, 'ds-entry.css')],
  outfile: join(here, 'dist/styles.css'),
  bundle: true,
  loader: { '.svg': 'dataurl' },
  external: ['/public/*', 'https://*'],
  plugins: [fixups],
  logLevel: 'warning',
});
console.log('wrote .design-sync/pkg/dist/styles.css');
