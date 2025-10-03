from .base import Shape
from .point import Point


class Rectangle(Shape):
    """Class for rectangle with sides r/2 and r in I quadrant"""

    def contains(self, point: Point) -> bool:
        return 0 <= point.x <= point.r/2 and 0 <= point.y <= point.r