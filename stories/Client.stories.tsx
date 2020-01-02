import React from 'react';
import { useClient } from '../examples/Provider';
import { storiesOf } from '@storybook/react';

const List = () => {
  const posts = useClient('PostFindMany', { fetchOnMount: true });
  
  return (
    <ul>
      {(posts.result || []).map(p => (
        <li key={p!._id!}>{p?.title}</li>
      ))}
    </ul>
  );
};

storiesOf('Posts', module).add('List', () => <List />);
