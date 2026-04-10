from google.adk.agents import SequentialAgent, ParallelAgent
from agents import (
    create_input_parser, create_agent1, create_agent2, 
    create_agent3, create_agent4, create_agent5, create_agent6
)
from gates import (
    GateACompletenessCheck, GateBCoverageFraudMerge, 
    GateCMismatch, LogAggregator
)

def create_main_pipeline() -> SequentialAgent:
    return SequentialAgent(
        name="insurance_pipeline",
        sub_agents=[
            create_input_parser(),
            create_agent1(),
            GateACompletenessCheck(),
            ParallelAgent(
                name="parallel_coverage_and_fraud",
                sub_agents=[create_agent2(), create_agent3()]
            ),
            GateBCoverageFraudMerge(),
            create_agent4(),
            GateCMismatch(),
            create_agent5(),
            create_agent6(),
            LogAggregator()
        ]
    )

# Expose the pipeline globally for ADK CLI/UI discovery
insurance_pipeline_agent = create_main_pipeline()
