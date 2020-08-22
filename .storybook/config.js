import React from 'react';
import { configure, addDecorator } from '@storybook/react';

const req = require.context('../stories', true, /\.stories.tsx/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

const CenterDecorator = storyFn => {
  return <div style={{ padding: 10 }}>{storyFn()}</div>;
};

addDecorator(CenterDecorator);

configure(loadStories, module);
