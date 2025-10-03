from .base import Shape
from .point import Point


class QuarterCircle(Shape):
    """Class for quarter of circle with radius r/2 in I quadrant"""

    def contains(self, point: Point) -> bool:
        return 0 <= point.x <= point.r/2 and 0 <= point.y <= point.r/2 and point.x**2 + point.y**2 <= (point.r/2)**2