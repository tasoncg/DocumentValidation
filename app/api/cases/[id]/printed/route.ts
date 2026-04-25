import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markPrinted } from "@/server/cases";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    await markPrinted(params.id, user.id);
  } catch {
    // best-effort, ignore
  }
  return NextResponse.json({ ok: true });
}
