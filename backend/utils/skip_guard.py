from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_response import LlmResponse
import json

async def skip_guard(*args, **kwargs) -> LlmResponse | None:
    ctx = kwargs.get("callback_context") or kwargs.get("ctx")
    if not ctx and len(args) > 0:
        ctx = args[0]
        
    if ctx and ctx.state.get("pipeline_status", "active") != "active":
        # Bypass strict Pydantic constructor to avoid extra_forbidden constraint issues.
        return LlmResponse.model_construct(text="{}")
    return None

async def cleanup_json(*args, **kwargs) -> LlmResponse | None:
    response = kwargs.get("response") or (args[1] if len(args) > 1 else None)
    if response:
        print(f"RAW LLM RESPONSE: {response.text}")
    return None
