from collections import deque
from typing import Dict, Any

class HistoryManager:
    """Class for storing history"""

    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.history: deque[Dict[str, Any]] = deque(maxlen=max_history)

    def add_to_history(self, x: int, y: float, r: int, result: bool, now: str, exec_time: float) -> None:
        record: Dict[str, Any] = {
            "x": x,
            "y": y,
            "r": r,
            "result": result,
            "now": now,
            "exec_time": exec_time
        }
        self.history.appendleft(record)

    def get_history(self) -> list[Dict[str, Any]]:
        return list(self.history)