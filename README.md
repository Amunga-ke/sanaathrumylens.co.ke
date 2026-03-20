# SanaaThruMyLens – Creative Arts Blog

**Website:** [www.sanaathrumylens.co.ke](https://www.sanaathrumylens.co.ke)

SanaaThruMyLens is a blog that explores Kenya's and Africa's creative scene, covering **music, video reviews, cultural analysis, artist spotlights, arts education, events, and more**.

This project is built using **Next.js 16, Tailwind CSS 4, Prisma ORM, and NextAuth.js v5**, with MySQL database and Cloudinary for image storage.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | MySQL (via Prisma ORM) |
| **Authentication** | NextAuth.js v5 |
| **OAuth Providers** | Google |
| **Image Storage** | Cloudinary |
| **Animations** | Framer Motion |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AmungaLucas/sanaathrumylens.git
cd sanaathrumylens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Random secret for JWT encryption |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### 4. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with initial data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

---

## Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **authors** - Author profiles (linked to users)
- **posts** - Blog posts
- **categories** - Post categories
- **comments** - Post comments with nested replies
- **likes** - Post likes
- **bookmarks** - User bookmarks
- **events** - Events calendar
- **subscribers** - Newsletter subscribers

---

## Authentication

The application uses **NextAuth.js v5** with:

- **Credentials Provider** (email/password)
- **Google OAuth Provider**

### Default Admin Account

After running the seed command, you can log in with:

- **Email:** admin@sanaathrumylens.co.ke
- **Password:** Admin@123

### User Roles

| Role | Permissions |
|------|-------------|
| USER | Comment, like, bookmark |
| EDITOR | Create/edit posts |
| MODERATOR | Moderate comments |
| ADMIN | Full access |

---

## Project Structure

```
src/
├── app/
│   ├── (auth-pages)/       # Authentication pages
│   ├── (website)/          # Public pages
│   ├── api/                # API routes
│   ├── dashboard/          # Admin dashboard
│   └── seo/                # SEO utilities
├── components/
│   ├── blog/               # Blog components
│   ├── homepage/           # Homepage components
│   └── layout/             # Layout components
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── hooks/
│   └── useBlogData.ts      # Data fetching hook
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client
│   ├── db.ts               # Database services
│   └── cloudinary.ts       # Image upload service
└── utils/
    └── userUtils.ts        # User utility functions
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with initial data |

---

## API Endpoints

### Posts
- `GET /api/posts` - List posts
- `GET /api/posts/[id]` - Get single post
- `POST /api/posts/[id]/like` - Like a post
- `DELETE /api/posts/[id]/like` - Unlike a post
- `POST /api/posts/[id]/view` - Track post view
- `GET /api/posts/[id]/comments` - Get comments
- `POST /api/posts/[id]/comments` - Add comment

### Categories
- `GET /api/categories` - List categories

### Events
- `GET /api/events/upcoming` - Get upcoming events

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/reset-password` - Request password reset

---

## Deployment

The application can be deployed on:
- Vercel
- cPanel with Node.js
- Any Node.js hosting

### Build for production

```bash
npm run build
npm run start
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

Open-source project – free to use and modify.

Created with ❤️ by SanaaThruMyLens
