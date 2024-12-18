export type Event<IType, IQueue, IPayload> = {
  id: string;
  type: IType;
  queue: IQueue;
  timestamp: number;
  sentAt: string;
  payload: IPayload;
};
