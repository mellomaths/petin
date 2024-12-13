export type Event<T> = {
  id: string;
  type: string;
  queue: string;
  timestamp: number;
  sentAt: string;
  payload: T;
};

export enum EventQueue {}
