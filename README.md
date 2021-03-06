# graphql-clientgen
>  [Work in progress]

Generate typescript [client script](https://github.com/antoniopresto/graphql-clientgen/blob/master/examples/Client.ts) with batch queries for graphql projects.
One client-side method is generated for each query/mutation, with a default and customizable `fragment`.

## Basic usage
1 ) `npm install --save graphql-clientgen` or `yarn add graphql-clientgen`

2 ) Generate the client code:

Insert this script in the `scripts` section in your package.json
```json
  "scripts": {
    "get-client": "get-client http://localhost:3777/graphql dest-path/",
  }
```
then run: `npm run get-client`

3) Using the generated code

```ts
import GraphQLClient from './Client.ts';

const { methods } = new GraphQLClient({
  url: "http://localhost:3777/graphql",
});

// assuming there is a query called findUser, the generated code will accept
// arguments for the corresponding input type
methods.findUser({ filter: { name: 'Maggie' } }); // Promise<Maybe<User>>

methods.posts({}); // Promise<Post[]>

// one default query is generated for each query/mutation,
// but we can pass a custom fragment.
methods.posts({}, { fragment: `id title` }); // Promise<(Partial<Post>)[]>
```

### cli:

`$ get-client http://localhost:3777/graphql`

`$ get-client --help`

### api

```ts
// from schema
import { printClient } from 'graphql-clientgen';
let graphqlSchema: GraphQLSchema;
const client = await printClient(graphqlSchema);

// Or from endpoint
import { printFromEndpoint } from 'graphql-clientgen';
const { status, client } = await printFromEndpoint(
  'http://localhost:3000/graphql'
);x

fs.writeFile(__dirname + '/client.ts', client);
```

[Complete generated code example](https://github.com/antoniopresto/graphql-clientgen/blob/master/client.ts#L152)

[antoniopresto.github.io/graphql-clientgen/](https://antoniopresto.github.io/graphql-clientgen/)

#### TODO

- [x] generate typescript client
- [x] generate typed query methods
- [x] generate typed mutation methods
- [x] generate default fragments
- [x] batch queries
- [x] generate from endpoint
- [ ] print schema
- [ ] print query
- [ ] improve docs
- [ ] generate pure javascript version of the client
