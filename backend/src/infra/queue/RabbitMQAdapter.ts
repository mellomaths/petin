import { Channel, connect, Connection } from "amqplib";
import { Inject } from "../di/DependencyInjection";
import { Settings } from "../settings/Settings";
import { BrokerConnection } from "./BrokerConnection";

export class RabbitMQAdapter implements BrokerConnection {
  @Inject("Settings")
  settings: Settings;

  private connection!: Connection;
  private channel!: Channel;

  get connected(): boolean {
    return !!this.connection && !!this.channel;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    this.connection = await connect(this.settings.messageBroker.url);
    this.channel = await this.connection.createChannel();
  }

  async send(queue: string, message: string): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async close(): Promise<void> {
    if (!this.connected) return;

    await this.channel.close();
    await this.connection.close();
  }
}
