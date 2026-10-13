"""
FastAPI Router for Meeting & Lecture Intelligence.
Connects Omi Voice Capture, Qdrant Vector Storage, and Lyzr Multi-Agent Reasoning.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.core.qdrant_memory import qdrant_memory
from app.agents.lyzr_meeting_orchestrator import lyzr_orchestrator

router = APIRouter(prefix="/api/meetings", tags=["Meeting & Lecture Intelligence (Lyzr × Qdrant × Omi)"])


class OmiVoiceIngestRequest(BaseModel):
    transcript: str = Field(..., description="Raw audio transcript captured from Omi device or browser mic.")
    title: Optional[str] = Field("Group Discussion & Planning", description="Title of the meeting or lecture.")
    meeting_id: Optional[str] = Field(None, description="Optional unique identifier for the meeting session.")
    speaker_segments: Optional[List[Dict[str, Any]]] = Field(None, description="Detailed timestamped speaker segments.")


class MeetingQARequest(BaseModel):
    query: str = Field(..., description="Question to ask over past recorded meetings.")
    meeting_id: Optional[str] = Field(None, description="Filter question to a specific meeting session.")


@router.post("/ingest-voice", summary="Ingest Omi Audio / Voice Transcript")
def ingest_voice_stream(req: OmiVoiceIngestRequest):
    """
    Core Loop Step 1 & 2:
    Receives voice audio transcripts from Omi, persists semantic chunks into Qdrant Vector Memory,
    and triggers Lyzr Multi-Agent analysis.
    """
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript content cannot be empty.")

    result = lyzr_orchestrator.process_omi_voice_stream(
        transcript_text=req.transcript,
        meeting_title=req.title or "Meeting Session",
        meeting_id=req.meeting_id,
        speaker_segments=req.speaker_segments
    )
    return result


@router.post("/omi-webhook", summary="Official Omi Webhook / Plugin Ingestion Endpoint")
def omi_webhook_listener(payload: Dict[str, Any]):
    """
    Direct Webhook listener compatible with Omi App Plugins & Webhooks.
    Accepts Omi Conversation & Memory payloads:
    Extracts transcript segments, vectorizes into Qdrant, and executes Lyzr Agents.
    """
    # Extract transcript from Omi payload structure
    transcript = ""
    title = payload.get("title") or "Omi Ambient Recording"
    meeting_id = payload.get("id") or payload.get("session_id")
    
    # 1. Omi Memory/Conversation standard formats
    if "transcript" in payload and isinstance(payload["transcript"], str):
        transcript = payload["transcript"]
    elif "transcript_segments" in payload and isinstance(payload["transcript_segments"], list):
        # Omi segment format: [{"speaker": "SPEAKER_00", "text": "...", "start": 0.0}]
        segments = payload["transcript_segments"]
        lines = [f"{s.get('speaker', 'Speaker')}: {s.get('text', '')}" for s in segments if s.get('text')]
        transcript = "\n".join(lines)
    elif "text" in payload and isinstance(payload["text"], str):
        transcript = payload["text"]
    elif "structured" in payload and isinstance(payload["structured"], dict):
        transcript = payload["structured"].get("overview", "") or str(payload["structured"])

    if not transcript.strip():
        # Fallback if raw text
        transcript = str(payload)

    result = lyzr_orchestrator.process_omi_voice_stream(
        transcript_text=transcript,
        meeting_title=title,
        meeting_id=meeting_id
    )
    return {
        "status": "success",
        "source": "Omi Device Webhook",
        "processed_result": result
    }


@router.post("/query-memory", summary="Observable Grounded Q&A over Vector Memory")
def query_meeting_memory(req: MeetingQARequest):
    """
    Retrieves semantically relevant memory chunks from Qdrant and generates a grounded response
    with complete observable reasoning steps.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = lyzr_orchestrator.answer_query_over_meetings(
        query=req.query,
        meeting_id=req.meeting_id
    )
    return result


@router.get("/vector-memories", summary="List Vector Memory Chunks in Qdrant")
def get_vector_memories(meeting_id: Optional[str] = Query(None)):
    """
    Inspect raw vector memories stored in Qdrant collection for observability and debugging.
    """
    memories = qdrant_memory.list_all_memories(meeting_id=meeting_id)
    return {
        "status": "success",
        "collection": qdrant_memory.COLLECTION_NAME,
        "total_chunks": len(memories),
        "chunks": memories
    }
