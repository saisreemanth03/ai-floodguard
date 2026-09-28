import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
ML_DIR = os.path.join(ROOT_DIR, "ml")

for path in (ROOT_DIR, BACKEND_DIR, ML_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

from backend.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.index:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False,
    )
