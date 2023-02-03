import { rule, shield, and } from "graphql-shield";

const isAuthenticated = rule()((parent, args, { user }) => {
  return user !== null;
});

const isAdmin = rule()((parent, args, { user }) => {
  return user !== null && user.role === 'admin';
});

export const permissions = shield({
  Query: {
    hello: and(isAuthenticated, isAdmin),
    getAllPosts: isAuthenticated
  },
  Mutation: {
    singleUpload: isAuthenticated,
    singleUploadStream: isAuthenticated
  },
});