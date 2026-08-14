# ULAMC — Hướng Dẫn Cài Đặt & Triển Khai

Website nạp tiền cho Minecraft server ULAMC.  
Người chơi đăng nhập bằng tài khoản Minecraft, nạp tiền qua thẻ điện thoại hoặc chuyển khoản ngân hàng, và nhận xu trong game tự động.

---

## Yêu Cầu Hệ Thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | 18.x trở lên |
| npm | 9.x trở lên |
| Git | Bất kỳ phiên bản nào |

---

## Cài Đặt Development

### 1. Clone project

```bash
git clone https://github.com/your-username/ulamc.git
cd ulamc
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file .env

```bash
cp .env.example .env
```

Mở file `.env` và điền các giá trị thực tế (xem hướng dẫn bên dưới).

### 4. Chạy development server

```bash
npm run dev
```

Website sẽ chạy tại: http://localhost:4028

---

## Cấu Hình Environment Variables

Mở file `.env` và cấu hình từng mục:

### NEXT_PUBLIC_SITE_URL
URL công khai của website. Dùng cho sitemap, Open Graph và webhook callback.

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### AUTH_API_URL + AUTH_API_KEY
API xác thực tài khoản Minecraft. Liên hệ admin server để lấy thông tin.

```
AUTH_API_URL=https://your-minecraft-server.com/api
AUTH_API_KEY=your-api-key
```

### MINECRAFT_API_URL + MINECRAFT_API_KEY
API cộng tiền vào tài khoản Minecraft. Có thể dùng chung với AUTH nếu cùng server.

```
MINECRAFT_API_URL=https://your-minecraft-server.com/api
MINECRAFT_API_KEY=your-api-key
```

### CARD_API_URL + CARD_API_KEY
API nạp thẻ điện thoại. Đăng ký tài khoản tại nhà cung cấp (Trumthe, Thesieure, v.v.).

```
CARD_API_URL=https://your-card-provider.com/api
CARD_API_KEY=your-api-key
```

### BANK_API_URL + BANK_API_KEY + BANK_WEBHOOK_SECRET
API thanh toán ngân hàng. Đăng ký tại cổng thanh toán (VietQR, PayOS, v.v.).

```
BANK_API_URL=https://your-payment-gateway.com/api
BANK_API_KEY=your-api-key
BANK_WEBHOOK_SECRET=your-webhook-secret
```

### AUTH_JWT_SECRET
Chuỗi bí mật để ký JWT token. Tạo chuỗi ngẫu nhiên dài ít nhất 32 ký tự.

```bash
# Tạo secret ngẫu nhiên
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Cấu Hình Minecraft API

Website sử dụng 2 loại API Minecraft:

### 1. Authentication API (Xác thực đăng nhập)

Endpoint cần có trên server Minecraft:

```
POST /auth/verify
Body: { "username": "string", "password": "string" }
Response: { "success": true, "player": { "username": "string", "uuid": "string" }, "token": "string" }
```

Cấu hình trong `.env`:
```
AUTH_API_URL=https://your-server.com/api
AUTH_API_KEY=your-key
```

### 2. Economy API (Cộng tiền trong game)

Endpoints cần có trên server Minecraft:

```
POST /economy/add
Body: { "username": "string", "amount": number, "transactionId": "string" }
Response: { "success": true, "newBalance": number }

GET /economy/balance/{username}
Response: { "success": true, "balance": number, "currency": "xu" }

GET /player/{username}
Response: { "success": true, "exists": true, "player": { "username": "string" } }
```

Cấu hình trong `.env`:
```
MINECRAFT_API_URL=https://your-server.com/api
MINECRAFT_API_KEY=your-key
```

> **Lưu ý:** Nếu chưa có API thật, website vẫn hoạt động ở chế độ mock — chỉ là chưa thể đăng nhập và cộng tiền thật.

---

## Cấu Hình Server Status API

Website hiển thị trạng thái server Minecraft (đang hoạt động / bảo trì) và số người chơi online.

### Vị trí service

```
src/services/serverStatus.ts
```

### API endpoint nội bộ

```
GET /api/server/status
```

Response:
```json
{
  "status": "online",
  "playersOnline": 125,
  "isMock": false,
  "fetchedAt": "2026-08-11T07:39:09.000Z"
}
```

Trong đó:
- `status`: `"online"` = đang hoạt động, `"maintenance"` = đang bảo trì, `"unknown"` = không thể kiểm tra
- `playersOnline`: số người chơi hiện tại (0 khi bảo trì hoặc không thể kiểm tra)
- `isMock`: `true` nếu đang dùng mock data, `false` nếu dùng API thật
- `fetchedAt`: thời điểm lấy dữ liệu (ISO 8601)

### Environment variables

```env
SERVER_STATUS_API_URL=https://your-server.com/api/status
SERVER_STATUS_API_KEY=your-api-key-if-required
```

> `SERVER_STATUS_API_KEY` là tùy chọn. Nếu API không yêu cầu xác thực thì để trống.

### Cách thay MOCK bằng API thật

1. Set `SERVER_STATUS_API_URL` trong `.env`
2. (Tùy chọn) Set `SERVER_STATUS_API_KEY` nếu API yêu cầu xác thực
3. Mở `src/services/serverStatus.ts` → tìm hàm `fetchRealServerStatus()`
4. Điều chỉnh field mapping theo response thực tế của API bạn:
   ```typescript
   return {
     status: data.status === 'online' ? 'online' : 'maintenance',
     playersOnline: typeof data.playersOnline === 'number' ? data.playersOnline : 0,
     isMock: false,
     fetchedAt: new Date().toISOString(),
   };
   ```
