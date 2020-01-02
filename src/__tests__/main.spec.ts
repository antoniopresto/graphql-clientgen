import {
  getMethodsFromEndpoint,
  getClientFromTSSource,
  getTSFile,
  TEST_API
} from './helpers';

import { getRemoteSchema } from '../lib/printFromEndpoint';

describe('main', () => {
  test('generate ts file from remote host (smoke test)', async () => {
    const body = await getTSFile();
    expect(body.length > 5000).toBe(true);
  });

  test('generate js', async () => {
    const tsContent = await getTSFile();
    const js = await getClientFromTSSource(tsContent);

    expect(typeof js).toBe('function');
    expect(js.name).toBe('GraphQLClient');
  });

  test('generate a method for each query entry', async () => {
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

    expect(methodNames.length > 0).toBe(true);
    expect(queryEntries.length > 0).toBe(true);
    expect(found.length).toBe(queryEntries.length);
  });

  test('generate a method for each mutation entry', async () => {
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

    expect(methodNames.length > 0).toBe(true);
    expect(mutationEntries.length > 0).toBe(true);
    expect(found.length).toBe(mutationEntries.length);
  });

  test('using generated file', async () => {
    const client = await getMethodsFromEndpoint();

    // echo
    expect((await client.echo({ text: 'mock' })).result).toBe('nil says: mock');

    // mutation
    expect((await client.echo({})).errors[0]).toBe(
      'Variable "$text_0" of required type "String!" was not provided.'
    );
  });
});
