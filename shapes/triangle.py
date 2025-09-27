from .base import Shape


class Triangle(Shape):
    """Class for triangle with cathetus r/2 and r in I quadrant"""

    def contains(self, x: int, y: float, r: int) -> bool:
        return 0 <= x <= r and 0 <= y <= r/2 and y <= -0.5 * x + r/2