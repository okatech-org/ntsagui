# Cortex NLP - Traitement Linguistique

Service de traitement du langage naturel pour l'architecture NEOCORTEX.

## Responsabilités

- Consomme les signaux `LEAD_MESSAGE_RECEIVED` depuis Kafka
- Génère des réponses via LLM (Lovable AI Gateway / Gemini 2.5)
- Détecte les intentions des messages
- Évalue la qualification des leads
- Gère l'état des conversations en Redis

## Signaux

### Consommés
- `signals.input.chat` → `LEAD_MESSAGE_RECEIVED`

### Produits
- `signals.output.chat` → `ASSISTANT_RESPONSE`
- `signals.intelligence` → `LEAD_INTENT_DETECTED`
- `signals.qualification` → `LEAD_QUALIFIED`
- `signals.errors` → `ERROR_PROCESSING_FAILED`

## Configuration

| Variable | Description | Défaut |
|----------|-------------|--------|
| `KAFKA_BOOTSTRAP_SERVERS` | Serveurs Kafka | `localhost:9092` |
| `REDIS_URL` | URL Redis | `redis://localhost:6379` |
| `LLM_API_URL` | URL API LLM | Lovable Gateway |
| `LLM_API_KEY` | Clé API LLM | - |

## Développement Local

```bash
# Installer dépendances
pip install -r requirements.txt

# Lancer (avec Kafka/Redis déjà démarrés)
LLM_API_KEY=your_key uvicorn src.main:app --reload --port 8001
```

## Métriques

- `cortex_nlp_messages_consumed_total` - Messages consommés
- `cortex_nlp_messages_produced_total` - Messages produits
- `cortex_nlp_llm_requests_total` - Requêtes LLM
- `cortex_nlp_llm_latency_seconds` - Latence LLM
- `cortex_nlp_active_conversations` - Conversations actives
