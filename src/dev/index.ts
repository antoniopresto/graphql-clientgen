import { getMethodsFromEndpoint } from './helpers';

(async () => {
  const cli = await getMethodsFromEndpoint();
  console.log(cli)
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
