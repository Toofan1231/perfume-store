import time
from collections import defaultdict, deque
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


class SimpleRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        client = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - 60
        queue = self.requests[client]
        while queue and queue[0] < window_start:
            queue.popleft()
        if len(queue) >= settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(status_code=429, content={"detail": "Too many requests"})
        queue.append(now)
        return await call_next(request)
