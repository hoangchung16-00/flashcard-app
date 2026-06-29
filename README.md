# Flashcard Learning App

Ứng dụng học flashcard với thuật toán Spaced Repetition (SM-2), kiến trúc offline-first.

## Tech Stack

- **Web**: Next.js 15 + Dexie (IndexedDB)
- **API**: NestJS + Prisma + PostgreSQL
- **Cache/Queue**: Redis
- **Push**: Firebase Cloud Messaging
- **Shared**: TypeScript package với thuật toán SM-2

## Yêu cầu

- Node.js 20+
- Yarn
- Docker (PostgreSQL + Redis)

## Cài đặt

```bash
# Clone và cài dependencies
cd ~/Projects/flashcard-app
yarn install

# Khởi động database
yarn db:up

# Cấu hình API
cp apps/api/.env.example apps/api/.env

# Cấu hình Web
cp apps/web/.env.local.example apps/web/.env.local

# Migrate database
yarn db:generate
yarn db:migrate

# Build shared package
yarn workspace @flashcard/shared build

# Chạy dev (API + Web)
yarn dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

## Tính năng MVP

- CRUD Deck và Flashcard (offline-first)
- Phiên ôn tập với flip card animation
- Thuật toán SM-2 (Quên / Khó / Bình thường / Dễ)
- Streak tracking
- Đăng ký/đăng nhập email + Google OAuth
- Đồng bộ dữ liệu push/pull
- Tìm kiếm deck/card
- Push notification nhắc nhở (cần cấu hình Firebase)
- **Dữ liệu mẫu** tự động khi mở app lần đầu

## Dữ liệu mẫu (Demo)

Khi mở app **lần đầu**, hệ thống tự tạo **3 bộ thẻ** với **17 flashcard**:

| Bộ thẻ | Nội dung |
|--------|----------|
| Tiếng Anh hàng ngày | Hello, Thank you, Good morning... |
| IELTS — Education | Curriculum, Scholarship, Tuition fee... |
| Lập trình cơ bản | Variable, Function, API, Database... |

Một số thẻ đã **due sẵn** để bạn ôn tập ngay trên Dashboard.

**Tài khoản demo (server):** chạy `yarn db:seed` sau migrate để tạo:

- Email: `demo@flashcard.app`
- Mật khẩu: `demo123`

Sau khi đăng nhập, dữ liệu đồng bộ lên cloud. Nếu bạn đã mở app trước đó mà không thấy dữ liệu, xóa site data của `localhost:3000` (IndexedDB + localStorage) rồi refresh.

## Cấu hình Firebase (tuỳ chọn)

1. Tạo project trên [Firebase Console](https://console.firebase.google.com)
2. Bật Cloud Messaging
3. Điền credentials vào `apps/api/.env` và `apps/web/.env.local`

## Cấu hình Google OAuth (tuỳ chọn)

1. Tạo OAuth client trên Google Cloud Console
2. Điền `GOOGLE_CLIENT_ID` vào cả API và Web env

## Cấu trúc

```
flashcard-app/
├── apps/api/          # NestJS backend
├── apps/web/          # Next.js frontend
├── packages/shared/   # SM-2 algorithm + types
└── docker-compose.yml
```
