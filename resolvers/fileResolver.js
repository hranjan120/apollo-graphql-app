import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import * as fs from 'fs';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import path from 'path';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const s3bucket = new AWS.S3();

/*
*------------------------------
*/
export default {
  Upload: GraphQLUpload,

  Query: {
    helloFile: () => {
      return 'Hello file'
    },
  },
  Mutation: {
    singleUpload: async (parent, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      const newFileName = crypto.randomBytes(8).toString('hex') + Date.now().toString() + path.extname(filename);
      const stream = createReadStream();
      const out = fs.createWriteStream(`./uploads/${newFileName}`);
      stream.pipe(out);

      return { filename, mimetype, encoding };
    },
    singleUploadStream: async (parent, args, { user }) => {
      const file = await args.file
      const { createReadStream, filename, mimetype, encoding } = await file;
      const newFileName = crypto.randomBytes(8).toString('hex') + Date.now().toString() + path.extname(filename);
      const fileStream = createReadStream();
      const uploadParams = {
        Bucket: `${process.env.AWS_BUCKET}/assets`,
        Key: newFileName,
        Body: fileStream,
        ACL: 'public-read',
        ContentType: mimetype
      };
      const result = await s3bucket.upload(uploadParams).promise();
      return { filename, mimetype, encoding, result };
    },
  }
};
