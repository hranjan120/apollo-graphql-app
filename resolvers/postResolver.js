import Joi from 'joi';
import jwt from 'jsonwebtoken';

import { GraphQLError } from 'graphql';
import Post from '../models/Post.model.js';

/*
*------------------------------
*/
export default {
  Query: {
    hello: () => {
      return 'Hello world'
    },
    userLogin: async () => {
      const token = jwt.sign({
        data: { name: 'Graphql User', role: 'admin' }
      }, process.env.JWT_KEY, { expiresIn: '30d' });
      return token;
    },
    getAllPosts: async () => {
      const posts = await Post.find();
      return posts;
    },
    getPost: async (parent, args, context, info) => {
      const { id } = args;
      return await Post.findById(id);
    }
  },
  Mutation: {
    createPost: async (parent, args, context, info) => {
      const schema = Joi.object({
        postStatus: Joi.string().required().valid('1', '2').label('Status'),
        title: Joi.string().max(150).required().label('Title'),
        description: Joi.string().max(250).required().label('Description'),
      });
      const { value, error } = schema.validate(args.post, { abortEarly: false });
      if (error) {
        throw new GraphQLError('Fail to create a post', {
          extensions: { code: 'BAD_USER_INPUT', errorDetail: error.details[0].message },
        });
      }

      const { title, description, postStatus } = args.post;
      const postData = new Post({
        title,
        description,
        postStatus
      })
      await postData.save();
      return postData;
    },
    deletePost: async (parent, args, context, info) => {
      const { id } = args;
      await Post.findByIdAndRemove(id);
      return "OK, Post Deleted";
    },
    updatePost: async (parent, args, context, info) => {
      const { id } = args;
      const { title, description, postStatus } = args.post;
      const post = await Post.findByIdAndUpdate(id, { title, description, postStatus }, { new: true });
      return post;
    },
  }
};
