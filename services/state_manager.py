from typing import Dict
from .state import State

class StateManager:
    """Class for managing UI state per session"""

    def __init__(self):
        self.sessions_states: Dict[str, State] = {}
        self.default_state: State = State(selectedXs=[], y=None, r=1, theme="light")

    def get_state(self, session_id: str) -> State:
        return self.sessions_states.get(session_id, self.default_state)
    
    def update_state(self, session_id: str, new_state: State) -> None:
        self.sessions_states[session_id] = new_state
    
    def reset_state(self, session_id: str) -> None:
        self.sessions_states[session_id] = self.default_state