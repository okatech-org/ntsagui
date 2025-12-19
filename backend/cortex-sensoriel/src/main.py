# Cortex Sensoriel - NEOCORTEX Gateway
# Point d'entrée pour tous les signaux du système

"""
Cortex Sensoriel - Gateway d'Ingestion

Ce service reçoit les messages du frontend (chat, webhooks) et les traduit
en signaux pondérés pour le système Acteur-Organique.

Équivalent biologique: Cortex sensoriel primaire qui reçoit les stimuli
externes et les transmet aux aires de traitement spécialisées.
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import json
import asyncio
from contextlib import asynccontextmanager
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

# Kafka producer
from aiokafka import AIOKafkaProducer

import os

# ============================================
# CONFIGURATION
# ============================================

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC_INPUT_CHAT = "signals.input.chat"
TOPIC_ERRORS = "signals.errors"

# ============================================
# MODÈLES DE DONNÉES
# ============================================

class ProspectInfo(BaseModel):
    name: str
    email: str
    company: str
    phone: Optional[str] = None

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    prospect_info: ProspectInfo
    conversation_history: List[ChatMessage] = []
    language: str = "fr"

class SignalPondere(BaseModel):
    """Signal pondéré - unité de communication inter-cortex"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    source: str = "cortex-sensoriel"
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    payload: Dict[str, Any]
    confiance: float = Field(ge=0.0, le=1.0, default=1.0)
    ttl: int = 60000  # 60 secondes par défaut
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    metadata: Dict[str, Any] = Field(default_factory=lambda: {
        "version": "1.0.0",
        "priority": "NORMAL"
    })

# ============================================
# MÉTRIQUES PROMETHEUS
# ============================================

MESSAGES_RECEIVED = Counter(
    'cortex_sensoriel_messages_received_total',
    'Total messages received by the sensory cortex',
    ['type', 'language']
)

MESSAGES_PRODUCED = Counter(
    'cortex_sensoriel_messages_produced_total',
    'Total messages produced to Kafka',
    ['topic']
)

PROCESSING_TIME = Histogram(
    'cortex_sensoriel_processing_seconds',
    'Time spent processing incoming messages',
    ['type']
)

ACTIVE_WEBSOCKETS = Counter(
    'cortex_sensoriel_websocket_connections_total',
    'Total WebSocket connections',
    ['status']
)

# ============================================
# KAFKA PRODUCER
# ============================================

producer: Optional[AIOKafkaProducer] = None

async def get_producer() -> AIOKafkaProducer:
    global producer
    if producer is None:
        producer = AIOKafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
        )
        await producer.start()
    return producer

async def produce_signal(topic: str, signal: SignalPondere, key: Optional[str] = None):
    """Produit un signal vers Kafka"""
    prod = await get_producer()
    await prod.send_and_wait(
        topic,
        value=signal.model_dump(),
        key=key or signal.correlation_id
    )
    MESSAGES_PRODUCED.labels(topic=topic).inc()

# ============================================
# WEBSOCKET MANAGER
# ============================================

class WebSocketManager:
    """Gère les connexions WebSocket actives"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        ACTIVE_WEBSOCKETS.labels(status="connected").inc()
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            ACTIVE_WEBSOCKETS.labels(status="disconnected").inc()
    
    async def send_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

ws_manager = WebSocketManager()

# ============================================
# APPLICATION FASTAPI
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management - startup/shutdown"""
    # Startup
    print("🧠 Cortex Sensoriel starting...")
    try:
        await get_producer()
        print("✅ Kafka producer connected")
    except Exception as e:
        print(f"⚠️ Kafka connection failed (will retry): {e}")
    
    yield
    
    # Shutdown
    global producer
    if producer:
        await producer.stop()
        print("🔌 Kafka producer disconnected")

app = FastAPI(
    title="Cortex Sensoriel - NEOCORTEX Gateway",
    description="Point d'entrée pour les signaux du système Acteur-Organique",
    version="1.0.0",
    lifespan=lifespan
)

# CORS pour le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenTelemetry instrumentation
FastAPIInstrumentor.instrument_app(app)

# ============================================
# ENDPOINTS
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    kafka_healthy = producer is not None and producer._sender is not None
    return {
        "status": "healthy" if kafka_healthy else "degraded",
        "service": "cortex-sensoriel",
        "kafka_connected": kafka_healthy,
        "active_websockets": len(ws_manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/chat")
async def handle_chat_message(request: ChatRequest):
    """
    Reçoit un message chat et le traduit en signal pondéré.
    
    Ce endpoint remplacera progressivement l'appel direct à la Supabase Edge Function.
    """
    with PROCESSING_TIME.labels(type="chat").time():
        MESSAGES_RECEIVED.labels(type="chat", language=request.language).inc()
        
        # Créer le signal pondéré
        signal = SignalPondere(
            type="LEAD_MESSAGE_RECEIVED",
            payload={
                "session_id": request.session_id,
                "message": request.message,
                "prospect_info": request.prospect_info.model_dump(),
                "conversation_history": [m.model_dump() for m in request.conversation_history],
                "language": request.language,
                "message_count": len(request.conversation_history) + 1
            },
            confiance=1.0,  # Signal brut, confiance maximale
            metadata={
                "version": "1.0.0",
                "priority": "NORMAL" if len(request.conversation_history) < 6 else "HIGH"
            }
        )
        
        try:
            await produce_signal(TOPIC_INPUT_CHAT, signal, key=request.session_id)
            
            return {
                "status": "accepted",
                "signal_id": signal.id,
                "correlation_id": signal.correlation_id,
                "message": "Signal transmitted to cortex-nlp"
            }
        except Exception as e:
            # Log l'erreur et notifier le système
            error_signal = SignalPondere(
                type="ERROR_INGESTION_FAILED",
                payload={
                    "original_request": request.model_dump(),
                    "error": str(e)
                },
                confiance=1.0,
                metadata={"version": "1.0.0", "priority": "HIGH"}
            )
            # Essayer de produire l'erreur (best effort)
            try:
                await produce_signal(TOPIC_ERRORS, error_signal)
            except:
                pass
            
            raise HTTPException(status_code=503, detail="Signal transmission failed")

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket pour communication bidirectionnelle en temps réel.
    
    Utilisé pour:
    - Recevoir les messages du frontend
    - Envoyer les réponses du cortex-nlp (streaming)
    - Notifications de qualification
    """
    await ws_manager.connect(session_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            MESSAGES_RECEIVED.labels(type="websocket", language=data.get("language", "fr")).inc()
            
            # Convertir en signal
            signal = SignalPondere(
                type="LEAD_MESSAGE_RECEIVED",
                payload={
                    "session_id": session_id,
                    **data
                },
                confiance=1.0,
                metadata={"version": "1.0.0", "priority": "NORMAL"}
            )
            
            try:
                await produce_signal(TOPIC_INPUT_CHAT, signal, key=session_id)
                await websocket.send_json({
                    "type": "ack",
                    "signal_id": signal.id
                })
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
    
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id)

# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
