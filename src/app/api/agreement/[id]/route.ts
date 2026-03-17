import { NextResponse } from "next/server";
import { publicClient, CONTRACTS, AGREEMENT_ABI } from "../../_lib/chain";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !id.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid agreement ID" }, { status: 400 });
    }

    const result = await publicClient.readContract({
      address: CONTRACTS.agreement,
      abi: AGREEMENT_ABI,
      functionName: "getAgreement",
      args: [id as `0x${string}`],
    });

    const [policyHash, partyA, partyB, signedByA, signedByB] = result as unknown as [string, string, string, boolean, boolean];

    return NextResponse.json({
      agreementId: id,
      policyHash,
      partyA,
      partyB,
      signedByA,
      signedByB,
      finalized: signedByA && signedByB,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
