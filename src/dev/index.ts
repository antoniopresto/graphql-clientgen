import fs from 'fs';
import { schema } from './schema-demo';
// import { getResolversHelper } from '../lib/resolversHelper';
import { printClient } from '../index';

(async () => {
  const dest =
    '/Volumes/ossx/dev-user/dev/graphql-compose-clientgen/examples/generated.ts';
  const client = await printClient(schema);
  fs.writeFileSync(dest, client);

  console.log(`
    Generated:
    - ${dest}
  `);
})();
