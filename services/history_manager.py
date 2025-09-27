from collections import deque
from shapes import Point

class HistoryManager:
    """Class for storing history"""

    def __init__(self):
        self.history: deque[Point] = deque()

    def add_to_history(self, record: Point) -> None:
        self.history.appendleft(record)

    def get_history(self) -> list[Point]:
        return list(self.history)