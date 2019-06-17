# graphql-clientgen

Generate client script for graphql projects

### [Work in progress]

### Basic usage

```ts
import { printClient } from 'graphql-clientgen';

const clientCode = await printClient(graphqlSchema);
fs.writeFile(`${__dirname}/${client.ts}`, clientCode);
```

- [x] generate typescript client
- [x] generate typed query methods
- [x] generate typed mutation methods
- [x] generate default fragments
- [ ] generate from endpoint
- [ ] improve docs
- [ ] generate pure javascript version of the client
- [ ] handle custom resolvers
