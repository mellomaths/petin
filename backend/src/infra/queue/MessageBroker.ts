import { Event } from "../../application/event/Event";

export interface MessageBroker {
  connect(): Promise<void>;
  send(message: Event<any, any, any>): Promise<void>;
  close(): Promise<void>;
  healthCheck(): Promise<boolean>;
}
