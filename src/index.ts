import { GraphQLClient as _GraphQLClient } from './template/Client';
import { GraphQLProvider as _GraphQLProvider } from './template/Provider';
import { GraphQLStore as _GraphQLStore } from './template/Store';

import { printClient as print } from './lib/generate-client';
export { printFromEndpoint } from './lib/printFromEndpoint';

export type GraphQLClient = typeof _GraphQLClient;
export type GraphQLProvider = typeof _GraphQLProvider;
export type GraphQLStore = typeof _GraphQLStore;

export const printClient = print;
export default print;
