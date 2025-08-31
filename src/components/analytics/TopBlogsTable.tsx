'use client';

import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  views: number;
  likes: number;
  commentCount: number;
}

interface TopBlogsTableProps {
  blogs: Blog[];
  title: string;
}

export default function TopBlogsTable({ blogs, title }: TopBlogsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Blog
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Yazar
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Kategori
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Görüntüleme
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Beğeni
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                Yorum
              </th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog, index) => (
              <motion.tr
                key={blog._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {blog.title}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {blog.author?.name || 'Anonim'}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {blog.category?.name || 'Genel'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {blog.views.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {blog.likes.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {blog.commentCount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

