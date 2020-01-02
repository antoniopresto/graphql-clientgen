import React from 'react';
import { useClient } from '../examples/Provider';
import { storiesOf } from '@storybook/react';

const List = () => {
  const posts = useClient('PostFindMany', {  });

  return (
    <div>
      <ul>
        {(posts.result || []).map(p => (
          <li key={p!._id!}>{p?.title}</li>
        ))}
      </ul>
    </div>
  );
};

storiesOf('Posts', module).add('List', () => <List />);
