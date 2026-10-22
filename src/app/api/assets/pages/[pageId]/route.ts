import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sharp from "sharp";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB per NFR-006

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function detectImageFormat(
  buffer: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "image/gif";
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  if (!pageId || !z.uuid().safeParse(pageId).success) {
    return NextResponse.json(
      { error: "ID halaman tidak valid" },
      { status: 400 },
    );
  }

  let userCtx;
  try {
    userCtx = await requireUser();
  } catch {
    return NextResponse.json(
      { error: "Autentikasi diperlukan" },
      { status: 401 },
    );
  }

  const adminClient = createAdminClient();
  const { data: page, error: pageError } = await adminClient
    .from("pages")
    .select("id, slug, owner_id, admin_disabled, avatar_path")
    .eq("id", pageId)
    .single();

  if (pageError || !page) {
    return NextResponse.json(
      { error: "Halaman tidak ditemukan" },
      { status: 404 },
    );
  }

  const isOwner = page.owner_id === userCtx.userId;
  const isAdmin = userCtx.profile.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  if (page.admin_disabled && !isAdmin) {
    return NextResponse.json(
      { error: "Halaman dinonaktifkan oleh administrator" },
      { status: 403 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Permintaan multipart/form-data tidak valid" },
      { status: 400 },
    );
  }

  const file = (formData.get("file") || formData.get("avatar")) as File | null;
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Berkas foto avatar tidak ditemukan" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Ukuran berkas melebihi batas maksimal 2 MB" },
      { status: 413 },
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error:
          "Tipe berkas tidak didukung. Harap unggah berkas JPEG, PNG, WebP, atau GIF.",
      },
      { status: 415 },
    );
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const detectedType = detectImageFormat(rawBuffer);

  if (!detectedType) {
    return NextResponse.json(
      {
        error:
          "Validasi konten berkas gagal. Format berkas tidak dikenali atau rusak.",
      },
      { status: 400 },
    );
  }

  if (detectedType !== file.type) {
    return NextResponse.json(
      {
        error: "Ekstensi dan tipe konten berkas tidak cocok.",
      },
      { status: 400 },
    );
  }

  let optimizedBuffer: Buffer;
  try {
    optimizedBuffer = await sharp(rawBuffer)
      .rotate()
      .resize(512, 512, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses dan mengoptimasi gambar avatar" },
      { status: 400 },
    );
  }

  const assetUuid = crypto.randomUUID();
  const filePath = `pages/${pageId}/${assetUuid}.webp`;

  if (page.avatar_path) {
    try {
      await adminClient.storage.from("page-assets").remove([page.avatar_path]);
    } catch {
      // Non-fatal if previous asset removal fails
    }
  }

  const { error: uploadError } = await adminClient.storage
    .from("page-assets")
    .upload(filePath, optimizedBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Gagal menyimpan berkas avatar ke penyimpanan" },
      { status: 500 },
    );
  }

  const { error: dbError } = await adminClient
    .from("pages")
    .update({ avatar_path: filePath })
    .eq("id", pageId);

  if (dbError) {
    return NextResponse.json(
      { error: "Gagal memperbarui data profil halaman" },
      { status: 500 },
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/${page.slug}`);

  return NextResponse.json(
    {
      data: {
        path: filePath,
        url: `/api/assets/pages/${pageId}`,
      },
    },
    { status: 201 },
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  if (!pageId || !z.uuid().safeParse(pageId).success) {
    return NextResponse.json(
      { error: "ID halaman tidak valid" },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { data: page, error } = await adminClient
    .from("pages")
    .select("id, slug, status, admin_disabled, avatar_path, owner_id")
    .eq("id", pageId)
    .single();

  if (error || !page || !page.avatar_path) {
    return NextResponse.json(
      { error: "Avatar tidak ditemukan" },
      { status: 404 },
    );
  }

  const isPublic = page.status === "published" && !page.admin_disabled;
  if (!isPublic) {
    try {
      const supabaseUserClient = await createClient();
      const { data: claimsData } = await supabaseUserClient.auth.getClaims();
      const userId = claimsData?.claims?.sub;

      if (!userId) {
        return NextResponse.json(
          { error: "Autentikasi diperlukan" },
          { status: 401 },
        );
      }

      const { data: profile } = await supabaseUserClient
        .from("profiles")
        .select("role, is_active")
        .eq("id", userId)
        .single();

      const isOwner = page.owner_id === userId;
      const isAdmin = profile?.role === "admin" && profile?.is_active;

      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      }
    } catch {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 },
      );
    }
  }

  const { data: fileBlob, error: downloadError } = await adminClient.storage
    .from("page-assets")
    .download(page.avatar_path);

  if (downloadError || !fileBlob) {
    return NextResponse.json(
      { error: "Berkas gambar tidak ditemukan di penyimpanan" },
      { status: 404 },
    );
  }

  return new Response(fileBlob.stream(), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  if (!pageId || !z.uuid().safeParse(pageId).success) {
    return NextResponse.json(
      { error: "ID halaman tidak valid" },
      { status: 400 },
    );
  }

  let userCtx;
  try {
    userCtx = await requireUser();
  } catch {
    return NextResponse.json(
      { error: "Autentikasi diperlukan" },
      { status: 401 },
    );
  }

  const adminClient = createAdminClient();
  const { data: page, error } = await adminClient
    .from("pages")
    .select("id, slug, owner_id, avatar_path")
    .eq("id", pageId)
    .single();

  if (error || !page) {
    return NextResponse.json(
      { error: "Halaman tidak ditemukan" },
      { status: 404 },
    );
  }

  const isOwner = page.owner_id === userCtx.userId;
  const isAdmin = userCtx.profile.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  if (page.avatar_path) {
    try {
      await adminClient.storage.from("page-assets").remove([page.avatar_path]);
    } catch {
      // Non-fatal if object was already gone
    }
  }

  const { error: dbError } = await adminClient
    .from("pages")
    .update({ avatar_path: null })
    .eq("id", pageId);

  if (dbError) {
    return NextResponse.json(
      { error: "Gagal menghapus avatar dari halaman" },
      { status: 500 },
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
  revalidatePath(`/${page.slug}`);

  return NextResponse.json({ data: { success: true } });
}
