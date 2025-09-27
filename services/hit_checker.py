from shapes import QuadrantShape, Rectangle, Triangle, QuarterCircle
from typing import Dict, Any
from collections import deque


class HitChecker:
    """Class for point hit testing"""

    def __init__(self):
        self.shapes = [
            QuadrantShape(Rectangle(), 4),
            QuadrantShape(Triangle(), 3),
            QuadrantShape(QuarterCircle(), 2)
        ]

    def is_hit(self, x: int, y: float, r: int) -> bool:
        return any(shape.contains(x, y, r) for shape in self.shapes)