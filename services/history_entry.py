from dataclasses import dataclass
from shapes import Point

@dataclass
class HistoryEntry:
    """Class for history entry"""

    point: Point
    result: bool
    now: str
    exec_time: float