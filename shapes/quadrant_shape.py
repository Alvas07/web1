from .base import Shape
from .point import Point


class QuadrantShape(Shape):
    """Class for any geometric figure relative to quadrant"""

    def __init__(self, shape: Shape, quadrant: int):
        self.shape = shape
        self.quadrant = quadrant

    def contains(self, point: Point) -> bool:
        x, y = point.x, point.y
        if self.quadrant == 2:
            x, y = -point.x, point.y
        elif self.quadrant == 3:
            x, y = -point.x, -point.y
        elif self.quadrant == 4:
            x, y = point.x, -point.y
        return self.shape.contains(Point(x, y, point.r))