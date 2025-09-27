from .base import Shape


class Rectangle(Shape):
    """Class for rectangle with sides r/2 and r in I quadrant"""

    def contains(self, x: int, y: float, r: int) -> bool:
        return 0 <= x <= r/2 and 0 <= y <= r