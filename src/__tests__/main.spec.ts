import test from 'ava';
import { schema } from '../dev/schema-demo';
import { printClient } from '../lib/generate-client';
import {
  getMethodsFromEndpoint,
  getClientFromTSSource,
  getTSFile,
  TEST_API,
  monkeyPatchGot
} from '../dev/helpers';
import { getRemoteSchema } from '../lib/printFromEndpoint';

// mock network request from "got" package
monkeyPatchGot();

test('generate ts file from schema (smoke test)', async t => {
  const { client } = await printClient(schema);
  t.is(client.length > 9000, true);
});

test('generate ts file from remote host (smoke test)', async t => {
  const body = await getTSFile();
  t.is(body.length > 5000, true);
});

test('generate js', async t => {
  const tsContent = await getTSFile();
  const js = await getClientFromTSSource(tsContent);

  t.is(typeof js, 'function');
  t.is(js.name, 'GraphQLClient');
});

test('generate a method for each query entry', async t => {
  const res = await getRemoteSchema(TEST_API);
  const methods = await getMethodsFromEndpoint(TEST_API);
  if (res.status !== 'ok') {
    throw new Error(res.status);
  }

  const queryType = res.schema.getQueryType();
  const queryFields = queryType ? queryType.getFields() : {};
  const methodNames = Object.keys(methods);
  const queryEntries = Object.keys(queryFields);

  let found: string[] = [];

  queryEntries.forEach(query => {
    const f = methodNames.find(method => method === query);
    if (f && typeof methods[f] === 'function') {
      found.push(f);
    }
  });

  t.is(methodNames.length > 0, true);
  t.is(queryEntries.length > 0, true);
  t.is(found.length, queryEntries.length);
});

test('generate a method for each mutation entry', async t => {
  const res = await getRemoteSchema(TEST_API);
  const methods = await getMethodsFromEndpoint(TEST_API);
  if (res.status !== 'ok') {
    throw new Error(res.status);
  }

  const mutationType = res.schema.getMutationType();
  const mutationFields = mutationType ? mutationType.getFields() : {};
  const methodNames = Object.keys(methods);
  const mutationEntries = Object.keys(mutationFields);

  let found: string[] = [];

  mutationEntries.forEach(query => {
    const f = methodNames.find(method => method === query);
    if (f && typeof methods[f] === 'function') found.push(f);
  });

  t.is(methodNames.length > 0, true);
  t.is(mutationEntries.length > 0, true);
  t.is(found.length, mutationEntries.length);
});

test('using generated file', async t => {
  const client = await getMethodsFromEndpoint();

  // echo
  t.is((await client.echo({ text: 'mock' })).result, 'mock');

  // mutation
  t.is(
    (await client.designManagementUpload()).errors[0].message,
    'Variable "$input_0" of required type "DesignManagementUploadInput!" was not provided.'
  );
});
