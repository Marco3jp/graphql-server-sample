import {ApolloServer, gql} from 'apollo-server';
import * as fs from "fs";

const typeDefs = gql`

    type Store {
        id: ID!
        name: String!
        address: String
    }

    type Query {
        stores: [Store!]!
    }
`;

const database = loadDatabase();

const resolvers = {
    Query: {
        stores: () => database.stores
    },
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
    console.log(`🚀  Server ready at ${url}`);
});


function loadDatabase() {
    const file = fs.readFileSync('database.json', {encoding: "utf8"});
    return JSON.parse(file);
}

function saveDatabase(data) {
    const fileBody = JSON.stringify(data);
    fs.writeFileSync('database.json', fileBody);
}