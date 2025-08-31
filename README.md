# Fullstack Blog Uygulaması

Modern ve kapsamlı bir blog uygulaması. Next.js 14, TypeScript, MongoDB ve Tailwind CSS kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### Kullanıcı Özellikleri
- ✅ Kullanıcı kaydı ve girişi
- ✅ Blog yazısı oluşturma ve düzenleme
- ✅ Zengin metin editörü (React Quill)
- ✅ Blog beğenme sistemi
- ✅ Yorum sistemi (CRUD işlemleri)
- ✅ Yorum beğenme sistemi
- ✅ Kategori ve etiket sistemi
- ✅ Arama ve filtreleme
- ✅ Sonsuz kaydırma
- ✅ Responsive tasarım

### Admin Paneli
- ✅ Dashboard istatistikleri
- ✅ Blog yönetimi
- ✅ Kullanıcı yönetimi
- ✅ Kategori yönetimi
- ✅ Etiket yönetimi
- ✅ Detaylı istatistikler

### SEO ve Performans
- ✅ Meta etiketleri
- ✅ Open Graph
- ✅ Twitter Cards
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ PWA desteği
- ✅ Optimized images

## 🛠️ Teknolojiler

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB, Mongoose
- **State Management:** Redux Toolkit
- **Authentication:** JWT
- **UI Components:** Lucide React, Framer Motion
- **Rich Text Editor:** React Quill
- **Notifications:** React Toastify

## 📦 Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/kullaniciadi/fullstack-blog.git
cd fullstack-blog
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
`.env.local` dosyası oluşturun:
```env
MONGODB_URI=mongodb://localhost:27017/blogapp
JWT_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
```

4. **Veritabanını başlatın:**
MongoDB'nin çalıştığından emin olun.

5. **Admin kullanıcısı oluşturun:**
```bash
node src/scripts/create-admin.js
```

6. **Uygulamayı başlatın:**
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🔐 Admin Girişi

- **Email:** admin@blogapp.com
- **Şifre:** admin123

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Admin paneli
│   ├── blogs/             # Blog sayfaları
│   ├── create/            # Blog oluşturma
│   ├── edit/              # Blog düzenleme
│   ├── login/             # Giriş sayfası
│   ├── register/          # Kayıt sayfası
│   └── profile/           # Profil sayfası
├── components/            # React bileşenleri
├── lib/                   # Yardımcı fonksiyonlar
├── models/                # Mongoose modelleri
├── store/                 # Redux store
└── scripts/               # Yardımcı scriptler
```

## 🚀 Deployment

### Vercel (Önerilen)
1. Vercel hesabınızda yeni proje oluşturun
2. GitHub repository'nizi bağlayın
3. Environment değişkenlerini ayarlayın
4. Deploy edin

### Diğer Platformlar
- Netlify
- Railway
- Heroku

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email:** merhaba@blogapp.com
- **Website:** https://blogapp.com

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak projelerin kullanımıyla geliştirilmiştir:
- Next.js
- Tailwind CSS
- MongoDB
- Redux Toolkit
- Framer Motion
