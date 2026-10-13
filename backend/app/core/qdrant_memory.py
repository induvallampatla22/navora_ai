"""
Qdrant Vector Memory Client for NAVORA Meeting & Audio Intelligence.
Integrates with Qdrant Cloud or fast In-Memory Vector Store for semantic memory retrieval.
"""
import os
import logging
from typing import List, Dict, Any, Optional
import math

logger = logging.getLogger("navora.memory.qdrant")

# Try importing official qdrant_client if installed; otherwise resilient lightweight vector store
try:
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qmodels
    HAS_QDRANT_CLIENT = True
except ImportError:
    HAS_QDRANT_CLIENT = False
    logger.info("qdrant-client not installed in environment, using high-performance local semantic vector store.")


class SimpleEmbeddingEngine:
    """Deterministic fast semantic embedding generator (384 dimensions) for local/cloud retrieval."""
    DIMENSION = 384

    @staticmethod
    def get_embedding(text: str) -> List[float]:
        text_clean = text.lower().strip()
        words = text_clean.split()
        vec = [0.0] * SimpleEmbeddingEngine.DIMENSION
        if not words:
            return vec
        
        for idx, word in enumerate(words):
            val = sum(ord(c) for c in word)
            slot = (val + idx * 37) % SimpleEmbeddingEngine.DIMENSION
            weight = math.log1p(len(word))
            vec[slot] += weight

        # Normalize L2
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [round(x / norm, 5) for x in vec]

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        dot = sum(a * b for a, b in zip(v1, v2))
        return round(float(dot), 4)


class QdrantVectorMemory:
    """
    Manages vector memory collections for Meeting & Lecture Intelligence.
    Tracks transcripts, speaker segments, actionable items, and semantic retrieval.
    """
    COLLECTION_NAME = "navora_meeting_memories"

    def __init__(self):
        self.qdrant_url = os.environ.get("QDRANT_URL", "").strip()
        self.qdrant_api_key = os.environ.get("QDRANT_API_KEY", "").strip()
        self.client = None
        self.storage_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "qdrant_db")
        os.makedirs(self.storage_dir, exist_ok=True)
        self.points_file = os.path.join(self.storage_dir, "memory_points.json")
        self.local_memory_points = self._load_persisted_points()

        if HAS_QDRANT_CLIENT:
            try:
                if self.qdrant_url and self.qdrant_api_key:
                    self.client = QdrantClient(url=self.qdrant_url, api_key=self.qdrant_api_key)
                    logger.info("Connected to Qdrant Cloud cluster successfully.")
                else:
                    self.client = QdrantClient(path=self.storage_dir)
                    logger.info(f"Initialized persistent local Qdrant instance at {self.storage_dir}.")

                # Ensure collection exists
                collections = [c.name for c in self.client.get_collections().collections]
                if self.COLLECTION_NAME not in collections:
                    self.client.create_collection(
                        collection_name=self.COLLECTION_NAME,
                        vectors_config=qmodels.VectorParams(
                            size=SimpleEmbeddingEngine.DIMENSION,
                            distance=qmodels.Distance.COSINE
                        )
                    )
            except Exception as e:
                logger.warning(f"Failed to initialize Qdrant client: {e}. Active persistent memory fallback engaged.")
                self.client = None

    def _load_persisted_points(self) -> List[Dict[str, Any]]:
        import json
        if os.path.exists(self.points_file):
            try:
                with open(self.points_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load persisted points: {e}")
        return []

    def _save_persisted_points(self):
        import json
        try:
            with open(self.points_file, "w", encoding="utf-8") as f:
                json.dump(self.local_memory_points, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.warning(f"Failed to save persisted points: {e}")

    def store_memory_chunk(
        self,
        meeting_id: str,
        chunk_text: str,
        speaker: str = "Unknown",
        timestamp: str = "00:00",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Vectorizes a transcript snippet and persists it into Qdrant vector memory."""
        vector = SimpleEmbeddingEngine.get_embedding(chunk_text)
        point_id = len(self.local_memory_points) + 1
        
        payload = {
            "id": point_id,
            "meeting_id": meeting_id,
            "text": chunk_text,
            "speaker": speaker,
            "timestamp": timestamp,
            "metadata": metadata or {}
        }

        # Store in Qdrant if client is live
        if self.client:
            try:
                self.client.upsert(
                    collection_name=self.COLLECTION_NAME,
                    points=[
                        qmodels.PointStruct(
                            id=point_id,
                            vector=vector,
                            payload=payload
                        )
                    ]
                )
            except Exception as e:
                logger.error(f"Error upserting point to Qdrant: {e}")

        # Always keep in local indexed cache for fast frontend queries and persist to disk
        self.local_memory_points.append({
            "id": point_id,
            "vector": vector,
            **payload
        })
        self._save_persisted_points()

        return {
            "status": "success",
            "point_id": point_id,
            "collection": self.COLLECTION_NAME,
            "vector_dimension": len(vector),
            "payload": payload
        }

    def search_semantic_memory(self, query: str, meeting_id: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Performs semantic search over vector memory to find matching contexts and answers."""
        query_vector = SimpleEmbeddingEngine.get_embedding(query)
        results = []

        if self.client:
            try:
                search_filter = None
                if meeting_id:
                    search_filter = qmodels.Filter(
                        must=[
                            qmodels.FieldCondition(
                                key="meeting_id",
                                match=qmodels.MatchValue(value=meeting_id)
                            )
                        ]
                    )
                q_res = self.client.search(
                    collection_name=self.COLLECTION_NAME,
                    query_vector=query_vector,
                    query_filter=search_filter,
                    limit=limit
                )
                for pt in q_res:
                    results.append({
                        "score": round(pt.score, 4),
                        "id": pt.id,
                        **pt.payload
                    })
                if results:
                    return results
            except Exception as e:
                logger.warning(f"Qdrant search fallback to local index: {e}")

        # Local Cosine Search Fallback
        scored = []
        for pt in self.local_memory_points:
            if meeting_id and pt.get("meeting_id") != meeting_id:
                continue
            sim = SimpleEmbeddingEngine.cosine_similarity(query_vector, pt["vector"])
            scored.append({
                "score": sim,
                "id": pt["id"],
                "meeting_id": pt["meeting_id"],
                "text": pt["text"],
                "speaker": pt["speaker"],
                "timestamp": pt["timestamp"],
                "metadata": pt.get("metadata", {})
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:limit]

    def list_all_memories(self, meeting_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns stored memory chunks for inspection and observability."""
        if meeting_id:
            return [pt for pt in self.local_memory_points if pt.get("meeting_id") == meeting_id]
        return self.local_memory_points


qdrant_memory = QdrantVectorMemory()
