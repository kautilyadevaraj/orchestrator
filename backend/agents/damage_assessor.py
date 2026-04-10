from google.adk.agents import Agent
from prompts.prompts import AGENT4_PROMPT
from schemas.models import Agent4Output
from utils.skip_guard import skip_guard

def create_agent4() -> Agent:
    return Agent(
        name="agent4_damage_assessor",
        model="gemini-3-flash-preview",
        instruction=(
            AGENT4_PROMPT + 
            "\n\nClaim Context: {claim_context}"
        ),
        output_schema=Agent4Output,
        output_key="agent4_output",
        before_model_callback=skip_guard
    )
