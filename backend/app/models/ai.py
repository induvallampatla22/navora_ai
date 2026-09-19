import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), default="Travel Planning Session")
    language = Column(String(16), default="en")  # en, te, hi, ta, kn, ml
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="AIMessage.created_at")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(16), nullable=False)  # user, assistant, system, tool
    content = Column(Text, nullable=False)
    language = Column(String(16), default="en")
    tool_calls = Column(JSON, default=list)
    tool_results = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("AIConversation", back_populates="messages")


class AIAction(Base):
    __tablename__ = "ai_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(64), nullable=False)  # e.g., ReplanningAgent, BookingAgent, TransportAgent
    action_type = Column(String(64), nullable=False)  # e.g., "replan_itinerary", "reserve_restaurant"
    tool_name = Column(String(64), nullable=False)
    input_parameters = Column(JSON, default=dict)
    result_payload = Column(JSON, default=dict)
    approval_required = Column(Boolean, default=False)
    approval_status = Column(String(32), default="executed")  # pending, approved, rejected, executed
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
