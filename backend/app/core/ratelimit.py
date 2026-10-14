import math
import time
from collections import deque
from threading import Lock


class FailedAttempts:
    """Counts recent failures per key (e.g. a username) and blocks the key once there are too many.

    Kept in memory: it resets when the API restarts, and each server process counts separately.
    That's enough to make guessing a password by trying many impractical.
    """

    MAX_KEYS = 10_000  # forget the oldest keys past this, so random usernames can't fill memory

    def __init__(self, limit: int, window_seconds: int):
        self.limit = limit
        self.window = window_seconds
        self._failures: dict[str, deque[float]] = {}
        self._lock = Lock()

    def _recent(self, key: str, now: float) -> deque[float]:
        times = self._failures.get(key, deque())
        while times and times[0] <= now - self.window:
            times.popleft()
        return times

    def blocked_for(self, key: str) -> int:
        """Seconds until the key may try again; 0 if it isn't blocked."""
        now = time.monotonic()
        with self._lock:
            times = self._recent(key, now)
            if len(times) < self.limit:
                return 0
            # Blocked until the oldest failure in the window expires.
            return max(1, math.ceil(times[0] + self.window - now))

    def fail(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            times = self._recent(key, now)
            times.append(now)
            self._failures[key] = times
            if len(self._failures) > self.MAX_KEYS:
                del self._failures[next(iter(self._failures))]

    def clear(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)
