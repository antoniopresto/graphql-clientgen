import './helpers';
import sinon from 'sinon';

import { getClientFromTSSource, getTSFile } from './helpers';

(async () => {
  const t = Date.now();

  await getClientFromTSSource(await getTSFile());

  const Cli = await getClientFromTSSource(await getTSFile());
  const { methods } = new Cli({});
  const { result, errors } = await methods.namespace({ fullPath: 'aaaa' });

  console.log((Date.now() - t) / 1000, result, errors);
})();

// import { schema } from './schema-demo';
//
// const queryType = schema.getQueryType();
// const mutationType = schema.getMutationType();
//
// const mutationFields = mutationType && mutationType.getFields();
// const queryFields = queryType && queryType.getFields();
//
// console.log(mutationFields, queryFields)
