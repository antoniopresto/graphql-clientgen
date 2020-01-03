import React from 'react';
import { useClient } from '../examples/Provider';
import { storiesOf } from '@storybook/react';

const List = () => {
  const posts = useClient('PostFindMany', {
    fetchOnMount: true
  });

  const addNew = useClient('PostCreateOne', {
    afterMutate: /Post/
  });
  
  return (
    <div>
      {posts.loading || addNew.loading ? 'loading...' : ''}

      <ul>
        {(posts.result || []).slice(0, 10).map(p => (
          <li key={p!._id!}>{p?.title}</li>
        ))}
      </ul>

      <button
        onClick={() => {
          addNew.fetch({
            variables: { title: `new ${new Date().toISOString()}` }
          });
        }}
      >
        add New
      </button>
    </div>
  );
};

storiesOf('Posts', module).add('List', () => <List />);
