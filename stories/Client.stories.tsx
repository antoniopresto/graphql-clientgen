import React from 'react';
import { useClient } from '../examples/Provider';
import { storiesOf } from '@storybook/react';

const List = () => {
  const [posts] = useClient('PostFindMany');

  return (
    <ul>
      {(posts.result || []).map(p => (
        <li>{p?.title}</li>
      ))}
    </ul>
  );
};

storiesOf('Posts', module).add('List', () => <List />);
