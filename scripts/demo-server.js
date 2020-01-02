const app = require('express')();
const graphqlHTTP = require('express-graphql');
const composer = require('graphql-compose').schemaComposer;
const faker = require('faker');

const PORT = 3000;

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

let posts = [...Array(100)].map(() => fakePost());

composer.Mutation.addFields({
  PostCreateOne: {
    name: 'PostCreateOne',
    type: `type PostCreateOnePayload {record: Post!, recordId: String!} `,
    args: {
      title: 'String!'
    },
    resolve: ({ args }) => {
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

app.use(
  '/graphql',
  graphqlHTTP({
    schema: composer.buildSchema(),
    graphiql: true
  })
);

module.exports = function start(cb) {
  app.listen(PORT, err => {
    if (err) {
      cb(err);
      return console.log(err);
    }

    console.log(`App listening at http://loccalhost:${PORT}`);

    cb(err, PORT);
  });
};
