import { Event } from "../../application/event/Event";

export interface BrokerConnection {
  connect(): Promise<void>;
  send(queue: string, message: Event<any>): Promise<void>;
  close(): Promise<void>;
}