5. Website sẽ tự động dùng API thật và tự cập nhật mỗi 30 giây

### Bảo mật

- `SERVER_STATUS_API_KEY` chỉ được dùng ở server-side (trong `src/services/serverStatus.ts`)
- Frontend chỉ gọi `/api/server/status` — không bao giờ thấy API key thật
- Nếu API không phản hồi: hiển thị `⚪ Không thể kiểm tra trạng thái server` — không bao giờ giả vờ "online"

---

### Nạp thẻ điện thoại

Cập nhật file `src/app/api/topup/card/route.ts`:
- Điều chỉnh field mapping theo spec của nhà cung cấp
- Cập nhật error code mapping

### Nạp bank / chuyển khoản

Cập nhật file `src/app/api/topup/bank/route.ts`:
- Điều chỉnh field mapping theo spec của cổng thanh toán
- Cập nhật QR code URL field

**Bảo mật nội dung chuyển khoản:**
- `transferContent` luôn được backend tạo từ Minecraft username trong session
- Backend đọc username từ `Authorization: Bearer <token>` header — không tin tưởng client
- Người chơi không thể tự nhập hoặc thay đổi nội dung chuyển khoản
- Flow: Session → Minecraft username → `transferContent` = username → Tạo transaction

**Response format:**
```json
{
  "username": "AnDo",
  "transferContent": "AnDo",
  "transactionId": "ULAMCXXXXXXXX",
  "amount": 100000,
  "status": "PENDING"
}
```

### Webhook xác nhận thanh toán

Cập nhật file `src/app/api/webhooks/bank/route.ts`:
- Điều chỉnh tên header chứa chữ ký (mặc định: `x-webhook-signature`)
- Implement `lookupTransaction()` để truy vấn database lấy transaction đã lưu
- Implement `creditMinecraftAccount()` để gọi Minecraft Economy API
- Webhook tự động đối chiếu `transferContent` trong payload với username đã lưu trong transaction
- Nếu `transferContent` không khớp → từ chối giao dịch
- Username nhận tiền luôn lấy từ transaction đã lưu (từ session lúc tạo) — không từ webhook payload

---

## Build Production

### 1. Build

```bash
npm run build
```

### 2. Chạy production

```bash
npm run serve
```

Hoặc dùng PM2:

```bash
npm install -g pm2
pm2 start npm --name "ulamc" -- run serve
pm2 save
pm2 startup
```

---

## Deploy VPS (Ubuntu/Debian)

### 1. Cài đặt Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone và cài đặt

```bash
git clone https://github.com/your-username/ulamc.git /var/www/ulamc
cd /var/www/ulamc
npm install
cp .env.example .env
# Chỉnh sửa .env với giá trị thực tế
nano .env
```

### 3. Build

```bash
npm run build
```

### 4. Cài đặt PM2

```bash
npm install -g pm2
pm2 start npm --name "ulamc" -- run serve
pm2 save
pm2 startup
```

### 5. Cấu hình Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:4028;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Cài đặt SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Deploy Hosting hỗ trợ Node.js

### Vercel

```bash
npm install -g vercel
vercel
```

Thêm environment variables trong Vercel Dashboard.

### Netlify

Project đã có cấu hình `@netlify/plugin-nextjs` trong `package.json`.

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Thêm environment variables trong Netlify Dashboard.

---

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server (port 4028) |
| `npm run build` | Build production |
| `npm run serve` | Chạy production server |
| `npm run start` | Alias cho dev (development) |
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run lint:fix` | Tự động sửa lỗi ESLint |
| `npm run type-check` | Kiểm tra TypeScript |
| `npm run format` | Format code với Prettier |

---

## Cấu Trúc Project

```
ulamc/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Trang chủ (/)
│   │   ├── dang-nhap/          # Đăng nhập (/dang-nhap)
│   │   ├── nap-the/            # Nạp thẻ (/nap-the)
│   │   ├── nap-bank/           # Nạp bank (/nap-bank)
│   │   ├── login/              # Redirect → /dang-nhap
│   │   ├── top-up/             # Redirect → /nap-the
│   │   ├── api/                # API Routes (server-side)
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── topup/          # Top-up endpoints
│   │   │   └── webhooks/       # Webhook handlers
│   │   ├── components/         # Page-specific components
│   │   ├── layout.tsx          # Root layout
│   │   ├── sitemap.ts          # Sitemap tự động
│   │   └── robots.ts           # robots.txt
│   ├── components/             # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ui/                 # UI primitives
│   ├── services/               # Client-side service layer
│   │   ├── auth.ts             # Authentication service
│   │   ├── cardTopup.ts        # Card top-up service
│   │   ├── bankTopup.ts        # Bank top-up service
│   │   └── minecraft.ts        # Minecraft API service (server-side only)
│   ├── config/
│   │   └── api.ts              # API configuration & env vars
│   └── styles/
│       └── tailwind.css        # Global styles & CSS variables
├── public/
│   ├── assets/images/          # Static images
│   └── favicon.ico
├── .env.example                # Environment variables template
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # Tài liệu này
```

---

## Bảo Mật

- Không bao giờ commit file `.env` vào git
- Tất cả API key phải nằm trong `.env` (server-side)
- Mật khẩu Minecraft KHÔNG được lưu vào database website
- Username nhận tiền luôn lấy từ session server-side, không từ client
- Webhook phải có xác minh chữ ký trước khi xử lý

---

## Hỗ Trợ

- Discord: https://discord.com/invite/b5GAx4baHR
- Server: ULAMC.COM:19132