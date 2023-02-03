import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";

import _ from 'lodash';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

import { permissions } from './auth/permissions.js'

import fileTypeDefs from './typeDefs/fileTypeDefs.js'
import postTypeDefs from './typeDefs/postTypeDefs.js'
import fileResolver from './resolvers/fileResolver.js'
import postResolver from './resolvers/postResolver.js'

/*-------------------*/

async function startServer() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const app = express();
    const httpServer = http.createServer(app);

    const schema = makeExecutableSchema({
      typeDefs: [fileTypeDefs, postTypeDefs],
      resolvers: _.merge({}, fileResolver, postResolver)
    });

    const apolloServer = new ApolloServer({
      schema: applyMiddleware(schema, permissions),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await apolloServer.start();

    app.use(
      '/graphql',
      cors({
        methods: ['GET', 'POST', 'OPTIONS'],
        credentials: true,
        maxAge: 600
      }),
      bodyParser.json(),
      graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
      expressMiddleware(apolloServer, {
        context: ({ req, res }) => {
          if (!req.headers.authorization) return { user: null };
          const userDecoded = jwt.verify(req.headers.authorization, process.env.JWT_KEY);
          const user = userDecoded ? userDecoded : null;
          return { user };
        }
      }),
    );

    app.use(express.static(path.join(__dirname, './uploads')));

    app.use((req, res) => {
      res.send('👋 Hello by GraphQL App 😐');
    });

    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('connected to database');

    await new Promise((resolve) => httpServer.listen({ port: process.env.PORT }, resolve));
    console.log(`App is on ${process.env.NODE_ENV} Mode`);
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
  } catch (err) {
    console.log(err);
  }
}
startServer();
