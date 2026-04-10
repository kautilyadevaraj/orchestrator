from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator
from schemas.models import FinalOutput, AgentExecutionLog


class LogAggregator(BaseAgent):
    def __init__(self, name: str = "log_aggregator"):
        super().__init__(name=name)

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:

        cctx = ctx.session.state.get("claim_context", {})
        claim_id = (
            cctx.get("claim_id", "UNKNOWN")
            if isinstance(cctx, dict)
            else getattr(cctx, "claim_id", "UNKNOWN")
        )

        raw_status = ctx.session.state.get("pipeline_status", "pending")
        status = raw_status.capitalize()
        if status not in ["Approved", "Rejected", "Pending", "Active"]:
            status = "Pending"
        if status == "Active":
            status = "Approved"

        agent5 = ctx.session.state.get("agent5_output", {})
        est_payout = (
            agent5.get("final_payout_amount", 0.0)
            if isinstance(agent5, dict)
            else getattr(agent5, "final_payout_amount", 0.0)
        )
        conf_score = (
            agent5.get("confidence_score", 0.0)
            if isinstance(agent5, dict)
            else getattr(agent5, "confidence_score", 0.0)
        )

        if status == "Rejected":
            conf_score = max(0.0, 0.9 - ctx.session.state.get("confidence_penalty", 0.0))
            est_payout = 0.0

        reason = ctx.session.state.get("reason_accumulator", "")

        agent6 = ctx.session.state.get("agent6_output", {})
        customer_msg = (
            agent6.get("customer_message", "")
            if isinstance(agent6, dict)
            else getattr(agent6, "customer_message", "")
        )

        logs = []
        for key in ["agent1_output", "agent2_output", "agent3_output", "agent4_output", "agent5_output", "agent6_output"]:
            agent_out = ctx.session.state.get(key)
            if agent_out:
                logs.append(AgentExecutionLog(
                    agent_name=key.replace("_output", ""),
                    status="success",
                    details=agent_out if isinstance(agent_out, dict) else agent_out.model_dump()
                ))
            else:
                logs.append(AgentExecutionLog(
                    agent_name=key.replace("_output", ""),
                    status="skipped"
                ))

        final_out = FinalOutput(
            claim_id=claim_id,
            status=status if status in ["Approved", "Rejected", "Pending"] else "Pending",
            estimated_payout=f"₹{int(est_payout)}",
            confidence_score=round(conf_score, 3),
            reason=reason.strip() if reason else "Processed successfully.",
            customer_message=customer_msg,
            workflow_log=logs
        )

        final_output_dict = final_out.model_dump(by_alias=True)
        print(f"[LogAggregator] Writing final_output for claim {claim_id} | status={status}")

        yield Event(
            author=self.name,
            actions=EventActions(state_delta={"final_output": final_output_dict})
        )
