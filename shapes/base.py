from abc import ABC, abstractmethod
from .point import Point

class Shape(ABC):
    """Base class for any geometric figure"""

    @abstractmethod
    def contains(self, point: Point) -> bool:
        pass