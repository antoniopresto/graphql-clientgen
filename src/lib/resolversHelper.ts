import {
  GraphQLField,
  GraphQLObjectType,
  GraphQLSchema,
  isListType,
  isNonNullType
} from 'graphql';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';

export type ResolverStoreItem = {
  type: GraphQLObjectType; //eg: [city]
  schemaKey: string; // eg: cities
  entityName: string; // eg: City
  argsTSName: string; // eg: QueryMyCitiesArgs
  returnTSName: string; // eg: `Query['cities']`
  isList: boolean;
  isMutation: boolean;
  isQuery: boolean;
  isSubscription: boolean;
  field: GraphQLField<any, any>;
  isNonNull: boolean;
  kind: string // mutation, subscription, query
};

export type ResolversStore = Map<string, ResolverStoreItem>;

export function getResolversHelper(schema: GraphQLSchema) {
  let _resolversStore: ResolversStore = new Map();

  const finalRootTypes = {
    mutation: schema.getMutationType(),
    query: schema.getQueryType(),
    subscription: schema.getSubscriptionType()
  };

  const queryFields = finalRootTypes.query
    ? finalRootTypes.query.getFields()
    : {};

  const mutationFields = finalRootTypes.mutation
    ? finalRootTypes.mutation.getFields()
    : {};

  const subscriptionFields = finalRootTypes.subscription
    ? finalRootTypes.subscription.getFields()
    : {};

  let fields = {
    ...queryFields,
    ...mutationFields,
    ...subscriptionFields
  };

  const fieldKeys = Object.keys(fields);

  fieldKeys.forEach(schemaKey => {
    const field = fields[schemaKey];
    const type = field.type as GraphQLObjectType;
    const isList = isListType(field.type);
    const isNonNull = isNonNullType(field.type);

    let finalType = isNonNullType(field.type) ? field.type.ofType : field.type;
    const entityName = isListType(finalType)
      ? finalType.ofType.toString()
      : finalType.toString();

    const isMutation = !!mutationFields[schemaKey];
    const isQuery = !!queryFields[schemaKey];
    const isSubscription = !!subscriptionFields[schemaKey];

    let argsPrefix = '';

    if (isMutation) {
      argsPrefix = 'Mutation';
    }

    if (isQuery) {
      argsPrefix = 'Query';
    }

    if (isSubscription) {
      argsPrefix = 'Subscription';
    }
    
    const kind = argsPrefix.toLowerCase();

    let argsTSName = field.args.length
      ? `${argsPrefix}${upperFirst(camelCase(schemaKey))}Args`
      : '{}';

    let returnTSName = `${argsPrefix}['${schemaKey}']`;
    returnTSName = isNonNull ? returnTSName : `Maybe<${returnTSName}>`;

    const item = {
      type,
      schemaKey,
      entityName,
      isList,
      argsTSName,
      returnTSName,
      isMutation,
      isQuery,
      isSubscription,
      field,
      isNonNull,
      kind
    };

    _resolversStore.set(schemaKey, item);
  });

  return _resolversStore;
}
