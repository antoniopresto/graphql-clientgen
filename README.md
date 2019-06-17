# graphql-clientgen

Generate client script for graphql projects

### [Work in progress]

### Basic usage

```ts
import { printClient } from 'graphql-clientgen';

const clientCode = await printClient(graphqlSchema);
fs.writeFile(`${__dirname}/${client.ts}`, clientCode);
```

[Generated code example](https://github.com/antoniopresto/graphql-clientgen/blob/master/client.ts#L152)

- [x] generate typescript client
- [x] generate typed query methods
- [x] generate typed mutation methods
- [x] generate default fragments
- [ ] generate from endpoint
- [ ] print schema
- [ ] print query
- [ ] improve docs
- [ ] generate pure javascript version of the client
- [ ] generate jsdoc

