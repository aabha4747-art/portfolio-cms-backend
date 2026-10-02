# Portfolio CMS Backend

REST API and content management backend for my dynamic recruiter portfolio.

The backend provides authentication, portfolio content management, project publishing, GitHub integration and media handling for the Portfolio CMS ecosystem.

## Live API

https://portfolio-cms-backend-3yrq.onrender.com

Public portfolio:

https://portfolio-frontend-j4fuza6pp-aabha4747-arts-projects.vercel.app

Admin CMS:

https://portfolio-cms-admin-phi.vercel.app

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Supabase
- Supabase Storage
- JWT
- bcryptjs
- Axios
- Multer
- Helmet
- Morgan
- CORS

---

## Features

- RESTful API architecture
- PostgreSQL database integration
- JWT admin authentication
- Password hashing using bcrypt
- Protected administration routes
- Dynamic About management
- Skills CRUD
- Projects CRUD
- Project publishing
- Experience CRUD
- Blog CRUD
- Testimonials CRUD
- Services CRUD
- Media upload and deletion
- Supabase Storage integration
- GitHub repository integration
- Public and protected API separation

---

## Main API Routes

### Authentication

```text
POST /api/auth/login
```

### About

```text
GET /api/about
PUT /api/about
```

### Skills

```text
GET    /api/skills
POST   /api/skills
PUT    /api/skills/:id
DELETE /api/skills/:id
```

### Projects

```text
GET    /api/projects
GET    /api/projects/:slug
GET    /api/projects/admin/all
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

Public project endpoints return published portfolio projects.

### Experience

```text
GET    /api/experience
POST   /api/experience
PUT    /api/experience/:id
DELETE /api/experience/:id
```

### Blogs

```text
GET    /api/blogs
GET    /api/blogs/:slug
GET    /api/blogs/admin/all
POST   /api/blogs
PUT    /api/blogs/:id
DELETE /api/blogs/:id
```

### Testimonials

```text
GET    /api/testimonials
POST   /api/testimonials
PUT    /api/testimonials/:id
DELETE /api/testimonials/:id
```

### Services

```text
GET    /api/services
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id
```

### Media

```text
GET    /api/media
POST   /api/media
DELETE /api/media/:id
```

### GitHub Integration

```text
GET  /api/github/repos
POST /api/github/import/:repoName
```

---

## Database

PostgreSQL is used for persistent portfolio data.

Main tables include:

```text
users
about
skills
projects
experience
blogs
testimonials
services
messages
media
```

---

## Authentication

Admin endpoints are protected using JWT authentication.

Protected requests use:

```text
Authorization: Bearer <token>
```

Passwords are hashed before being stored in the database.

---

## GitHub Integration

The backend communicates with the GitHub API to retrieve repository information.

Repositories can be imported into the CMS and then enriched with:

- Descriptions
- Technologies
- Features
- Case-study information
- Deployment URLs
- Screenshots
- Publishing status

This prevents the public portfolio from automatically exposing every GitHub repository.

---

## Media Management

Images can be uploaded through the backend using Multer and stored in Supabase Storage.

The database stores metadata including:

- File name
- Public URL
- File type
- File size
- Alternative text

---

## Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=your_database_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_STORAGE_BUCKET=portfolio-media
```

Never commit `.env` or production credentials to GitHub.

---

## Local Development

Clone:

```bash
git clone https://github.com/aabha4747-art/portfolio-cms-backend.git
cd portfolio-cms-backend
```

Install:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

## Deployment

The backend is deployed using Render.

Production API:

https://portfolio-cms-backend-3yrq.onrender.com

The database and object storage are hosted using Supabase.

---

## Related Repositories

Public Portfolio:

https://github.com/aabha4747-art/portfolio-frontend

Admin CMS:

https://github.com/aabha4747-art/portfolio-cms-admin

---

## Security

The application implements:

- Password hashing
- JWT authentication
- Protected CMS routes
- Environment-based secrets
- File-type validation
- Upload-size restrictions
- HTTP security middleware

Production credentials must never be committed to the repository.

---

## Author

**Aabha Tembhurne**

GitHub: https://github.com/aabha4747-art

Developed as part of my Web Development Internship at Labmentix.