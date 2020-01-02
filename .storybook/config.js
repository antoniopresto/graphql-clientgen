import React from 'react';
import { configure, addDecorator } from '@storybook/react';
import { GraphQLProvider } from '../examples/Provider';
import { GraphQLClient } from '../examples/Client';

const req = require.context('../stories', true, /\.stories.tsx/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

const CenterDecorator = storyFn => {
  const client = React.useMemo(() => {
    return new GraphQLClient({ url: 'http://localhost:3000/graphql' });
  }, []);

  window.__GraphQLClient__ = client;

  return (
    <GraphQLProvider client={client}>
      <div style={{ padding: 10 }}>{storyFn()}</div>
    </GraphQLProvider>
  );
};

addDecorator(CenterDecorator);

configure(loadStories, module);
