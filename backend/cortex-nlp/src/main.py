# Cortex NLP - NEOCORTEX Linguistic Processing

"""
Cortex NLP - Traitement Linguistique

Ce service consomme les signaux LEAD_MESSAGE_RECEIVED, traite le langage
naturel via LLM, et émet des signaux d'intelligence et de réponse.

Équivalent biologique: Aires de Broca et Wernicke qui traitent le langage,
comprennent les intentions et formulent les réponses.
"""

import asyncio
import json
import os
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel, Field
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import redis.asyncio as redis

# ============================================
# CONFIGURATION
# ============================================

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
LLM_API_URL = os.getenv("LLM_API_URL", "https://ai.gateway.lovable.dev/v1/chat/completions")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")  # LOVABLE_API_KEY

TOPIC_INPUT = "signals.input.chat"
TOPIC_OUTPUT = "signals.output.chat"
TOPIC_INTELLIGENCE = "signals.intelligence"
TOPIC_QUALIFICATION = "signals.qualification"
TOPIC_ERRORS = "signals.errors"

CONSUMER_GROUP = "cortex-nlp-group"

# ============================================
# MODÈLES
# ============================================

class SignalMetadata(BaseModel):
    version: str = "1.0.0"
    priority: str = "NORMAL"
    trace_id: Optional[str] = None
    span_id: Optional[str] = None

