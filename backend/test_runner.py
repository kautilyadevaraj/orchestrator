import os
import asyncio
import traceback
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)
if "GOOGLE_API_KEY" in os.environ:
    del os.environ["GOOGLE_API_KEY"]

from pipeline.runner import process_claim_async

async def test():
    try:
        await process_claim_async({'test':'data'}, None)
    except Exception as e:
        if hasattr(e, 'exceptions'):
            print("EXCEPTION GROUP:")
            with open("pydantic_error.log", "w") as f:
                for sub_e in e.exceptions:
                    f.write("--- Sub Exception ---\n")
                    f.write(traceback.format_exc() + "\n")
                    if hasattr(sub_e, 'errors'):
                        f.write("PYDANTIC ERRORS: " + str(getattr(sub_e, 'errors')()) + "\n")
                    if hasattr(sub_e, 'title'):
                        f.write("MODEL CAUSING ERROR: " + str(getattr(sub_e, 'title')) + "\n")
            print("Errors written to pydantic_error.log")
        else:
            traceback.print_exception(type(e), e, e.__traceback__)

if __name__ == "__main__":
    asyncio.run(test())
