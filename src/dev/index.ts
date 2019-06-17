import fs from 'fs';
import { schema } from '../__tests__/schema.spec';
// import { getResolversHelper } from '../lib/resolversHelper';
import { printClient } from '../index';

(async () => {
  const client = await printClient(schema);
  fs.writeFileSync(
    '/Volumes/ossx/dev-user/dev/graphql-compose-clientgen/client.ts',
    client
  );
  
})();
