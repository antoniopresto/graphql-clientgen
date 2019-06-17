import { GraphQLSchema, GraphQLType, isListType, isScalarType } from 'graphql';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';

import {
  ObjectTypeComposerArgumentConfigMap,
  schemaComposer
} from 'graphql-compose';

let _resolversStore: ResolversStore;

export function getResolversHelper(schema: GraphQLSchema) {
  if (_resolversStore) return _resolversStore;

  const finalRootTypes = {
    mutation: schema.getMutationType(),
    query: schema.getQueryType(),
    subscription: schema.getSubscriptionType()
  };

  let finalFields = {
    ...(finalRootTypes.query ? finalRootTypes.query.getFields() : {}),
    ...(finalRootTypes.mutation ? finalRootTypes.mutation.getFields() : {}),
    ...(finalRootTypes.subscription
      ? finalRootTypes.subscription.getFields()
      : {})
  };

  _resolversStore = new Map([]);

  schemaComposer.types.forEach((_, tcType) => {
    const resolvers =
      typeof tcType.getResolvers === 'function' && tcType.getResolvers();
    if (!resolvers || !resolvers.size) return;
    const type = tcType.getType();

    resolvers.forEach((resolver, resolverName) => {
      const entityName = type.name;
      const args = resolver.args;
      const path = `${entityName}.${resolverName}`;
      const camelPath = camelCase(path);
      // the final build field on graphql schema schema
      const finalField = finalFields[camelPath];

      if (!finalField) {
        console.log(
          `can't find a field with name "${camelPath}" in the final graphql schema`
        );
        return;
      }

      if (!resolver.kind) {
        throw new Error(`resolver without kind for ${path}`);
      }

      const returnType = finalFields[camelPath].type;
      const kind = resolver.kind;
      const isQuery = kind === 'query';
      const isMutation = kind === 'mutation';

      if (isQuery === isMutation) {
        throw new Error('isQuery and isMutation cant be equals');
      }

      // printJSON(resolver);

      let returnTSType: string = (() => {
        const isList = isListType(returnType);
        let ofType: GraphQLType = isList
          ? (returnType as any).ofType
          : returnType;

        let returning = upperFirst(ofType.toString());

        if (isScalarType(ofType)) {
          returning = `Scalars['${returning}']`;
        }

        return isList ? `${returning}[]` : returning;
      })();

      const argsTSType =
        upperFirst(kind) +
        upperFirst(entityName) +
        upperFirst(resolverName) +
        'Args';

      _resolversStore.set(resolver.displayName, {
        entityName,
        path,
        args,
        isQuery,
        isMutation,
        returnTSType,
        argsTSType,
        resolverName,
        camelPath
      });
    });
  });

  return _resolversStore;
}

export type ResolverStoreItem = {
  // path: string; // ex: `${entityName}.${fieldInfo.resolverName}`
  args: ObjectTypeComposerArgumentConfigMap<any>; // ex: TCEntity.getResolver('findById').args
  path: string; // `${entity}.${resolverName}`
  camelPath: string; // camelCase('${entity}.${resolverName}')
  resolverName: string; // ex: "findById" or "customOpName"
  entityName: string; // ex user
  isQuery: boolean;
  isMutation: boolean;
  returnTSType: string; // ex: LanguagesPagination | UpdateByIdlanguagesPayload
  argsTSType: string; // ex: MutationCreattteUpdateOneArgs
};

export type ResolversStore = Map<string, ResolverStoreItem>;
