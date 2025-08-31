'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary-200 dark:border-primary-700 border-t-primary-600 dark:border-t-primary-400 rounded-full"
      />
    </div>
  )
}



