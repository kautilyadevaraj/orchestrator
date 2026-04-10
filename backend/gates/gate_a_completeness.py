from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator


class GateACompletenessCheck(BaseAgent):
    def __init__(self, name: str = "gate_a_completeness"):
        super().__init__(name=name)

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        state_delta: dict = {}

        claim_context = ctx.session.state.get("claim_context", {})
        agent1_output = ctx.session.state.get("agent1_output", {})

        docs = (
            claim_context.get("documents_status", "")
            if isinstance(claim_context, dict)
            else getattr(claim_context, "documents_status", "")
        )
        missing = (
            agent1_output.get("missing_fields", [])
            if isinstance(agent1_output, dict)
            else getattr(agent1_output, "missing_fields", [])
        )
        score = (
            agent1_output.get("completeness_score", 1.0)
            if isinstance(agent1_output, dict)
            else getattr(agent1_output, "completeness_score", 1.0)
        )

        current_reason = ctx.session.state.get("reason_accumulator", "")
        current_penalty = ctx.session.state.get("confidence_penalty", 0.0)

        if docs == "Missing" or len(missing) > 0 or score < 0.6:
            state_delta["pipeline_status"] = "pending"
            state_delta["reason_accumulator"] = current_reason + "Claim is incomplete or missing documents. "
            state_delta["confidence_penalty"] = current_penalty + 0.2
        else:
            state_delta["pipeline_status"] = "active"
            state_delta["reason_accumulator"] = current_reason
            state_delta["confidence_penalty"] = current_penalty

        print(f"[GateA] pipeline_status => {state_delta['pipeline_status']}")
        yield Event(author=self.name, actions=EventActions(state_delta=state_delta))
