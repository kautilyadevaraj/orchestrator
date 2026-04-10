from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator


class GateCMismatch(BaseAgent):
    def __init__(self, name: str = "gate_c_mismatch"):
        super().__init__(name=name)

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        if ctx.session.state.get("pipeline_status") == "rejected":
            yield Event(author=self.name, actions=EventActions(state_delta={}))
            return

        agent4 = ctx.session.state.get("agent4_output", {})

        if not agent4:
            print("[GateC] agent4_output missing — setting confirmed_damage_type=unknown")
            yield Event(
                author=self.name,
                actions=EventActions(state_delta={"confirmed_damage_type": "unknown"})
            )
            return

        damage_severity = (
            agent4.get("damage_severity", "not_applicable")
            if isinstance(agent4, dict)
            else getattr(agent4, "damage_severity", "not_applicable")
        )

        print(f"[GateC] confirmed_damage_type => {damage_severity}")
        yield Event(
            author=self.name,
            actions=EventActions(state_delta={"confirmed_damage_type": damage_severity})
        )
