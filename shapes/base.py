from abc import ABC, abstractmethod

class Shape(ABC):
    """Base class for any geometric figure"""

    @abstractmethod
    def contains(self, x: int, y: float, r: int) -> bool:
        pass