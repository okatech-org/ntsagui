"""
NEOCORTEX - Types partagés

Ce module définit les types de données utilisés par tous les cortices
du système Acteur-Organique.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal
from datetime import datetime
from enum import Enum
import uuid


class SignalType(str, Enum):
    """Types de signaux dans le système"""
    # Entrée
    LEAD_MESSAGE_RECEIVED = "LEAD_MESSAGE_RECEIVED"
    
    # Intelligence
    LEAD_INTENT_DETECTED = "LEAD_INTENT_DETECTED"
    LEAD_QUALIFIED = "LEAD_QUALIFIED"
    
    # Actions
    REPORT_REQUESTED = "REPORT_REQUESTED"
    REPORT_GENERATED = "REPORT_GENERATED"
    ASSISTANT_RESPONSE = "ASSISTANT_RESPONSE"
    
    # Décisions
    DECISION_GENERATE_REPORT = "DECISION_GENERATE_REPORT"
    DECISION_NOTIFY_ADMIN = "DECISION_NOTIFY_ADMIN"
    DECISION_SCHEDULE_FOLLOWUP = "DECISION_SCHEDULE_FOLLOWUP"
    
    # Erreurs
    ERROR_INGESTION_FAILED = "ERROR_INGESTION_FAILED"
    ERROR_PROCESSING_FAILED = "ERROR_PROCESSING_FAILED"


class CortexId(str, Enum):
    """Identifiants des cortices du système"""
    SENSORIEL = "cortex-sensoriel"
    NLP = "cortex-nlp"
    QUALIFICATION = "cortex-qualification"
    BILLING = "cortex-billing"
    PREFRONTAL = "cortex-prefrontal"


class Priority(str, Enum):
    """Niveaux de priorité des signaux"""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SignalMetadata(BaseModel):
    """Métadonnées d'un signal"""
    version: str = "1.0.0"
    priority: Priority = Priority.NORMAL
    trace_id: Optional[str] = None
    span_id: Optional[str] = None


class SignalPondere(BaseModel):
    """
    Signal Pondéré - Unité fondamentale de communication inter-cortex
    
    Équivalent biologique: Potentiel d'action avec intensité variable
    transmis entre neurones via synapses.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: SignalType
    source: CortexId
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    payload: Dict[str, Any]
    confiance: float = Field(ge=0.0, le=1.0, default=1.0, description="Intensité du signal")
    ttl: int = Field(default=60000, description="Time-to-live en ms")
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    metadata: SignalMetadata = Field(default_factory=SignalMetadata)
    
    def is_expired(self) -> bool:
        """Vérifie si le signal a expiré"""
        now = int(datetime.now().timestamp() * 1000)
        return (now - self.timestamp) > self.ttl
    
    def with_increased_confidence(self, boost: float) -> "SignalPondere":
        """Retourne une copie avec confiance augmentée"""
        new_confidence = min(1.0, self.confiance + boost)
        return self.model_copy(update={"confiance": new_confidence})


class ProspectInfo(BaseModel):
    """Informations sur un prospect/lead"""
    name: str
    email: str
    company: str
    phone: Optional[str] = None
    language: str = "fr"


class ChatMessage(BaseModel):
    """Message dans une conversation"""
    role: Literal["user", "assistant", "system"]
    content: str


class LeadMessagePayload(BaseModel):
    """Payload pour un signal LEAD_MESSAGE_RECEIVED"""
    session_id: str
    message: str
    prospect_info: ProspectInfo
    conversation_history: List[ChatMessage] = []
    message_count: int = 1


class IntentDetectedPayload(BaseModel):
    """Payload pour un signal LEAD_INTENT_DETECTED"""
    session_id: str
    intent: str
    entities: Dict[str, Any] = {}
    confidence: float
    suggested_response: Optional[str] = None


class QualificationPayload(BaseModel):
    """Payload pour un signal LEAD_QUALIFIED"""
    session_id: str
    lead_id: str
    score: float
    qualification_criteria: Dict[str, bool] = {}
    recommended_action: str
