from dataclasses import dataclass
from datetime import datetime

@dataclass
class Point:
    x: int
    y: float
    r: int
    result: bool
    now: datetime

    def to_dict(self):
        return {
            "x": self.x,
            "y": self.y,
            "r": self.r,
            "result": self.result,
            "now": self.now
        }