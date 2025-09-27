from .base import Shape


class QuadrantShape:
    """Class for any geometric figure relative to quadrant"""

    def __init__(self, shape: Shape, quadrant: int):
        self.shape = shape
        self.quadrant = quadrant

    def contains(self, x: int, y: float, r: int) -> bool:
        tx, ty = x, y
        if self.quadrant == 2:
            tx, ty = -x, y
        elif self.quadrant == 3:
            tx, ty = -x, -y
        elif self.quadrant == 4:
            tx, ty = x, -y
        return self.shape.contains(tx, ty, r)