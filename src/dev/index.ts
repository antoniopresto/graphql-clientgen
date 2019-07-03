import './helpers';

import { getClientFromTSSource, getTSFile, monkeyPatchGot } from './helpers';

(async () => {
  const t = Date.now();
  monkeyPatchGot();
  
  await getClientFromTSSource(await getTSFile());

  const Cli = await getClientFromTSSource(await getTSFile());
  const { methods } = new Cli({});
  const { result } = await methods.echo();

  console.log((Date.now() - t) / 1000, result);
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
