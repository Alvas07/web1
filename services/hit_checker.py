from shapes import Shape
from typing import List
from shapes import Point


class HitChecker:
    """Class for point hit testing"""

    def __init__(self, shapes: List[Shape]):
        self.shapes = shapes

    def is_hit(self, point: Point) -> bool:
        return any(shape.contains(point) for shape in self.shapes)