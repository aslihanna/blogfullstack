import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/create/',
        '/edit/',
        '/my-posts/',
        '/profile/',
      ],
    },
    sitemap: 'https://blogapp.com/sitemap.xml',
  }
}

