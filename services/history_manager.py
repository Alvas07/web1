from collections import deque
from typing import Dict, List
from .history_entry import HistoryEntry

class HistoryManager:
    """Class for storing history per session"""

    def __init__(self):
        self.session_history: Dict[str, deque[HistoryEntry]] = {}
    
    def add_entry(self, session_id: str, entry: HistoryEntry) -> None:
        self.session_history.setdefault(session_id, deque()).appendleft(entry)

    def get_session_history(self, session_id: str) -> List[HistoryEntry]:
        return list(self.session_history.get(session_id, deque()))
    
    def clear_session_history(self, session_id: str) -> None:
        self.session_history[session_id] = deque()