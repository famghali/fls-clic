import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

async function requireTeacher(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return { error: "Non authentifié.", status: 401 };

  const admin = createAdminClient();
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return { error: "Session invalide.", status: 401 };

  const { data: profile } = await admin.from("profiles").select("role").eq("id", userData.user.id).single();
  if (!profile || profile.role !== "enseignant") return { error: "Accès réservé aux enseignants.", status: 403 };

  return { admin, callerId: userData.user.id };
}

export async function GET(req) {
  const check = await requireTeacher(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  const { admin } = check;

  const { data: profiles, error: profilesError } = await admin
    .from("profiles").select("*").order("created_at", { ascending: false });
  if (profilesError) return NextResponse.json({ error: profilesError.message }, { status: 500 });

  const { data: authList, error: authError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  const emailById = Object.fromEntries(authList.users.map((u) => [u.id, u.email]));
  const users = profiles.map((p) => ({ ...p, email: emailById[p.id] || null }));

  return NextResponse.json({ users });
}

export async function PATCH(req) {
  const check = await requireTeacher(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  const { admin } = check;

  const { id, role, class_code } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

  const { error } = await admin.from("profiles").update({ role, class_code: class_code || null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const check = await requireTeacher(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  const { admin, callerId } = check;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });
  if (id === callerId) return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte ici." }, { status: 400 });

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
