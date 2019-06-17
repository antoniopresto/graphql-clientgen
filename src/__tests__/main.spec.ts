import test from 'ava';
import { printClient } from '../index';
import { schema } from './schema.spec';

// FIXME
test('regression', async t => {
  t.is((await printClient(schema)).length, 4200);
});
