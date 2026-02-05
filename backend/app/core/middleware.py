# @TASK P0-T0.3 - 에러 핸들링 미들웨어 및 요청 로깅
# @SPEC docs/planning/02-trd.md#에러-핸들링
import logging
import time

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Custom Exception
# ---------------------------------------------------------------------------


class APIException(Exception):
    """Custom API exception with structured error response.

    Attributes:
        status_code: HTTP status code.
        detail: Human-readable error message.
        code: Machine-readable error code for client handling.
    """

    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: str = "Bad Request",
        code: str = "BAD_REQUEST",
    ) -> None:
        self.status_code = status_code
        self.detail = detail
        self.code = code
        super().__init__(detail)


# ---------------------------------------------------------------------------
# Error response helper
# ---------------------------------------------------------------------------


def _error_response(
    status_code: int,
    detail: str,
    code: str,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "detail": detail,
            "code": code,
            "status_code": status_code,
        },
    )


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


async def _api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    logger.warning(
        "APIException: %s %s -> %d %s",
        request.method,
        request.url.path,
        exc.status_code,
        exc.detail,
    )
    return _error_response(exc.status_code, exc.detail, exc.code)


async def _http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    code = "HTTP_ERROR"
    logger.warning(
        "HTTPException: %s %s -> %d %s",
        request.method,
        request.url.path,
        exc.status_code,
        detail,
    )
    return _error_response(exc.status_code, detail, code)


async def _validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = exc.errors()
    detail = "; ".join(
        f"{'.'.join(str(loc) for loc in e.get('loc', []))}: {e.get('msg', '')}"
        for e in errors
    )
    logger.warning(
        "ValidationError: %s %s -> %s",
        request.method,
        request.url.path,
        detail,
    )
    return _error_response(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail,
        "VALIDATION_ERROR",
    )


async def _unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.exception(
        "UnhandledException: %s %s -> %s",
        request.method,
        request.url.path,
        str(exc),
    )
    detail = str(exc) if settings.DEBUG else "Internal Server Error"
    return _error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail,
        "INTERNAL_ERROR",
    )


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI application."""
    app.add_exception_handler(APIException, _api_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, _http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, _validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, _unhandled_exception_handler)  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# Request Logging Middleware
# ---------------------------------------------------------------------------


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request with method, path, status code, and duration."""

    async def dispatch(self, request: Request, call_next):  # noqa: ANN001
        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            "%s %s -> %d (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

        return response
