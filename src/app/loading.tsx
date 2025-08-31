export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Yükleniyor...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Lütfen bekleyin
        </p>
      </div>
    </div>
  )
}


