from google.adk.agents import Agent
from prompts.prompts import INPUT_PARSER_PROMPT
from schemas.models import ClaimContext

def create_input_parser() -> Agent:
    return Agent(
        name="input_parser",
        model="gemini-3-flash-preview",
        instruction=INPUT_PARSER_PROMPT,
        output_schema=ClaimContext,
        output_key="claim_context"
    )
