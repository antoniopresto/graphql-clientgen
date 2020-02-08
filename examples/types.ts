import { Method, MethodsDict, MethodsInfoDict } from 'graphql-clientgen';

export type Maybe<T> = T | null;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Filter = {
  title?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  PostCreateOne?: Maybe<PostCreateOnePayload>;
  PostDeleteById?: Maybe<Scalars['Boolean']>;
};

export type MutationPostCreateOneArgs = {
  title: Scalars['String'];
};

export type MutationPostDeleteByIdArgs = {
  _id: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  _id: Scalars['String'];
  title: Scalars['String'];
  updatedAt?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
};

export type PostCreateOnePayload = {
  __typename?: 'PostCreateOnePayload';
  record: Post;
  recordId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  PostFindMany?: Maybe<Array<Maybe<Post>>>;
  echo?: Maybe<Scalars['String']>;
};

export type QueryPostFindManyArgs = {
  filter?: Maybe<Filter>;
};

export type QueryEchoArgs = {
  text: Scalars['String'];
};

export interface Methods extends MethodsDict {
  PostFindMany: Method<QueryPostFindManyArgs, Query['PostFindMany']>;

  echo: Method<QueryEchoArgs, Query['echo']>;

  PostCreateOne: Method<MutationPostCreateOneArgs, Mutation['PostCreateOne']>;

  PostDeleteById: Method<
    MutationPostDeleteByIdArgs,
    Mutation['PostDeleteById']
  >;
}

export interface MethodsInfo extends MethodsInfoDict {
  PostFindMany: {
    type: '[Post]';
    schemaKey: 'PostFindMany';
    entityName: 'Post';
    isList: true;
    argsTSName: 'QueryPostFindManyArgs';
    returnTSName: "Query['PostFindMany']";
    isMutation: false;
    isQuery: true;
    isSubscription: false;
    field: {
      description: null;
      deprecationReason: null;
      type: '[Post]';
      args: [{ name: 'filter'; description: null; type: 'Filter' }];
      name: 'PostFindMany';
      isDeprecated: false;
    };
    isNonNull: false;
    kind: 'query';
  };

  echo: {
    type: 'String';
    schemaKey: 'echo';
    entityName: 'String';
    isList: false;
    argsTSName: 'QueryEchoArgs';
    returnTSName: "Query['echo']";
    isMutation: false;
    isQuery: true;
    isSubscription: false;
    field: {
      description: null;
      deprecationReason: null;
      type: 'String';
      args: [{ name: 'text'; description: null; type: 'String!' }];
      name: 'echo';
      isDeprecated: false;
    };
    isNonNull: false;
    kind: 'query';
  };

  PostCreateOne: {
    type: 'PostCreateOnePayload';
    schemaKey: 'PostCreateOne';
    entityName: 'PostCreateOnePayload';
    isList: false;
    argsTSName: 'MutationPostCreateOneArgs';
    returnTSName: "Mutation['PostCreateOne']";
    isMutation: true;
    isQuery: false;
    isSubscription: false;
    field: {
      description: null;
      deprecationReason: null;
      type: 'PostCreateOnePayload';
      args: [{ name: 'title'; description: null; type: 'String!' }];
      name: 'PostCreateOne';
      isDeprecated: false;
    };
    isNonNull: false;
    kind: 'mutation';
  };

  PostDeleteById: {
    type: 'Boolean';
    schemaKey: 'PostDeleteById';
    entityName: 'Boolean';
    isList: false;
    argsTSName: 'MutationPostDeleteByIdArgs';
    returnTSName: "Mutation['PostDeleteById']";
    isMutation: true;
    isQuery: false;
    isSubscription: false;
    field: {
      description: null;
      deprecationReason: null;
      type: 'Boolean';
      args: [{ name: '_id'; description: null; type: 'String!' }];
      name: 'PostDeleteById';
      isDeprecated: false;
    };
    isNonNull: false;
    kind: 'mutation';
  };
}
