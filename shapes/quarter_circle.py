from .base import Shape


class QuarterCircle(Shape):
    """Class for quarter of circle with radius r/2 in I quadrant"""

    def contains(self, x: int, y: float, r: int) -> bool:
        return 0 <= x <= r/2 and 0 <= y <= r/2 and x**2 + y**2 <= (r/2)**2