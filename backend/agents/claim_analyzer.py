from google.adk.agents import Agent
from prompts.prompts import AGENT1_PROMPT
from schemas.models import Agent1Output
from utils.skip_guard import skip_guard

def create_agent1() -> Agent:
    return Agent(
        name="agent1_claim_analyzer",
        model="gemini-3-flash-preview",
        instruction=AGENT1_PROMPT + "\n\nClaim Context: {claim_context}",
        output_schema=Agent1Output,
        output_key="agent1_output",
        before_model_callback=skip_guard
    )
