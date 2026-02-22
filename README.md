# Idea Foundation – Admin Dashboard & API

ئەم پڕۆژەیە دوو بەش هەیە: فڕۆنتەند (React + Vite) بۆ داشبۆردی بەڕێوەبردن و باکەند (PHP) بۆ API. هەموو شتان سازکراون بۆ دێپلۆی لە Hostinger بە شێوەی public_html/api و public_html/dashboard.

## پێکهاتە و سترەکتچر
```
idea-dashboard/
├── src/                                 # React + Vite کۆدەکانی داشبۆرد
│   ├── api/
│   │   ├── axiosConfig.js               # axios base + interceptors (JWT, 401)
│   │   └── queryClient.js               # TanStack Query client
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   └── shared/
│   │       ├── AuthorModal.jsx
│   │       ├── BooksModal.jsx
│   │       ├── CategoryModal.jsx
│   │       ├── Header.jsx
│   │       ├── ProtectedRoute.jsx
│   │       ├── Sidebar.jsx
│   │       ├── SubcategoryModal.jsx
│   │       └── UsersModal.jsx
│   ├── constants/
│   │   └── endpoints.js
│   ├── features/
│   │   ├── auth/
│   │   │   └── index.js
│   │   ├── authors/
│   │   │   ├── index.js
│   │   │   └── useAuthorsQuery.js
│   │   ├── books/
│   │   │   ├── index.js
│   │   │   └── useBooksQuery.js
│   │   ├── categories/
│   │   │   └── useCategoriesQuery.js
│   │   ├── dashboard/
│   │   │   ├── index.js
│   │   │   ├── useOverviewQuery.js
│   │   │   ├── useStatsQuery.js
│   │   │   └── useActivityQuery.js
│   │   ├── subcategories/
│   │   │   └── useSubcategoriesQuery.js
│   │   └── users/
│   │       └── useUsersQuery.js
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── AuthorsCreate.jsx
│   │   ├── AuthorsEdit.jsx
│   │   ├── AuthorsList.jsx
│   │   ├── BooksCreate.jsx
│   │   ├── BooksEdit.jsx
│   │   ├── BooksList.jsx
│   │   ├── CategoriesCreate.jsx
│   │   ├── CategoriesEdit.jsx
│   │   ├── CategoriesList.jsx
│   │   ├── DashboardOverview.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── SubcategoriesCreate.jsx
│   │   ├── SubcategoriesEdit.jsx
│   │   └── SubcategoriesList.jsx
│   ├── services/
│   │   ├── admin.js
│   │   └── public.js
│   ├── store/
│   │   └── authStore.js
│   ├── utils/
│   │   └── slugify.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── backend/                             # PHP API
│   ├── public/
│   │   ├── .htaccess
│   │   └── index.php
│   ├── config/
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── jwt.php
│   │   └── r2.php
│   ├── controllers/
│   │   ├── Admin/
│   │   │   ├── AuthController.php
│   │   │   ├── AuthorManager.php
│   │   │   ├── BookManager.php
│   │   │   ├── CategoryManager.php
│   │   │   ├── DevController.php
│   │   │   ├── SettingsManager.php
│   │   │   ├── StatsController.php
│   │   │   ├── StorageController.php
│   │   │   └── UserManager.php
│   │   └── Public/
│   │       ├── AuthorController.php
│   │       ├── BookController.php
│   │       ├── CategoryController.php
│   │       ├── DownloadController.php
│   │       ├── SearchController.php
│   │       └── SettingsController.php
│   ├── middleware/
│   │   ├── AuthMiddleware.php
│   │   ├── CorsMiddleware.php
│   │   ├── RateLimitMiddleware.php
│   │   └── SecurityHeadersMiddleware.php
│   ├── core/
│   │   ├── Controller.php
│   │   ├── Model.php
│   │   └── Router.php
│   ├── routes/
│   │   ├── .htaccess
│   │   └── api.php
│   ├── utils/
│   │   ├── JWTHandler.php
│   │   ├── Logger.php
│   │   ├── R2Service.php
│   │   ├── Response.php
│   │   └── Validator.php
│   ├── database/
│   │   ├── schema.sql
│   │   └── seeds.sql
│   ├── bootstrap.php
│   ├── composer.json
│   └── composer.lock
├── deploy/                              # فایلەکانی دێپلۆی و نموونەی ENV
│   ├── ideafoundation_hostinger.sql
│   ├── api.htaccess
│   ├── dashboard.htaccess
│   ├── backend.env.example
│   └── .env.production.example
├── public/
│   └── vite.svg
├── .env.development
├── .env.production
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── README.md
```

## تێکنەلۆجیاکان
- Frontend: React + Vite، TanStack Query، React Hook Form + Zod، axios، lucide-react، react-toastify
- Backend: PHP 8+، PDO/MySQL، firebase/php-jwt، vlucas/phpdotenv، Guzzle (R2)
- DB: MySQL (utf8mb4/InnoDB)، Viewـەکانی ئامادەکراو
- Auth: JWT Bearer

