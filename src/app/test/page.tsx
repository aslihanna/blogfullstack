export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Test Sayfası
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Uygulama çalışıyor!
        </p>
        <div className="mt-8">
          <a 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  )
}


