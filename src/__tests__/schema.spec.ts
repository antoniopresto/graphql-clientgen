import { schemaComposer } from 'graphql-compose';

// You may use SDL format for type definition
const CityTC = schemaComposer.createObjectTC(`
  type City {
    code: String!
    name: String!
    population: Int
    countryCode: String
    tz: String
  }
`);

// Add resolver method
CityTC.addResolver({
  kind: 'query',
  name: 'findMany',
  args: {
    filter: `input CityFilterInput {
      code: String!
    }`,
    limit: {
      type: 'Int',
      defaultValue: 20
    },
    skip: 'Int'
    // ... other args if needed
  },
  type: ['City'], // array of cities
  resolve: async () => {
    return [];
  }
});

// Add resolver method
CityTC.addResolver({
  kind: 'mutation',
  name: 'createOne',
  args: {
    payload: schemaComposer.createInputTC(`input CreateCityPayload {
        code: String!
        name: String!
        population: Int
        countryCode: String
        tz: String
    }`)
  },
  type: 'City',
  resolve: async () => {
    return null;
  }
});

schemaComposer.Query.addFields({
  cities: CityTC.getResolver('findMany')
});

schemaComposer.Query.addFields({
  createCity: CityTC.getResolver('createOne')
});

export const schema = schemaComposer.buildSchema();
