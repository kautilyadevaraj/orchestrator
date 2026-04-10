import json
import uuid
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from pipeline.main_pipeline import create_main_pipeline
from google.genai import types


async def process_claim_async(claim_dict: dict, image_base64: str = None) -> dict:
    session_service = InMemorySessionService()

    user_id = claim_dict.get("claim_id", f"claim_{uuid.uuid4().hex[:8]}")
    session_id = f"session_{user_id}"

    # Pre-seed the session state with EVERY key used as a template variable
    # in any agent instruction (e.g. {confirmed_damage_type}, {confidence_penalty}).
    # Missing keys cause ADK to silently crash the agent during template substitution.
    initial_state = {
        # Pipeline control
        "pipeline_status": "active",
        "reason_accumulator": "",
        "confidence_penalty": 0.0,
        "confirmed_damage_type": "not_applicable",
        # Agent outputs — placeholders so template vars resolve to empty strings
        "claim_context": {},
        "agent1_output": {},
        "agent2_output": {},
        "agent3_output": {},
        "agent4_output": {},
        "agent5_output": {},
        "agent6_output": {},
        "final_output": {},
    }

    await session_service.create_session(
        app_name="insurance_app",
        user_id=user_id,
        session_id=session_id,
        state=initial_state,
    )

    pipeline = create_main_pipeline()
    runner = Runner(agent=pipeline, app_name="insurance_app", session_service=session_service)

    import base64
    msg_text = f"Raw Input Data: {json.dumps(claim_dict)}"
    parts = [types.Part.from_text(text=msg_text)]

    if image_base64:
        try:
            image_bytes = base64.b64decode(image_base64)
            # We add it as a true multimodal image part rather than a giant text block
            parts.append(
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
            )
        except Exception as e:
            print(f"[Runner] Failed to decode image base64: {e}")

    new_message = types.Content(role="user", parts=parts)

    async for event in runner.run_async(
        user_id=user_id, session_id=session_id,
        new_message=new_message
    ):
        print(
            f"[Runner Event] from={event.author} | "
            f"is_final={event.is_final_response()} | "
            f"content_type={type(event.content).__name__}"
        )

    # Re-fetch session AFTER the pipeline completes — the pre-run reference is stale.
    # ADK commits state deltas to the session service during run_async;
    # only a fresh get_session call sees the final written state.
    session = await session_service.get_session(
        app_name="insurance_app", user_id=user_id, session_id=session_id
    )

    state_keys = list(session.state.keys())
    print(f"[Runner] Final state keys: {state_keys}")

    final_output = session.state.get("final_output", {})
    print(f"[Runner] final_output = {final_output}")

    if not final_output:
        return {
            "Claim ID": claim_dict.get("claim_id", "UNKNOWN"),
            "Status": "Pending",
            "Estimated Payout": "₹0",
            "Confidence Score": 0.0,
            "Reason": "Pipeline completed but produced no final output. Check server logs.",
            "Customer Message": "",
            "workflow_log": [],
            "_debug_state_keys": state_keys,
        }

    return final_output
