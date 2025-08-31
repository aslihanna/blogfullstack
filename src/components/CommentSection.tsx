'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Edit, 
  Trash2, 
  MoreVertical,
  Send,
  X
} from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  likes: string[];
  likeCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  replies?: Comment[];
  replyCount: number;
}

interface CommentSectionProps {
  blogId: string;
  blogSlug: string;
}

export default function CommentSection({ blogId, blogSlug }: CommentSectionProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async (page = 1) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments?page=${page}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        if (page === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setHasMore(data.pagination.hasNextPage);
        setCurrentPage(data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Yorum gönderilirken hata:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          content: replyContent,
          parentCommentId 
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Yanıtı ilgili yoruma ekle
        setComments(prev => prev.map(comment => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), data.comment]
            };
          }
          return comment;
        }));
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Yanıt gönderilirken hata:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === commentId ? data.comment : comment
        ));
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Yorum düzenlenirken hata:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      console.error('Yorum silinirken hata:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === commentId ? data.comment : comment
        ));
      }
    } catch (error) {
      console.error('Yorum beğenirken hata:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isAuthor = user && comment.author._id === user._id;
    const isLiked = user && comment.likes.includes(user._id);
    const canEdit = isAuthor || (user && user.role === 'admin');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700' : 'mb-4'}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">(düzenlendi)</span>
              )}
            </div>

            {editingComment === comment._id ? (
              <div className="mb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEditComment(comment._id)}
                    disabled={submitting}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {comment.content}
              </p>
            )}

            <div className="flex items-center space-x-4 text-sm">
              {isAuthenticated && (
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className={`flex items-center space-x-1 ${
                    isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likeCount}</span>
                </button>
              )}

              {isAuthenticated && !isReply && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500"
                >
                  <Reply className="w-4 h-4" />
                  <span>Yanıtla</span>
                </button>
              )}

              {canEdit && editingComment !== comment._id && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment._id);
                      setEditContent(comment.content);
                    }}
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Düzenle</span>
                  </button>

                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Sil</span>
                  </button>
                </>
              )}
            </div>

            {/* Yanıt formu */}
            {replyingTo === comment._id && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleSubmitReply(comment._id)}
                    disabled={submitting}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    Yanıtla
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}

            {/* Yanıtlar */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply._id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Yorumlar ({comments.length})
        </h3>
      </div>

      {/* Yorum formu */}
      {isAuthenticated ? (
        <div className="mb-6">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {newComment.length}/1000 karakter
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Yorum Gönder</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Yorum yapmak için{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              giriş yapın
            </a>
          </p>
        </div>
      )}

      {/* Yorumlar listesi */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </AnimatePresence>
      </div>

      {/* Daha fazla yükle */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchComments(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Daha Fazla Yorum Yükle
          </button>
        </div>
      )}

      {comments.length === 0 && !loading && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        </div>
      )}
    </div>
  );
}

