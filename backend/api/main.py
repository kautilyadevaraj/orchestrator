import os
from dotenv import load_dotenv

# Force override of system environment variables and forcefully evict the stale GOOGLE key
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)
if "GOOGLE_API_KEY" in os.environ:
    del os.environ["GOOGLE_API_KEY"]

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio

from pipeline.runner import process_claim_async
from utils.image_handler import encode_upload_file

app = FastAPI(title="Insurance Claim Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Pydantic model for the JSON body — matches the fields your agents expect
# ------------------------------------------------------------------
class ClaimRequest(BaseModel):
    claim_id: str
    description: str
    policy_type: str
    claim_amount: float
    past_claims: int = 0
    documents_status: str
    image_provided: bool = False

# ------------------------------------------------------------------
# Primary endpoint — accepts application/json
# ------------------------------------------------------------------
@app.post("/api/process-claim")
async def process_claim(claim: ClaimRequest):
    try:
        claim_dict = claim.model_dump()
        result = await process_claim_async(claim_dict, None)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------
# Multipart endpoint — accepts form-data + optional image upload
# ------------------------------------------------------------------
@app.post("/api/process-claim-with-image")
async def process_claim_with_image(
    claim_data: str = Form(..., description="Stringified JSON of the claim dictionary"),
    image: Optional[UploadFile] = File(None, description="Optional image upload")
):
    try:
        claim_dict = json.loads(claim_data)

        image_base64 = None
        if image:
            image_base64 = await encode_upload_file(image)
            claim_dict["image_provided"] = True

        result = await process_claim_async(claim_dict, image_base64)
        return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="claim_data must be a valid JSON string")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------
# Batch endpoint
# ------------------------------------------------------------------
@app.post("/api/process-batch")
async def process_batch(
    claims_data: str = Form(..., description="Stringified JSON array of claims dictionaries")
):
    try:
        claims_list = json.loads(claims_data)
        if not isinstance(claims_list, list):
            raise ValueError("Input must be a JSON array")

        tasks = [process_claim_async(claim_dict, None) for claim_dict in claims_list]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return {"batch_results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

