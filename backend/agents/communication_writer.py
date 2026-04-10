from google.adk.agents import Agent
from prompts.prompts import AGENT6_PROMPT
from schemas.models import Agent6Output

def create_agent6() -> Agent:
    return Agent(
        name="agent6_communication_writer",
        model="gemini-3-flash-preview",
        instruction=(
            AGENT6_PROMPT + 
            "\n\nPipeline Status: {pipeline_status}" +
            "\nFinal Payout Details: {agent5_output}" +
            "\nReasoning context: {reason_accumulator}"
        ),
        output_schema=Agent6Output,
        output_key="agent6_output"
    )
