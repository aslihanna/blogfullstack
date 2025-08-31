import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Yorum içeriği zorunludur'],
    trim: true,
    maxlength: [1000, 'Yorum 1000 karakterden uzun olamaz']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Yazar bilgisi zorunludur']
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog bilgisi zorunludur']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
CommentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

CommentSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Indexes
CommentSchema.index({ blog: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });

// Instance methods
CommentSchema.methods.toggleLike = async function(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const likeIndex = this.likes.indexOf(userObjectId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userObjectId);
  }
  
  return await this.save();
};

CommentSchema.methods.markAsEdited = async function() {
  this.isEdited = true;
  this.editedAt = new Date();
  return await this.save();
};

// Static methods
CommentSchema.statics.findByBlog = function(blogId: string) {
  return this.find({ blog: blogId, parentComment: null })
    .populate('author', 'name email avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name email avatar'
      }
    })
    .sort({ createdAt: -1 });
};

CommentSchema.statics.findReplies = function(commentId: string) {
  return this.find({ parentComment: commentId })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });
};

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

