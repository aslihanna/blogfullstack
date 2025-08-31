export default function MyPostsSimpleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-14">
                <div className="text-xl font-semibold text-gray-800 dark:text-white">
                  BlogApp
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Basit Test Sayfası
                </div>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}


