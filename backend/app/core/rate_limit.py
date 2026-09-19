import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, status


class SlidingWindowRateLimiter:
    """In-memory rate limiter with sliding window timestamps"""

    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def check(self, key: str, max_requests: int, window_seconds: int):
        now = time.time()
        window_start = now - window_seconds
        # Clean older timestamps
        self.requests[key] = [ts for ts in self.requests[key] if ts > window_start]
        if len(self.requests[key]) >= max_requests:
            retry_after = int(window_seconds - (now - self.requests[key][0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Too many attempts. Please retry after {retry_after} seconds.",
                headers={"Retry-After": str(max(1, retry_after))}
            )
        self.requests[key].append(now)


rate_limiter = SlidingWindowRateLimiter()
