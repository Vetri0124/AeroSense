import uuid
from datetime import datetime

def generate_uuid():
    return str(uuid.uuid4())

# In MongoDB, we don't strictly need classes that inherit from a Base
# but we can define the structure here for clarity or use Pydantic schemas.
# The actual "models" will be the documents in the collections.

# Helper to prepare a document for MongoDB (e.g., adding an id)
def prepare_document(data: dict):
    if "id" not in data:
        data["id"] = generate_uuid()
    if "created_at" not in data:
        data["created_at"] = datetime.utcnow()
    return data
