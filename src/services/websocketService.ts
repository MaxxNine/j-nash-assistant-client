import { WebSocketMessage } from '../types';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string;
  private messageHandler: (message: WebSocketMessage) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 segundos

  constructor(token: string, messageHandler: (message: WebSocketMessage) => void) {
    this.token = token;
    this.messageHandler = messageHandler;
  }

  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket já está conectado.');
      return;
    }

    // Anexa o token como query parameter
    this.ws = new WebSocket(`${WEBSOCKET_URL}?token=${this.token}`);

    this.ws.onopen = () => {
      console.log('WebSocket conectado.');
      this.reconnectAttempts = 0; // Resetar tentativas ao conectar com sucesso
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as WebSocketMessage;
        this.messageHandler(message);
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket desconectado:', event.code, event.reason);
      // Não tentar reconectar se o fechamento foi intencional ou por falha de autenticação
      if (event.code === 1000 || event.code === 1008) { // 1000: Normal Closure, 1008: Policy Violation (token inválido)
        return;
      }
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Tentando reconectar WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.connect(), this.reconnectInterval);
      } else {
        console.error('Máximo de tentativas de reconexão WebSocket atingido.');
      }
    };

    this.ws.onerror = (error) => {
      console.error('Erro WebSocket:', error);
      // O evento 'onclose' geralmente é disparado após 'onerror', então a lógica de reconexão está lá.
    };
  }

  public disconnect(): void {
    if (this.ws) {
      console.log('Desconectando WebSocket intencionalmente.');
      this.ws.close(1000, "Desconexão iniciada pelo cliente"); // 1000 indica fechamento normal
      this.ws = null;
    }
  }

  public sendMessage(message: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket não está conectado. Não é possível enviar mensagem.');
    }
  }
}