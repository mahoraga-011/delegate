import { NextResponse } from "next/server";
import { evaluatePolicy, hashObject, VERIFIER_ABI } from "@delegate/sdk";
import { publicClient, CONTRACTS } from "../_lib/chain";

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

    const verified = await publicClient.readContract({
      address: CONTRACTS.verifier,
      abi: VERIFIER_ABI,
      functionName: "verify",
      args: [policyHash, requestHash, resultHash],
    });

    return NextResponse.json({
      verified: verified as boolean,
      outcome: result.outcome,
      policyHash,
      requestHash,
      resultHash,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verification failed" },
      { status: 500 }
    );
  }
}
