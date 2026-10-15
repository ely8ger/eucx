/**
 * GET  /api/admin/users/[userId]/notes  — Admin-Notizen zu einem Nutzer auflisten
 * POST /api/admin/users/[userId]/notes  — Neue Notiz erstellen
 *
 * Auth: ADMIN, SUPER_ADMIN, COMPLIANCE_OFFICER
 */
import { NextRequest, NextResponse } from "next/server";
import { z }                         from "zod";
import { db }                        from "@/lib/db/client";
import { requireAuth, ApiError }     from "@/lib/auth/jwt";
import { audit }                     from "@/lib/audit/logger";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"] as const;

const postSchema = z.object({
  content: z.string().min(1).max(2000),
  isFlag:  z.boolean().optional().default(false),
});

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    const token  = await requireAuth(req);
    const { userId } = await ctx.params;

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Prüfen ob User existiert
    const userExists = await db.user.count({ where: { id: userId } });
    if (!userExists) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

    const [notes, total] = await Promise.all([
      db.adminNote.findMany({
        where:   { subjectId: userId },
        orderBy: { createdAt: "desc" },
        take:    limit,
        skip:    (page - 1) * limit,
        select: {
          id:        true,
          content:   true,
          isFlag:    true,
          createdAt: true,
          author:    { select: { id: true, email: true, role: true } },
        },
      }),
      db.adminNote.count({ where: { subjectId: userId } }),
    ]);

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/users/notes GET]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const token  = await requireAuth(req);
    const { userId } = await ctx.params;

    if (!(ADMIN_ROLES as readonly string[]).includes(token.role)) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    const body   = await req.json() as unknown;
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Eingabe", details: parsed.error.flatten() }, { status: 422 });
    }

    // User muss existieren
    const subject = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
    if (!subject) {
      return NextResponse.json({ error: "Nutzer nicht gefunden" }, { status: 404 });
    }

    const note = await db.adminNote.create({
      data: {
        subjectId: userId,
        authorId:  token.userId,
        content:   parsed.data.content,
        isFlag:    parsed.data.isFlag,
      },
      select: {
        id:        true,
        content:   true,
        isFlag:    true,
        createdAt: true,
        author:    { select: { email: true, role: true } },
      },
    });

    void audit({
      userId:     token.userId,
      action:     "ADMIN_ACTION",
      entityType: "User",
      entityId:   userId,
      ipAddress:  req.headers.get("x-forwarded-for") ?? undefined,
      meta: {
        event:       "ADMIN_NOTE_ADDED",
        targetEmail: subject.email,
        isFlag:      parsed.data.isFlag,
        noteId:      note.id,
      },
    });

    return NextResponse.json({ ok: true, note }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[admin/users/notes POST]", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
