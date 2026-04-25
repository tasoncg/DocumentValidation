import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseDocx } from "@/lib/docx";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Không có file đính kèm." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".docx")) {
    return NextResponse.json({ error: "Chỉ chấp nhận file .docx" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File vượt quá 10 MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseDocx(buffer, file.name);
    return NextResponse.json(result);
  } catch (err) {
    console.error("docx parse error", err);
    return NextResponse.json({ error: "Không đọc được file Word." }, { status: 500 });
  }
}

export const runtime = "nodejs";
