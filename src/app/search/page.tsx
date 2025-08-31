'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Calendar, User, Eye, Heart, MessageCircle } from 'lucide-react';

interface SearchResult {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: {
    name: string;
  };
  category: {
    name: string;
    color: string;
  };
  tags: Array<{
    name: string;
    color: string;
  }>;
  views: number;
  likes: number;
  commentCount: number;
  createdAt: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchTerm);
      window.history.pushState({}, '', url.toString());
      performSearch(searchTerm);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Arama Sonuçları
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Blog yazılarında ara..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ara
              </button>
            </div>
          </form>

          {query && (
            <p className="text-gray-600 dark:text-gray-400">
              "{query}" için {results.length} sonuç bulundu
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Aranıyor...</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((result, index) => (
              <motion.div
                key={result._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/blogs/${result.slug}`}>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
                        {result.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {result.excerpt}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {result.author.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(result.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {result.views}
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {result.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {result.commentCount}
                    </div>
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="flex items-center space-x-2">
                  {result.category && (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: result.category.color }}
                    >
                      {result.category.name}
                    </span>
                  )}
                  {result.tags && result.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              "{query}" için herhangi bir sonuç bulunamadı. Farklı anahtar kelimeler deneyin.
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tüm Blog Yazılarını Görüntüle
            </Link>
          </motion.div>
        )}

        {/* Initial State */}
        {!loading && !query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Blog Yazılarında Ara
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Arama yapmak için yukarıdaki arama kutusunu kullanın.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

