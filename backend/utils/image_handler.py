import base64
from fastapi import UploadFile

async def encode_upload_file(file: UploadFile) -> str | None:
    if not file:
        return None
    bytes_data = await file.read()
    return base64.b64encode(bytes_data).decode('utf-8')
