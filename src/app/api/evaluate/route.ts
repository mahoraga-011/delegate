import { NextResponse } from "next/server";
import { evaluatePolicy, hashObject } from "delegate-sdk";

export async function POST(req: Request) {
  try {
    const { policy, request } = await req.json();

    if (!policy || !request) {
      return NextResponse.json({ error: "Missing policy or request in body" }, { status: 400 });
    }

    const result = evaluatePolicy(policy, request);
    const policyHash = hashObject(policy);
    const requestHash = hashObject(request);
    const resultHash = hashObject(result);

    return NextResponse.json({
      ...result,
      policyHash,
      requestHash,
      resultHash,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