class SignalPondere(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    source: str = "cortex-nlp"
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    payload: Dict[str, Any]
    confiance: float = Field(ge=0.0, le=1.0, default=1.0)
    ttl: int = 60000
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    metadata: SignalMetadata = Field(default_factory=SignalMetadata)

class ConversationMessage(BaseModel):
    role: str
    content: str

# ============================================
# MÉTRIQUES PROMETHEUS
# ============================================

MESSAGES_CONSUMED = Counter(
    'cortex_nlp_messages_consumed_total',
    'Total messages consumed from Kafka',
    ['topic']
)

MESSAGES_PRODUCED = Counter(
    'cortex_nlp_messages_produced_total',
    'Total messages produced to Kafka',
    ['topic', 'type']
)

LLM_REQUESTS = Counter(
    'cortex_nlp_llm_requests_total',
    'Total LLM API requests',
    ['status']
)

LLM_LATENCY = Histogram(
    'cortex_nlp_llm_latency_seconds',
    'LLM API request latency'
)

PROCESSING_TIME = Histogram(
    'cortex_nlp_processing_seconds',
    'Time spent processing messages'
)

ACTIVE_CONVERSATIONS = Gauge(
    'cortex_nlp_active_conversations',
    'Number of active conversations in cache'
)

# ============================================
# CLIENTS GLOBAUX
# ============================================

consumer: Optional[AIOKafkaConsumer] = None
producer: Optional[AIOKafkaProducer] = None
redis_client: Optional[redis.Redis] = None
http_client: Optional[httpx.AsyncClient] = None

# ============================================
# LLM CLIENT
# ============================================

class LLMClient:
    """Client pour l'API LLM (Lovable AI Gateway)"""
    
    def __init__(self, http_client: httpx.AsyncClient, api_key: str, api_url: str):
        self.client = http_client
        self.api_key = api_key
        self.api_url = api_url
    
    async def generate_response(
        self,
        messages: List[ConversationMessage],
        prospect_info: Dict[str, Any],
        system_prompt: Optional[str] = None
    ) -> str:
        """Génère une réponse via le LLM"""
        
        if not system_prompt:
            system_prompt = self._build_system_prompt(prospect_info, len(messages))
        
        llm_messages = [
            {"role": "system", "content": system_prompt},
            *[{"role": m.role, "content": m.content} for m in messages]
        ]
        
        with LLM_LATENCY.time():
            try:
                response = await self.client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "google/gemini-2.5-flash",
                        "messages": llm_messages,
                        "stream": False
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    LLM_REQUESTS.labels(status="success").inc()
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    LLM_REQUESTS.labels(status="error").inc()
                    raise Exception(f"LLM API error: {response.status_code}")
                    
            except Exception as e:
                LLM_REQUESTS.labels(status="error").inc()
                raise e
    
    async def generate_report(
        self,
        messages: List[ConversationMessage],
        prospect_info: Dict[str, Any]
    ) -> str:
        """Génère un rapport de qualification"""
        
        conversation_text = "\n\n".join([
            f"{m.role.upper()}: {m.content}" for m in messages
        ])
        
        system_prompt = f"""Tu es un consultant senior chez NTSAGUI Digital. Génère un rapport d'analyse professionnel.

PROSPECT:
- Nom: {prospect_info.get('name', 'N/A')}
- Email: {prospect_info.get('email', 'N/A')}
- Entreprise: {prospect_info.get('company', 'N/A')}
- Téléphone: {prospect_info.get('phone', 'Non fourni')}

CONVERSATION:
{conversation_text}

FORMAT RAPPORT:
1. RÉSUMÉ EXÉCUTIF (2-3 phrases)
2. ANALYSE DÉTAILLÉE (4-5 points)
3. SOLUTIONS RECOMMANDÉES (3-4 options)
4. TIMELINE D'IMPLÉMENTATION
5. SCORE DE COMPATIBILITÉ (X/100)
6. PROCHAINES ÉTAPES

Génère le rapport maintenant."""

        return await self.generate_response([], prospect_info, system_prompt)
    
    def _build_system_prompt(self, prospect_info: Dict[str, Any], message_count: int) -> str:
        """Construit le prompt système adapté à la phase de conversation"""
        
        phase = "DISCOVERY" if message_count < 3 else "DEEP DIVE" if message_count < 6 else "QUALIFICATION"
        
        return f"""Tu es un assistant commercial expert de NTSAGUI Digital, spécialisé en solutions IA et développement logiciel.

RÔLES: Commercial, chef de projet, et consultant technique.

INSTRUCTIONS:
1. Réponds dans la langue du prospect
2. Sois naturel et conversationnel
3. Pose UNE question engageante à la fin
4. Phase actuelle: {phase}

PROSPECT:
- Nom: {prospect_info.get('name', 'N/A')}
- Entreprise: {prospect_info.get('company', 'N/A')}

{"À partir de 6+ messages, propose un appel téléphone." if message_count >= 5 else ""}"""


# ============================================
# CONVERSATION STATE MANAGER
# ============================================

class ConversationStateManager:
    """Gère l'état des conversations en Redis (mémoire court-terme)"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.ttl = 3600  # 1 heure
    
    async def get_conversation(self, session_id: str) -> List[Dict[str, str]]:
        """Récupère l'historique de conversation"""
        key = f"conversation:{session_id}"
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return []
    
    async def add_message(self, session_id: str, role: str, content: str):
        """Ajoute un message à la conversation"""
        key = f"conversation:{session_id}"
        history = await self.get_conversation(session_id)
        history.append({"role": role, "content": content})
        await self.redis.setex(key, self.ttl, json.dumps(history))
    
    async def get_prospect_info(self, session_id: str) -> Dict[str, Any]:
        """Récupère les infos du prospect"""
        key = f"prospect:{session_id}"
        data = await self.redis.get(key)
        if data:
            return json.loads(data)
        return {}
    
    async def set_prospect_info(self, session_id: str, info: Dict[str, Any]):
        """Stocke les infos du prospect"""
        key = f"prospect:{session_id}"
        await self.redis.setex(key, self.ttl, json.dumps(info))
    
    async def count_active(self) -> int:
        """Compte les conversations actives"""
        keys = await self.redis.keys("conversation:*")
        return len(keys)


# ============================================
# MESSAGE PROCESSOR
# ============================================

class MessageProcessor:
    """Traite les signaux entrants et orchestre les réponses"""
    
    def __init__(
        self,
        llm_client: LLMClient,
        state_manager: ConversationStateManager,
        producer: AIOKafkaProducer
    ):
        self.llm = llm_client
        self.state = state_manager
        self.producer = producer
    
    async def process_lead_message(self, signal: Dict[str, Any]):
        """Traite un signal LEAD_MESSAGE_RECEIVED"""
        
        with PROCESSING_TIME.time():
            payload = signal.get("payload", {})
            session_id = payload.get("session_id")
            message = payload.get("message", "")
            prospect_info = payload.get("prospect_info", {})
            correlation_id = signal.get("correlation_id", str(uuid.uuid4()))
            
            # Stocker les infos prospect
            await self.state.set_prospect_info(session_id, prospect_info)
            
            # Ajouter le message utilisateur à l'historique
            await self.state.add_message(session_id, "user", message)
            
            # Récupérer l'historique complet
            history = await self.state.get_conversation(session_id)
            messages = [ConversationMessage(role=m["role"], content=m["content"]) for m in history]
            
            # Analyser l'intention
            intent_signal = await self._detect_intent(session_id, message, correlation_id)
            await self._produce_signal(TOPIC_INTELLIGENCE, intent_signal)
            
            # Générer la réponse LLM
            try:
                response = await self.llm.generate_response(messages, prospect_info)
                
                # Stocker la réponse dans l'historique
                await self.state.add_message(session_id, "assistant", response)
                
                # Émettre le signal de réponse
                response_signal = SignalPondere(
                    type="ASSISTANT_RESPONSE",
                    payload={
                        "session_id": session_id,
                        "response": response,
                        "message_count": len(messages) + 1
                    },
                    confiance=0.9,
                    correlation_id=correlation_id,
                    metadata=SignalMetadata(priority="NORMAL")
                )
                await self._produce_signal(TOPIC_OUTPUT, response_signal)
                
                # Vérifier si qualification nécessaire
                if len(messages) >= 6:
                    qualification = await self._evaluate_qualification(
                        session_id, messages, prospect_info, correlation_id
                    )
                    await self._produce_signal(TOPIC_QUALIFICATION, qualification)
                
            except Exception as e:
                # Émettre erreur
                error_signal = SignalPondere(
                    type="ERROR_PROCESSING_FAILED",
                    payload={
                        "session_id": session_id,
                        "error": str(e),
                        "original_signal_id": signal.get("id")
                    },
                    confiance=1.0,
                    correlation_id=correlation_id,
                    metadata=SignalMetadata(priority="HIGH")
                )
                await self._produce_signal(TOPIC_ERRORS, error_signal)
            
            # Mettre à jour les métriques
            count = await self.state.count_active()
            ACTIVE_CONVERSATIONS.set(count)
    
    async def _detect_intent(
        self,
        session_id: str,
        message: str,
        correlation_id: str
    ) -> SignalPondere:
        """Détecte l'intention du message (implémentation simplifiée)"""
        
        # Mots-clés pour détection d'intention basique
        intents = {
            "budget": ["budget", "prix", "coût", "tarif", "combien", "price", "cost"],
            "timeline": ["quand", "délai", "deadline", "timeline", "urgence", "rapide"],
            "technical": ["technique", "tech", "api", "intégration", "stack", "développement"],
            "demo": ["demo", "démonstration", "essai", "test", "voir"],
            "contact": ["appeler", "téléphone", "rdv", "rendez-vous", "contact", "call"]
        }
        
        message_lower = message.lower()
        detected_intent = "general"
        confidence = 0.5
        
        for intent, keywords in intents.items():
            if any(kw in message_lower for kw in keywords):
                detected_intent = intent
                confidence = 0.8
                break
        
        return SignalPondere(
            type="LEAD_INTENT_DETECTED",
            payload={
                "session_id": session_id,
                "intent": detected_intent,
                "message": message,
                "keywords_matched": []
            },
            confiance=confidence,
            correlation_id=correlation_id
        )
    
    async def _evaluate_qualification(
        self,
        session_id: str,
        messages: List[ConversationMessage],
        prospect_info: Dict[str, Any],
        correlation_id: str
    ) -> SignalPondere:
        """Évalue le niveau de qualification du lead"""
        
        # Score basé sur le nombre de messages et la qualité des échanges
        message_count = len(messages)
        base_score = min(message_count * 10, 50)
        
        # Bonus si téléphone fourni
        if prospect_info.get("phone"):
            base_score += 20
        
        # Bonus basé sur les mots-clés de conversion
        conversion_keywords = ["intéressé", "budget", "quand", "commencer", "interested", "start"]
        conversation_text = " ".join([m.content.lower() for m in messages])
        for kw in conversion_keywords:
            if kw in conversation_text:
                base_score += 5
        
        final_score = min(base_score, 100)
        
        return SignalPondere(
            type="LEAD_QUALIFIED",
            payload={
                "session_id": session_id,
                "prospect_info": prospect_info,
                "score": final_score,
                "message_count": message_count,
                "recommended_action": "GENERATE_REPORT" if final_score >= 70 else "CONTINUE_CONVERSATION"
            },
            confiance=final_score / 100,
            correlation_id=correlation_id,
            metadata=SignalMetadata(priority="HIGH" if final_score >= 70 else "NORMAL")
        )
    
    async def _produce_signal(self, topic: str, signal: SignalPondere):
        """Produit un signal vers Kafka"""
        await self.producer.send_and_wait(
            topic,
            value=json.dumps(signal.model_dump()).encode('utf-8'),
            key=signal.correlation_id.encode('utf-8')
        )
        MESSAGES_PRODUCED.labels(topic=topic, type=signal.type).inc()


# ============================================
# KAFKA CONSUMER LOOP
# ============================================

async def consume_messages(processor: MessageProcessor):
    """Boucle principale de consommation Kafka"""
    
    global consumer
    
    consumer = AIOKafkaConsumer(
        TOPIC_INPUT,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=CONSUMER_GROUP,
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    await consumer.start()
    print(f"🧠 Cortex NLP: Consuming from {TOPIC_INPUT}")
    
    try:
        async for msg in consumer:
            MESSAGES_CONSUMED.labels(topic=msg.topic).inc()
            signal = msg.value
            
            signal_type = signal.get("type", "")
            
            if signal_type == "LEAD_MESSAGE_RECEIVED":
                await processor.process_lead_message(signal)
            else:
                print(f"⚠️ Unknown signal type: {signal_type}")
    
    finally:
        await consumer.stop()


# ============================================
# FASTAPI APPLICATION
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management"""
    global producer, redis_client, http_client
    
    print("🧠 Cortex NLP starting...")
    
    # Initialize clients
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    )
    await producer.start()
    print("✅ Kafka producer connected")
    
    try:
        redis_client = redis.from_url(REDIS_URL)
        await redis_client.ping()
        print("✅ Redis connected")
    except Exception as e:
        print(f"⚠️ Redis connection failed: {e}")
        redis_client = None
    
    http_client = httpx.AsyncClient()
    
    # Initialize processor
    llm_client = LLMClient(http_client, LLM_API_KEY, LLM_API_URL)
    state_manager = ConversationStateManager(redis_client) if redis_client else None
    processor = MessageProcessor(llm_client, state_manager, producer)
    
    # Start consumer in background
    consumer_task = asyncio.create_task(consume_messages(processor))
    
    yield
    
    # Shutdown
    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        pass
    
    if producer:
        await producer.stop()
    if redis_client:
        await redis_client.close()
    if http_client:
        await http_client.aclose()
    
    print("🔌 Cortex NLP stopped")


app = FastAPI(
    title="Cortex NLP - NEOCORTEX Linguistic Processing",
    description="Traitement du langage naturel et génération de réponses IA",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "service": "cortex-nlp",
        "kafka_connected": producer is not None,
        "redis_connected": redis_client is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/metrics")
async def metrics():
    """Prometheus metrics"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ============================================
# ENTRY POINT
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
