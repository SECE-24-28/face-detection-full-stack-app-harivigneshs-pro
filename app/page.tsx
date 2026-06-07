import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FaceDetector } from "@/components/FaceDetector";
import { Navbar } from "@/components/Navbar";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = verifyAuthToken(token);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={user.email} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
            Face detection
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Upload an image and securely send it to Luxand Cloud through your
            Next.js API route.
          </p>
        </div>

        <FaceDetector />
      </main>
    </div>
  );
}
