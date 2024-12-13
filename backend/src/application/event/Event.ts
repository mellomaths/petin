export type Event<T> = {
  id: string;
  type: string;
  timestamp: number;
  sentAt: string;
  payload: T;
};
