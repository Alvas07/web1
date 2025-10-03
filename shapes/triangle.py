from .base import Shape
from .point import Point


class Triangle(Shape):
    """Class for triangle with cathetus r/2 and r in I quadrant"""

    def contains(self, point: Point) -> bool:
        return 0 <= point.x <= point.r and 0 <= point.y <= point.r/2 and point.y <= -0.5 * point.x + point.r/2