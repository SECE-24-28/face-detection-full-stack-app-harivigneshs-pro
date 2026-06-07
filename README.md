# Face Recognition Next.js App

A minimal full-stack face detection app built with Next.js App Router, Prisma, PostgreSQL, JWT auth in HTTP-only cookies, and Luxand Cloud.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/facedetection?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
LUXAND_API_TOKEN="replace-this-with-your-luxand-cloud-token"
```

3. Make sure PostgreSQL is running and create the database if it does not exist:

```sql
CREATE DATABASE facedetection;
```

4. Generate Prisma Client and run the migration:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`, create an account, log in, and upload an image to detect faces.

## Important Files

- `prisma/schema.prisma` defines the `User` table.
- `app/api/auth/signup/route.ts` creates users with hashed passwords.
- `app/api/auth/login/route.ts` verifies credentials and sets the auth cookie.
- `app/api/auth/logout/route.ts` clears the auth cookie.
- `app/api/detect/route.ts` forwards uploaded images to Luxand Cloud securely.
- `app/page.tsx` protects the home page and renders the face detection tool.
- `components/Navbar.tsx` displays the logged-in email and logout button.
