import {
  parseFragmentConfig,
  OpKind,
  useClientFactory
} from 'graphql-clientgen';

import { Methods } from './types';

export const query = {
  PostFindMany: (config?: any) => `
        query PostFindMany($filter: Filter){
            PostFindMany(filter: $filter){
                ${parseFragmentConfig(
                  `_id
                        title
                        updatedAt
                        createdAt`,
                  config
                )}
            }
        }`,

  echo: (config?: any) => `
        query echo($text: String!){
                ${parseFragmentConfig(`echo(text: $text)`, config)}
        }`,

  PostCreateOne: (config?: any) => `
        mutation PostCreateOne($title: String!){
            PostCreateOne(title: $title){
                ${parseFragmentConfig(`recordId`, config)}
            }
        }`,

  PostDeleteById: (config?: any) => `
        mutation PostDeleteById($_id: String!){
                ${parseFragmentConfig(`PostDeleteById(_id: $_id)`, config)}
        }`
};

export const AppMethods: Methods = {
  PostFindMany: (variables, config, client) => {
    return client.exec(variables, {
      url: client.url,
      entityName: 'Post',
      schemaKey: 'PostFindMany',
      query: query.PostFindMany(config),
      kind: OpKind.query,
      ...config
    });
  },

  echo: (variables, config, client) => {
    return client.exec(variables, {
      url: client.url,
      entityName: 'String',
      schemaKey: 'echo',
      query: query.echo(config),
      kind: OpKind.query,
      ...config
    });
  },

  PostCreateOne: (variables, config, client) => {
    return client.exec(variables, {
      url: client.url,
      entityName: 'PostCreateOnePayload',
      schemaKey: 'PostCreateOne',
      query: query.PostCreateOne(config),
      kind: OpKind.mutation,
      ...config
    });
  },

  PostDeleteById: (variables, config, client) => {
    return client.exec(variables, {
      url: client.url,
      entityName: 'Boolean',
      schemaKey: 'PostDeleteById',
      query: query.PostDeleteById(config),
      kind: OpKind.mutation,
      ...config
    });
  }
};

export const AppMethodsInfo = {
  PostFindMany: {
    type: '[Post]',
    schemaKey: 'PostFindMany',
    entityName: 'Post',
    isList: true,
    argsTSName: 'QueryPostFindManyArgs',
    returnTSName: "Query['PostFindMany']",
    isMutation: false,
    isQuery: true,
    isSubscription: false,
    field: {
      description: null,
      deprecationReason: null,
      type: '[Post]',
      args: [{ name: 'filter', description: null, type: 'Filter' }],
      name: 'PostFindMany',
      isDeprecated: false
    },
    isNonNull: false,
    kind: 'query'
  },

  echo: {
    type: 'String',
    schemaKey: 'echo',
    entityName: 'String',
    isList: false,
    argsTSName: 'QueryEchoArgs',
    returnTSName: "Query['echo']",
    isMutation: false,
    isQuery: true,
    isSubscription: false,
    field: {
      description: null,
      deprecationReason: null,
      type: 'String',
      args: [{ name: 'text', description: null, type: 'String!' }],
      name: 'echo',
      isDeprecated: false
    },
    isNonNull: false,
    kind: 'query'
  },

  PostCreateOne: {
    type: 'PostCreateOnePayload',
    schemaKey: 'PostCreateOne',
    entityName: 'PostCreateOnePayload',
    isList: false,
    argsTSName: 'MutationPostCreateOneArgs',
    returnTSName: "Mutation['PostCreateOne']",
    isMutation: true,
    isQuery: false,
    isSubscription: false,
    field: {
      description: null,
      deprecationReason: null,
      type: 'PostCreateOnePayload',
      args: [{ name: 'title', description: null, type: 'String!' }],
      name: 'PostCreateOne',
      isDeprecated: false
    },
    isNonNull: false,
    kind: 'mutation'
  },

  PostDeleteById: {
    type: 'Boolean',
    schemaKey: 'PostDeleteById',
    entityName: 'Boolean',
    isList: false,
    argsTSName: 'MutationPostDeleteByIdArgs',
    returnTSName: "Mutation['PostDeleteById']",
    isMutation: true,
    isQuery: false,
    isSubscription: false,
    field: {
      description: null,
      deprecationReason: null,
      type: 'Boolean',
      args: [{ name: '_id', description: null, type: 'String!' }],
      name: 'PostDeleteById',
      isDeprecated: false
    },
    isNonNull: false,
    kind: 'mutation'
  }
};

export const useClient = useClientFactory<any, Methods>();
