import { NextResponse } from "next/server";
import { publicClient, CONTRACTS, AGENT_REGISTRY_ABI } from "../../_lib/chain";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const result = await publicClient.readContract({
      address: CONTRACTS.agentRegistry,
      abi: AGENT_REGISTRY_ABI,
      functionName: "getAgent",
      args: [address as `0x${string}`],
    });

    const [agentId, metadataURI, policyHashes] = result as [string, string, string[]];
    const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

    return NextResponse.json({
      agentId,
      metadataURI,
      policyHashes,
      registered: agentId !== zeroHash,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
