# NEOCORTEX Infrastructure

Infrastructure événementielle pour l'architecture Acteur-Organique.

## Démarrage Rapide

```bash
# Démarrer l'infrastructure complète
docker-compose up -d

# Vérifier les services
docker-compose ps

# Accès interfaces
# - Redpanda Console: http://localhost:8080
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
# - Jaeger: http://localhost:16686
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Redpanda | 9092 | Broker Kafka-compatible |
| Redpanda Console | 8080 | Interface de gestion |
| Redis | 6379 | Cache mémoire court-terme |
| Prometheus | 9090 | Métriques |
| Grafana | 3001 | Dashboards |
| Jaeger | 16686 | Tracing distribué |

## Topics Kafka

| Topic | Description |
|-------|-------------|
| `signals.input.chat` | Messages entrants chatbot |
| `signals.intelligence` | Intentions détectées |
| `signals.qualification` | Leads qualifiés |
| `signals.actions` | Décisions du cortex préfrontal |
| `signals.output.chat` | Réponses pour le frontend |
| `signals.errors` | Erreurs système |
