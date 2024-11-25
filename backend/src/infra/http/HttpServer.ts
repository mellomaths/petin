export interface HttpServer {
  register(
    method: string,
    url: string,
    callback: Function,
    isUpload?: boolean
  ): void;
  listen(port: number): void;
}
