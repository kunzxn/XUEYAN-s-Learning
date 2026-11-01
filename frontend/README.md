## Admin và lưu học thật

Đã thêm `/admin`, `/admin/users`, `/admin/words`, `/admin/lessons`, `/admin/teachers`, `/learn`, `/my-learning`. `/login` và `/register` mặc định kết nối backend SQL Server; các route mẫu khác vẫn ghi rõ demo. Khởi chạy API trước: `../backend/Start-Api.ps1`. Hướng dẫn tạo admin và phạm vi: [admin-and-learning.md](../docs/admin-and-learning.md).

# XUEYAN Frontend

Ứng dụng giao diện Next.js nằm trong thư mục `frontend/` ở gốc dự án. Dữ liệu từ vựng HSK được giữ riêng trong `../data/`.

Chạy từ thư mục gốc repository:

```powershell
cd frontend
npm run dev
```

Dashboard học viên: http://localhost:3000/dashboard

Kiểm tra: `npm run lint`, `npm run typecheck`, `npm run build`.

Bộ giao diện Stitch đã được tích hợp thành 38 màn hình responsive. Xem ánh xạ route, checklist và giới hạn backend tại `../docs/ui-migration.md`. Dữ liệu mẫu tách trong `lib/ui-demo-data.ts`. Kiểm tra liên kết khi server đang chạy: `npm run check:routes -- http://localhost:3000`.

File `dashboard.html`, `dasboard.html` và `logo.jpg` là tài nguyên thiết kế gốc được giữ lại.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
