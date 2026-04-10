from google.adk.agents import Agent
from prompts.prompts import AGENT5_PROMPT
from schemas.models import Agent5Output
from utils.skip_guard import skip_guard

def create_agent5() -> Agent:
    return Agent(
        name="agent5_payout_estimator",
        model="gemini-3-flash-preview",
        instruction=(
            AGENT5_PROMPT + 
            "\n\nClaim Context: {claim_context}" +
            "\nFraud Risk Assessment: {agent3_output}" +
            "\nConfirmed Damage Type: {confirmed_damage_type}" +
            "\nAccumulated Confidence Penalty: {confidence_penalty}"
        ),
        output_schema=Agent5Output,
        output_key="agent5_output",
        before_model_callback=skip_guard
    )
