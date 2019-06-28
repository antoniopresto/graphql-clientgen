import shell from 'shelljs';
import fs from 'fs';
import { schema } from './schema-demo';
import { printClient } from '../index';
import { getClient, getTSFile, TEST_API } from './helpers';
import { GraphQLClient } from './generated-remote';

const destPath = process.cwd() + '/examples';
// (async () => {
//   const dest = destPath + '/generated.ts';
//   const client = await printClient(schema);
//   fs.writeFileSync(dest, client.client);
//
//   console.log(`
//     Generated:
//     - ${dest}
//   `);
// })();
//
// (async () => {
//   const client = await getTSFile();
//   const dest = destPath + '/generated-remote.ts';
//   fs.writeFileSync(dest, client);
//
//   console.log(`
//     Generated:
//     - ${dest}
//   `);
// })();

(async () => {
  const { client } = new GraphQLClient({ url: TEST_API });
  const res = await client.group({} as any);
  console.log({ apiResponse: res.result });
})();

(() => {
  let command = `node ${process.cwd()}/build/main/lib/bin.js ${TEST_API} ${destPath}`;
  shell.exec(command, () => {});
})();
