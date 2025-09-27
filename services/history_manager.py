from collections import deque
from typing import Dict, Any

class HistoryManager:
    """Class for storing history"""

    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.history: deque[Dict[str, Any]] = deque(maxlen=max_history)

    def add_to_history(self, record: Dict[str, Any]) -> None:
        self.history.appendleft(record)

    def get_history(self) -> list[Dict[str, Any]]:
        return list(self.history)