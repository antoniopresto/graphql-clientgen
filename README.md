# graphql-clientgen

Generate [client script](https://github.com/antoniopresto/graphql-clientgen/blob/master/examples/generated.ts#L73) for graphql projects

A client-side method is generated for each query/mutation, with a default and customizable `fragment`:


### Installation

``npm install --save graphql-clientgen``
or 
``yarn add graphql-clientgen``


### Basic usage

```ts
// server:
import { printClient } from 'graphql-clientgen';
fs.writeFile(__dirname + '/client.ts', await printClient(graphqlSchema));

// client:
const { client } = new GraphQLClient({
  apiURL: "http://localhost:3777/graphql",
});

client.posts({}); // Promise<Post[]>
client.posts({}, {fragment: `id title`}); // Promise<(Partial<Post>)[]>
```

[Complete generated code example](https://github.com/antoniopresto/graphql-clientgen/blob/master/client.ts#L152)


[antoniopresto.github.io/graphql-clientgen/](https://antoniopresto.github.io/graphql-clientgen/)

### [Work in progress]
#### TODO
- [x] generate typescript client
- [x] generate typed query methods
- [x] generate typed mutation methods
- [x] generate default fragments
- [x] batch queries
- [ ] generate from endpoint
- [ ] print schema
- [ ] print query
- [ ] improve docs
- [ ] generate pure javascript version of the client
- [ ] generate jsdoc

