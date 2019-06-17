# graphql-clientgen

Generate client script with [default queries](https://github.com/antoniopresto/graphql-clientgen/blob/master/client.ts#L73) for graphql projects

[antoniopresto.github.io/graphql-clientgen/](https://antoniopresto.github.io/graphql-clientgen/)

### [Work in progress]

### Basic usage

```ts
// server
import { printClient } from 'graphql-clientgen';

fs.writeFile(`${__dirname}/${client.ts}`, await printClient(graphqlSchema));

// client side
import client from '../generated/client.ts';

client.createCity({ code: 1001, name: '' }).then(console.log).catch(console.warn);
```

> [Complete generated code example](https://github.com/antoniopresto/graphql-clientgen/blob/master/client.ts#L152)


## TODO
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

