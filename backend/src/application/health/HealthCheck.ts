export type Health = {
  ok: boolean;
  message: string;
  status: {
    database: {
      up: boolean;
    };
    messageBroker: {
      up: boolean;
    };
  };
};
