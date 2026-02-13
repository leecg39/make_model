"""File upload validation utilities."""
import os
import re

from fastapi import HTTPException, UploadFile

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


async def validate_image_upload(file: UploadFile) -> str:
    """Validate an uploaded image file.

    Checks extension, size, and sanitizes filename.

    Returns:
        Sanitized filename.

    Raises:
        HTTPException: If validation fails.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Accepted: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_IMAGE_SIZE // (1024 * 1024)}MB",
        )

    # Reset file pointer for downstream consumers
    await file.seek(0)

    # Sanitize filename
    safe_name = re.sub(r"[^\w.\-]", "", file.filename or "upload")
    return safe_name
