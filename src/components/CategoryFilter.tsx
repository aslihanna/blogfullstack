'use client'

import { motion } from 'framer-motion'

interface CategoryFilterProps {
  categories: Array<{
    _id: string
    name: string
    slug: string
    description?: string
    color: string
    icon: string
  }> | string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap justify-center gap-2"
    >
      {(categories || []).map((category, index) => {
        const categoryName = typeof category === 'string' ? category : (category as any).name
        const categoryKey = typeof category === 'string' ? category : (category as any)._id
        
        return (
          <motion.button
            key={categoryKey}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(categoryName)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === categoryName
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {categoryName}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
