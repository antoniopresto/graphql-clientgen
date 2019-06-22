import test from 'ava';
import fs from 'fs';
import ts from 'typescript';
import { schema } from '../dev/schema-demo';
import { printClient } from '../lib/generate-client';
import { printFromEndpoint } from '..';

const API_ENDPOINT = 'https://gitlab.com/api/graphql';

// @ts-ignore
global.fetch = require('node-fetch');

test('generate file from schema (smoke test)', async t => {
  const client = await printClient(schema);
  t.is(client.length > 9000, true);
});

test('generate file remote host (smoke test)', async t => {
  const body = await getTSFile();
  t.is(body.length > 5000, true);
});

test('generate js', async t => {
  const tsContent = await getTSFile();
  const js = await getJSFile(tsContent);
  t.is(js.length > 5000, true);
});

// test('using generated file', async t => {
//   const tsContent = await getTSFile();
//   const js = await getJSFile(tsContent);
//   const Client = eval(js);
//   const { client } = new Client({ url: API_ENDPOINT });
//
//   // t.is(client, 0);
//
//   t.is(client, null);
// });

async function getJSFile(tsContet: string) {
  const tsConfigText = fs.readFileSync(
    process.cwd() + '/tsconfig.json',
    'utf8'
  );
  let config: any = {};
  eval(`config = ${tsConfigText}`);
  config.compilerOptions.inlineSourceMap = false;
  let result = ts.transpileModule(tsContet, config);
  return result.outputText;
}

async function getTSFile() {
  const client = await printFromEndpoint(API_ENDPOINT);
  if (client.status !== 'ok') {
    throw new Error(client.message);
  }
  return client.client;
}
