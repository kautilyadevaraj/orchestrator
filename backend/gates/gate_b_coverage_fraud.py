from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator


class GateBCoverageFraudMerge(BaseAgent):
    def __init__(self, name: str = "gate_b_coverage_fraud"):
        super().__init__(name=name)

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        if ctx.session.state.get("pipeline_status") == "rejected":
            yield Event(author=self.name, actions=EventActions(state_delta={}))
            return

        agent2 = ctx.session.state.get("agent2_output", {})
        agent3 = ctx.session.state.get("agent3_output", {})

        coverage_valid = (
            agent2.get("coverage_valid", True)
            if isinstance(agent2, dict)
            else getattr(agent2, "coverage_valid", True)
        )
        reason2 = (
            agent2.get("reason", "")
            if isinstance(agent2, dict)
            else getattr(agent2, "reason", "")
        )
        fraud_risk = (
            agent3.get("fraud_risk", "low")
            if isinstance(agent3, dict)
            else getattr(agent3, "fraud_risk", "low")
        )
        reason3 = (
            agent3.get("reason", "")
            if isinstance(agent3, dict)
            else getattr(agent3, "reason", "")
        )

        state_delta: dict = {}
        current_reason = ctx.session.state.get("reason_accumulator", "")
        current_penalty = ctx.session.state.get("confidence_penalty", 0.0)

        if not agent2:
            # Agent2 was skipped — treat as covered, continue
            print("[GateB] agent2_output missing — assuming coverage valid")
        elif not coverage_valid:
            state_delta["pipeline_status"] = "rejected"
            state_delta["reason_accumulator"] = current_reason + f"Not covered under policy. {reason2} "
            state_delta["confidence_penalty"] = current_penalty + 0.3
        elif fraud_risk == "high":
            state_delta["pipeline_status"] = "rejected"
            state_delta["reason_accumulator"] = current_reason + f"High fraud risk detected. {reason3} "
            state_delta["confidence_penalty"] = current_penalty + 0.4
        elif fraud_risk == "medium":
            state_delta["pipeline_status"] = "pending"
            state_delta["reason_accumulator"] = current_reason + f"Medium fraud risk. {reason3} "
            state_delta["confidence_penalty"] = current_penalty + 0.15

        print(f"[GateB] pipeline_status => {state_delta.get('pipeline_status', ctx.session.state.get('pipeline_status', 'unchanged'))}")
        yield Event(author=self.name, actions=EventActions(state_delta=state_delta))