## دامەزراندنی ناوخۆ (Development)
- پێویستییەکان: Node.js 18+، PHP 8+ و Composer، MySQL 8+
- ڕێکخستنی Backend:
  1) `cp deploy/backend.env.example backend/.env` و ئەم خانانە دابنێ:  
     DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD, FRONTEND_ORIGIN=http://localhost:5173
  2) SQL import بکە: `deploy/ideafoundation_hostinger.sql`
  3) Apache/Nginx بۆ backend/public ڕیکوێستەکان بگەیەنە index.php بە .htaccess
- ڕێکخستنی Frontend:
  - ئەگەر پێویست بوو: `.env` → `VITE_API_BASE_URL=http://localhost/idea-backend/public`
- فرمانەکان:
  - Frontend: `npm install`، `npm run dev`، `npm run build`، `npm run lint`
  - Backend: `composer install`

## دێپلۆی لە Hostinger
- Backend → `public_html/api`
  - `.htaccess`: `deploy/api.htaccess` → `public_html/api/.htaccess`
  - `.env`: `public_html/api/.env` → DB_* و `FRONTEND_ORIGIN=https://dashboard.ideafoundation.co`
- Frontend → `public_html/dashboard`
  - Build: `npm run build` → کۆپی `dist/`
  - `.htaccess` بۆ SPA: `deploy/dashboard.htaccess` → `public_html/dashboard/.htaccess`
  - لە کاتی build: `.env.production` → `VITE_API_BASE_URL=https://ideafoundation.co/api/public`

## بنکەدراوە و Viewـەکان
- خشتەکان: users, categories, subcategories, authors, books, book_authors, book_specifications, logs, admin_logs, settings
- Viewـەکان:
  - `full_book_details` → joinی ناوەڕاست بۆ کتێب و نووسەران
  - `dashboard_summary` → total_active_books, total_downloads, unique_visitors, total_authors, downloads_today
- ئەدمینی نموونە (seed):  
  Email: `admin@idea.foundation` — Password: `password` (پاش دێپلۆی گۆڕی)

## API
- Public
  - GET `/api/books`, `/api/books/{id}`
  - GET `/api/categories`, `/api/authors`, `/api/authors/{id}`
  - GET `/api/settings`, `/api/search`
  - GET `/api/books/{id}/download` (Rate limited)
- Admin
  - POST `/api/admin/login`
  - Books: GET/POST/PUT/DELETE `/api/admin/books`, `/api/admin/books/{id}`
  - Authors/Categories/Subcategories: CRUD
  - Users: CRUD
  - Settings: GET/PUT/DELETE
  - Stats:
    - GET `/api/admin/stats` (summary)
    - GET `/api/admin/stats/metrics?type=downloads|views|books&period=1d|7d|30d|total`
    - GET `/api/admin/stats/overview?days=30`
    - GET `/api/admin/stats/activity`

## چۆنیەتی خواردنەوەی API لە داشبۆرد
- axios base URL: `VITE_API_BASE_URL`؛ ئەگەر نەبوو → fallback بۆ localhost (src/api/axiosConfig.js)
- JWT:
  - Login → token لە localStorage
  - Interceptor 401 → logout + redirect، بەجگە لە login بۆ نیشاندانی هەڵە
- Features گرنگ:
  - BooksList: search ٢ پیت+، فلتەرەکان
  - BooksModal:
    - Authors: سرچ‌دراپداون (٥ پێشنیار) + roles
    - Specifications: تابلەی editable (name/group/value/visible) + Add
  - DashboardOverview: Total Books، Total Authors، Downloads/Views (periods) + Overview chart

## پاراستن و CORS
- CORS: [backend/config/cors.php] ← `FRONTEND_ORIGIN` لە `.env`
- Security headers و Rate limit: middlewareـەکان
- JWT secret لە ENV، هەرگیز `.env` بۆ ڕیپۆ مەکە

## چاککردنی کێشەکان
- Login 401: چک بکە `VITE_API_BASE_URL` و `.env`ی backend (DB و FRONTEND_ORIGIN)، و بونی ئەدمین لە users
- SPA 404: `.htaccess`ی dashboard (fallback → index.html)
- API 404/403: `.htaccess`ی api و ڕێڕەوەکان لە routes/api.php

## پەڕگە گرنگەکان
- Frontend:  
  `src/api/axiosConfig.js`, `src/services/admin.js`, `src/pages/DashboardOverview.jsx`, `src/components/shared/BooksModal.jsx`
- Backend:  
  `backend/public/index.php`, `backend/routes/api.php`, `backend/config/database.php`, `backend/bootstrap.php`, `backend/controllers/Admin/*`, `backend/middleware/*`
- Deploy:  
  `deploy/ideafoundation_hostinger.sql`, `deploy/api.htaccess`, `deploy/dashboard.htaccess`, `deploy/backend.env.example`, `deploy/.env.production.example`

## تێبینی پاراستنی گرنگ
- پەسەوەردی ئەدمین دوای دێپلۆی گۆڕە
- `APP_DEBUG=false` لە پرۆدەکشن
