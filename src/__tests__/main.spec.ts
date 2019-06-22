import test from 'ava';
import { schema } from '../dev/schema-demo';
import { printClient } from '../lib/generate-client';
import { getClient, getJSFile, getTSFile, TEST_API } from '../dev/helpers';

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

test('using generated file', async t => {
  const client = await getClient();

  // echo
  t.is((await client.echo({ text: 'HY! echo' })).result, 'nil says: HY! echo');

  // mutation
  t.is(
    (await client.designManagementUpload()).errors[0].message,
    'Variable input_0 of type DesignManagementUploadInput! was provided invalid value'
  );
});
