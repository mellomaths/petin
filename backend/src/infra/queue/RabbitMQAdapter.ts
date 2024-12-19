import client, { Channel, Connection } from "amqplib/callback_api";
import { Inject } from "../di/DependencyInjection";
import { Settings } from "../settings/Settings";
import { Event } from "../../application/event/Event";
import { MessageBroker } from "./MessageBroker";

export class RabbitMQAdapter implements MessageBroker {
  @Inject("Settings")
  settings: Settings;

  private connection: Connection;
  private channel: Channel;

  get connected(): boolean {
    return !!this.connection && !!this.channel;
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    return new Promise((resolve, reject) => {
      client.connect(
        this.settings.getMessageBroker().url,
        (error, connection) => {
          if (error) reject(error);
          connection.createChannel((error, channel) => {
            if (error) reject(error);
            resolve();
          });
        }
      );
    });
  }

  async send(message: Event<any, any, any>): Promise<void> {
    const queue = message.queue;
    return new Promise((resolve, reject) => {
      client.connect(
        this.settings.getMessageBroker().url,
        (error, connection) => {
          if (error) reject(error);
          connection.createChannel((error, channel) => {
            if (error) reject(error);
            channel.assertQueue(queue, { durable: false }, (error) => {
              if (error) reject(error);
              channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
              resolve();
            });
          });
        }
      );
    });
  }

  async close(): Promise<void> {
    if (!this.connected) return;
    return new Promise((resolve, reject) => {
      this.channel.close((error) => {
        if (error) reject(error);
        this.connection.close((error) => {
          if (error) reject(error);
          resolve();
        });
      });
    });
  }

  async healthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      client.connect(
        this.settings.getMessageBroker().url,
        (error, connection) => {
          if (error) return resolve(false);
          connection.createChannel((error, channel) => {
            if (error) return resolve(false);
            return resolve(true);
          });
        }
      );
    });
  }
}
