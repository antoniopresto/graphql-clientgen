import React from 'react';
import { useClient } from '../examples/Provider';
import { storiesOf } from '@storybook/react';

const List = () => {
  const renderRef = React.useRef(0);

  const posts = useClient('PostFindMany', {
    fetchOnMount: true
  });

  const addNew = useClient('PostCreateOne', {
    afterMutate: /Post/,
    middleware: async ctx => {
      if(ctx.fetchResponse) {
        console.log(ctx.fetchResponse.headers.get('content-type'))
      }
      return ctx
    }
  });

  const deleteById = useClient('PostDeleteById', {
    afterMutate: /Post/
  });

  console.log('render', ++renderRef.current, {
    loading: posts.loading,
    addNewLoading: addNew.loading
  });

  return (
    <div>
      <button
        onClick={() => {
          addNew.fetch({
            variables: { title: `new ${new Date().toISOString()}` }
          });
        }}
      >
        add New
      </button>

      <hr />
      {posts.loading || addNew.loading ? 'loading...' : ''}
      <hr />

      <ul>
        {(posts.result || []).slice(0, 10).map(p => (
          <li key={p!._id!}>
            <p
              style={{ cursor: 'pointer' }}
              onClick={() => {
                deleteById.fetch({ variables: { _id: p!._id } });
              }}
            >
              {p?.title}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

storiesOf('Posts', module).add('List', () => <List />);
