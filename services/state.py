from dataclasses import dataclass
from typing import List, Optional


@dataclass
class State:
    """Class for UI state"""

    selectedXs: List[int]
    r: int
    y: Optional[float] = None
    theme: str = "light"
