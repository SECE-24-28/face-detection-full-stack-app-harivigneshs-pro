import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const user = verifyAuthToken(token);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const luxandToken = process.env.LUXAND_API_TOKEN;

  if (!luxandToken) {
    return NextResponse.json(
      { error: "LUXAND_API_TOKEN is not configured." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json(
      { error: "Please upload an image file." },
      { status: 400 },
    );
  }

  const luxandFormData = new FormData();
  luxandFormData.append("photo", image, image.name);

  const luxandResponse = await fetch("https://api.luxand.cloud/photo/detect", {
    method: "POST",
    headers: {
      token: luxandToken,
    },
    body: luxandFormData,
  });

  const data = await luxandResponse.json();

  if (!luxandResponse.ok) {
    return NextResponse.json(
      { error: "Luxand face detection failed.", details: data },
      { status: luxandResponse.status },
    );
  }

  const faceCount = Array.isArray(data) ? data.length : 0;

  return NextResponse.json({
    detected: faceCount > 0,
    faceCount,
    faces: data,
  });
}
