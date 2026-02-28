# SanaaThruMyLens – Creative Arts Blog

**Website:** [www.sanaathrumylens.co.ke](https://www.sanaathrumylens.co.ke)

SanaaThruMyLens is a blog that explores Kenya’s and Africa’s creative scene, covering **music, video reviews, cultural analysis, artist spotlights, arts education, events, and more**.

This project is built using **Next.js 14+, Tailwind CSS, and Shadcn/UI**, with full support for **authentication, dynamic blog pages, SEO, and dashboard features**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Adding Blog Posts](#adding-blog-posts)
- [SEO & Metadata](#seo--metadata)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Homepage with **hero carousel**, featured posts, and categories
- Dynamic **blog pages** by slug, with related articles, author bio, comments, and subscription forms
- **Author pages**, category pages, tags, events pages
- Authentication system: signup, login, reset password
- **Dashboard**: bookmarks, posts, users
- Full **SEO and Open Graph support** for posts, authors, events, and pages
- RSS feed and sitemaps for better indexing
- Firebase integration (Auth & Firestore)
- Tailwind CSS + Shadcn/UI components for responsive UI

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Authentication:** Firebase Auth
- **Database:** Firestore (web + server)
- **Content:** Markdown & Firestore posts
- **SEO:** Dynamic meta, OG, sitemaps, feed.xml
- **Deployment:** cPanel / Node.js hosting

---

## Project Structure

src/
├─ app/
│ ├─ (auth-pages)/auth, signup, reset-password # Authentication pages
│ ├─ (website)/about, author, blogs, categories, events, tags # Public pages
│ ├─ api/ # API routes for posts/authors
│ ├─ dashboard/ # Admin/Dashboard pages
│ ├─ feed.xml/ # RSS feed
│ ├─ og/ # Open Graph images
│ ├─ sitemaps.xml & sitemaps-images.xml # Sitemap routes
│ ├─ globals.css # Tailwind global CSS
│ ├─ layout.js # Root layout
│ └─ favicon.ico
│
├─ components/ # Reusable UI components
│ ├─ blog/
│ ├─ homepage/
│ └─ layout/
│
├─ contexts/ # React context (AuthContext)
├─ hooks/ # Custom hooks (useAuth, useBlogData)
├─ lib/ # Firebase & Firestore utils
├─ utils/ # SEO & user utilities

markdown
Copy code

**Key Components:**

- `BlogCard.js` – Blog preview cards
- `HeroCarousel.js` – Homepage hero slider
- `Header.js` – Navbar layout
- `_components/` inside `[slug]` – Components specific to a blog post (Comments, Related Articles, Author Bio, etc.)

---

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/sanaathrumylens.git
cd sanaathrumylens
Install dependencies

bash
Copy code
npm install
Run the development server

bash
Copy code
npm run dev
Open http://localhost:3000 to view the website.

Build for production

bash
Copy code
npm run build
npm run start
Authentication
Signup, login, and reset-password pages are under (auth-pages)/auth and (auth-pages)/signup

Uses Firebase Auth

useAuth.js hook manages auth state, while AuthContext.js provides context to components

Adding Blog Posts
Add posts in Firestore or as .md files in your content folder
Each post should have:

md
Copy code
---
title: "Post Title"
subtitle: "Optional Subtitle"
author: "Author Name"
date: "YYYY-MM-DD"
categories: ["Category1", "Category2"]
tags: ["Tag1", "Tag2"]
seoTitle: "SEO Optimized Title"
seoDescription: "SEO Optimized description for Google"
---

# Post Heading

Post content goes here...
Dynamic routes [slug]/page.js will render posts automatically

SEO & Metadata
Homepage, posts, authors, events, and tags all have dynamic meta via seo.js
Open Graph images are generated dynamically from og/ routes
Sitemap and RSS feed are generated via sitemaps.xml and feed.xml
Deployment
Can be deployed on cPanel, Vercel, or any Node.js hosting
Steps for cPanel:
Upload project files to public_html
Install Node.js & run npm install
Build with npm run build and start with npm start

Contributing
Add blog posts or authors
Add new components or pages
Improve SEO metadata or performance
Open PRs or issues for major changes

License
Open-source project – free to use and modify.
Created with ❤️ by SanaaThruMyLens

vbnet
Copy code

```
