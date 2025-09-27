from shapes import Shape
from typing import List


class HitChecker:
    """Class for point hit testing"""

    def __init__(self, shapes: List[Shape]):
        self.shapes = shapes

    def is_hit(self, x: int, y: float, r: int) -> bool:
        return any(shape.contains(x, y, r) for shape in self.shapes)