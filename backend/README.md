# NEOCORTEX Backend

Architecture Acteur-Organique bio-inspirée pour le système de qualification des leads.

## Structure

```
/backend
├── /infrastructure          # Docker Compose, observabilité
│   ├── docker-compose.yml   # Stack complète
│   ├── /prometheus          # Configuration métriques
│   └── /grafana             # Dashboards
│
├── /cortex-sensoriel        # Gateway d'ingestion (API)
│   ├── src/main.py          # FastAPI + Kafka producer
│   ├── Dockerfile
│   └── requirements.txt
│
├── /cortex-nlp              # Traitement linguistique (à venir)
├── /cortex-qualification    # Qualification leads (à venir)
├── /cortex-prefrontal       # Décision (à venir)
│
└── /shared                  # Types et schémas partagés
    ├── types.py             # Pydantic models
    └── /schemas             # JSON Schemas
```

## Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Python 3.12+ (pour développement local)

### Lancer l'infrastructure

```bash
cd backend/infrastructure

# Démarrer tous les services
docker-compose up -d

# Vérifier les services
docker-compose ps

# Voir les logs
docker-compose logs -f cortex-sensoriel
```

### Accès aux interfaces

| Service | URL | Credentials |
|---------|-----|-------------|
| **Cortex Sensoriel** | http://localhost:8000 | - |
| **Redpanda Console** | http://localhost:8080 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin/admin |
| **Jaeger** | http://localhost:16686 | - |

### Topics Kafka

```bash
# Lister les topics
docker exec neocortex-redpanda rpk topic list

# Consommer un topic
docker exec neocortex-redpanda rpk topic consume signals.input.chat
```

## Architecture des Signaux

```
Frontend (React)
     │
     ▼ HTTP/WebSocket
┌─────────────────┐
│ Cortex Sensoriel│ → signals.input.chat
└────────┬────────┘
         │
         ▼ Kafka
┌─────────────────┐
│   Cortex NLP    │ → signals.intelligence
└────────┬────────┘
         │
         ▼ Kafka
┌─────────────────┐
│Cortex Préfrontal│ → signals.actions
└────────┬────────┘
         │
         ▼ Kafka
┌─────────────────┐
│ Cortex Sensoriel│ → WebSocket → Frontend
└─────────────────┘
```

## Développement Local

```bash
# Créer virtualenv
python -m venv venv
source venv/bin/activate

# Installer dépendances
pip install -r cortex-sensoriel/requirements.txt

# Lancer le service (hors Docker)
cd cortex-sensoriel
uvicorn src.main:app --reload --port 8000
```

## Métriques Disponibles

- `cortex_sensoriel_messages_received_total` - Messages reçus par type
- `cortex_sensoriel_messages_produced_total` - Messages produits vers Kafka
- `cortex_sensoriel_processing_seconds` - Temps de traitement
- `cortex_sensoriel_websocket_connections_total` - Connexions WebSocket
