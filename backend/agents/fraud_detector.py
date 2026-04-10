from google.adk.agents import Agent
from prompts.prompts import AGENT3_PROMPT
from schemas.models import Agent3Output
from utils.skip_guard import skip_guard

def create_agent3() -> Agent:
    return Agent(
        name="agent3_fraud_detector",
        model="gemini-3-flash-preview",
        instruction=AGENT3_PROMPT + "\n\nClaim Context: {claim_context}",
        output_schema=Agent3Output,
        output_key="agent3_output",
        before_model_callback=skip_guard
    )
