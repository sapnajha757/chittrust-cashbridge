import logging
import uuid
from typing import Dict, Any, Tuple, Optional
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.core.exceptions import APIException
from app.db.supabase import get_supabase_client

logger = logging.getLogger("chittrust.storage")

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB max file size limit
BUCKET_NAME = "agent-proofs"

class StorageService:
    @classmethod
    def validate_photo_file(cls, content_type: str, file_size: int):
        if content_type.lower() not in ALLOWED_MIME_TYPES:
            raise APIException(
                f"Invalid file type '{content_type}'. Only JPEG, PNG, and WebP images are allowed.",
                status_code=400
            )
        if file_size > MAX_FILE_SIZE_BYTES:
            raise APIException(
                f"File size exceeds maximum limit of 5MB ({file_size} bytes provided).",
                status_code=400
            )

    @classmethod
    async def upload_agent_photo_proof(
        cls,
        file: UploadFile,
        agent_id: str,
        group_id: str
    ) -> Dict[str, Any]:
        """
        Validates and uploads agent doorstep cash collection photo proof to Supabase Storage.
        Returns persistent public URL / storage object path.
        Fails loudly if storage service or upload fails.
        """
        content_bytes = await file.read()
        file_size = len(content_bytes)

        cls.validate_photo_file(file.content_type or "image/jpeg", file_size)

        ext = "jpg"
        if file.filename and "." in file.filename:
            ext = file.filename.rsplit(".", 1)[-1].lower()

        storage_path = f"cash_proofs/{group_id}/{agent_id}/{uuid.uuid4()}.{ext}"
        client = get_supabase_client()

        if client:
            try:
                # Upload binary bytes to Supabase Storage bucket
                res = client.storage.from_(BUCKET_NAME).upload(
                    path=storage_path,
                    file=content_bytes,
                    file_options={"content-type": file.content_type or "image/jpeg", "upsert": "true"}
                )

                # Get public URL
                public_url_resp = client.storage.from_(BUCKET_NAME).get_public_url(storage_path)
                public_url = public_url_resp if isinstance(public_url_resp, str) else str(public_url_resp)

                logger.info(f"Successfully uploaded agent photo proof to Supabase Storage: {storage_path}")
                return {
                    "storage_path": storage_path,
                    "public_url": public_url,
                    "file_size": file_size,
                    "bucket": BUCKET_NAME
                }
            except Exception as err:
                logger.error(f"Supabase Storage upload failed for {storage_path}: {err}")
                raise APIException(f"Persistent photo storage upload failed: {str(err)}", status_code=500)

        # Fail loudly if persistent object storage is unconfigured
        logger.error("Supabase Storage client is unconfigured.")
        raise APIException("Persistent object storage service unavailable.", status_code=500)

storage_service = StorageService()
