import { NextResponse } from "next/server";
import { hashObject } from "delegate-sdk";

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    if (data === undefined) {
      return NextResponse.json({ error: "Missing data in body" }, { status: 400 });
    }

    const hash = hashObject(data);
    return NextResponse.json({ hash });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Hashing failed" },
      { status: 500 }
    );
  }
}
