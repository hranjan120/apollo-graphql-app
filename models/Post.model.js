import mongoose from 'mongoose';
const { Schema } = mongoose;

const postSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  postStatus: { type: String, enum: ['1', '2'], default: '1' },
}, {
  timestamps: true
});

export default mongoose.model('post_test_datas', postSchema);
