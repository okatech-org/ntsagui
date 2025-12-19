/**
 * NEOCORTEX Client - Interface avec le Cortex Sensoriel
 * 
 * Ce client connecte le frontend React à l'architecture Acteur-Organique.
 * Il supporte deux modes de communication:
 * - HTTP POST pour les messages simples
 * - WebSocket pour la communication bidirectionnelle en temps réel
 */

import { v4 as uuidv4 } from 'uuid';

// Configuration
const NEOCORTEX_API_URL = import.meta.env.VITE_NEOCORTEX_API_URL || 'http://localhost:8000';
const NEOCORTEX_WS_URL = import.meta.env.VITE_NEOCORTEX_WS_URL || 'ws://localhost:8000';

// Feature flag pour activer NEOCORTEX
export const NEOCORTEX_ENABLED = import.meta.env.VITE_NEOCORTEX_ENABLED === 'true';

// Types
export interface ProspectInfo {
    name: string;
    email: string;
    company: string;
    phone?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatRequest {
    session_id: string;
    message: string;
    prospect_info: ProspectInfo;
    conversation_history: ChatMessage[];
    language: string;
}

export interface ChatResponse {
    status: 'accepted' | 'error';
    signal_id?: string;
    correlation_id?: string;
    message?: string;
    error?: string;
}

export interface SignalMessage {
    type: string;
    signal_id?: string;
    payload?: {
        session_id?: string;
        response?: string;
        message_count?: number;
        score?: number;
        intent?: string;
        [key: string]: unknown;
    };
    error?: string;
}

// Générateur de session ID
export const generateSessionId = (): string => {
    const stored = sessionStorage.getItem('neocortex_session_id');
    if (stored) return stored;

    const newId = uuidv4();
    sessionStorage.setItem('neocortex_session_id', newId);
    return newId;
};

/**
 * Client HTTP pour le Cortex Sensoriel
 */
class NeocortexClient {
    private baseUrl: string;
    private wsUrl: string;
    private ws: WebSocket | null = null;
    private messageHandlers: Set<(message: SignalMessage) => void> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    constructor(baseUrl: string = NEOCORTEX_API_URL, wsUrl: string = NEOCORTEX_WS_URL) {
        this.baseUrl = baseUrl;
        this.wsUrl = wsUrl;
    }

    /**
     * Vérifie si le backend NEOCORTEX est disponible
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Envoie un message chat via HTTP POST
     * Le message sera traité de manière asynchrone par le pipeline Kafka
     */
    async sendMessage(request: ChatRequest): Promise<ChatResponse> {
        const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Établit une connexion WebSocket pour la communication temps réel
     */
    connectWebSocket(sessionId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            try {
                this.ws = new WebSocket(`${this.wsUrl}/ws/${sessionId}`);

                this.ws.onopen = () => {
                    console.log('🧠 NEOCORTEX WebSocket connected');
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message: SignalMessage = JSON.parse(event.data);
                        this.messageHandlers.forEach(handler => handler(message));
                    } catch (e) {
                        console.error('Failed to parse WebSocket message:', e);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('🔌 NEOCORTEX WebSocket closed:', event.code);
                    this.ws = null;

                    // Auto-reconnect
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        setTimeout(() => {
                            this.connectWebSocket(sessionId).catch(console.error);
                        }, this.reconnectDelay * this.reconnectAttempts);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(new Error('WebSocket connection failed'));
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Envoie un message via WebSocket
     */
    sendWebSocketMessage(data: Partial<ChatRequest>): void {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }
        this.ws.send(JSON.stringify(data));
    }

    /**
     * S'abonne aux messages WebSocket
     */
    onMessage(handler: (message: SignalMessage) => void): () => void {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    /**
     * Ferme la connexion WebSocket
     */
    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
    }

    /**
     * Vérifie si le WebSocket est connecté
     */
    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

// Instance singleton
export const neocortexClient = new NeocortexClient();

/**
 * Hook React pour utiliser NEOCORTEX avec polling
 * (Alternative si WebSocket n'est pas disponible)
 */
export async function sendChatMessage(
    message: string,
    prospectInfo: ProspectInfo,
    conversationHistory: ChatMessage[],
    language: string = 'fr'
): Promise<ChatResponse> {
    const sessionId = generateSessionId();

    return neocortexClient.sendMessage({
        session_id: sessionId,
        message,
        prospect_info: prospectInfo,
        conversation_history: conversationHistory,
        language,
    });
}

export default neocortexClient;
