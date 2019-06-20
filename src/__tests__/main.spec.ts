import test from 'ava';
import { printClient } from '../index';
import { schema } from '../dev/schema-demo';

// FIXME
test('regression', async t => {
  t.is((await printClient(schema)).length, 5887);
});
