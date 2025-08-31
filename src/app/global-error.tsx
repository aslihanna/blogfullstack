'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Kritik Hata
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Uygulama başlatılırken bir hata oluştu
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

