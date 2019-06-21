# graphql-clientgen

Generate [client script](https://github.com/antoniopresto/graphql-clientgen/blob/master/examples/generated.ts#L73) for graphql projects

A client-side method is generated for each query or mutation, with default customizable `fragment`:
```ts
// generated
client.posts = (variables: QueryPostsArgs, options?: FetcherConfig): Promise<Post[]> => { /**/ };
client.createPost = (variables: MutationCreatePostArgs, options?: FetcherConfig): Promise<Post> => { /**/ };
...

// usage
client.posts({}); Promise<Post[]>
client.posts({}, {fragment: `id title`}); Promise<(Partial<Post>)[]>
```

[antoniopresto.github.io/graphql-clientgen/](https://antoniopresto.github.io/graphql-clientgen/)


### Basic usage

```ts
// server
import { printClient } from 'graphql-clientgen';

fs.writeFile(__dirname + '/client.ts', await printClient(graphqlSchema));
```

> [Complete generated code example](https://github.com/antoniopresto/graphql-clientgen/blob/master/client.ts#L152)


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

