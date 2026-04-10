from google.adk.agents import Agent
from prompts.prompts import AGENT2_PROMPT
from schemas.models import Agent2Output
from utils.skip_guard import skip_guard

def create_agent2() -> Agent:
    return Agent(
        name="agent2_coverage_validator",
        model="gemini-3-flash-preview",
        instruction=AGENT2_PROMPT + "\n\nClaim Context: {claim_context}",
        output_schema=Agent2Output,
        output_key="agent2_output",
        before_model_callback=skip_guard
    )
