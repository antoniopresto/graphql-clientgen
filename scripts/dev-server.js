const express = require('express');
const graphqlHTTP = require('express-graphql');
const composer = require('graphql-compose').schemaComposer;
const faker = require('faker');
const cors = require('cors');

composer.createTC(`
  type Post {
    _id: String!
    title: String!
    updatedAt: String
    createdAt: String
  }
`);

function fakePost() {
  return {
    _id: faker.random.uuid(),
    title: faker.name.firstName(),
    createdAt: new Date().toISOString(),
    updatedAt: faker.date.past().toISOString()
  };
}

module.exports = async function start(cb, port = 3000) {
  const app = express();

  app.use(function(req, res, next) {
    setTimeout(() => {
      next();
    }, 100);
  });

  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  let posts = [...Array(100)].map(() => fakePost());

  composer.Mutation.addFields({
    PostCreateOne: {
      name: 'PostCreateOne',
      type: `type PostCreateOnePayload {record: Post!, recordId: String!} `,
      args: {
        title: 'String!'
      },
      resolve: (_, args) => {
        const post = fakePost();
        post.title = args.title;
        posts.push(post);
        return { record: post, recordId: post._id };
      }
    }
  });

  composer.Query.addFields({
    PostFindMany: {
      name: 'PostFindMany',
      args: {
        filter: `input Filter { title: String }`
      },
      type: `[Post]`,
      resolve: () => posts
    }
  });

  composer.Query.addFields({
    echo: {
      type: 'String',
      name: 'echo',
      args: {
        text: 'String!'
      },
      resolve(_, args) {
        return `nil says: ${args.text}`;
      }
    }
  });

  app.use(
    '/graphql',
    graphqlHTTP({
      schema: composer.buildSchema(),
      graphiql: true
    })
  );

  const listen = async port => {
    return new Promise((resolve, reject) => {
      let payload = {};

      payload.server = app.listen(port, err => {
        if (err) return reject(err);
        resolve(payload);
      });
    });
  };

  try {
    const { server } = await listen(port);
    cb && cb(null, port, server.close);
    return server.close;
  } catch (e) {
    cb(e);
  }
};
