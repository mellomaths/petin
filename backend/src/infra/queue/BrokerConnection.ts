export interface BrokerConnection {
  connect(): Promise<void>;
  send(queue: string, message: string): Promise<void>;
  close(): Promise<void>;
}
