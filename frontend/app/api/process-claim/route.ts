import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const hasImage = formData.has("image");
    let backendRes;

    if (hasImage) {
      backendRes = await fetch("http://127.0.0.1:8000/api/process-claim-with-image", {
        method: "POST",
        body: formData,
      });
    } else {
      const claimDataStr = formData.get("claim_data");
      const claimData = claimDataStr ? JSON.parse(claimDataStr as string) : {};
      
      backendRes = await fetch("http://127.0.0.1:8000/api/process-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(claimData),
      });
    }

    if (!backendRes.ok) {
        const errText = await backendRes.text();
        return NextResponse.json({ error: errText }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
