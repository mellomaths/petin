export interface DatabaseConnection {
  connect(): Promise<void>;
  getConnection(): any;
  query(statement: string, params: any): Promise<any>;
  close(): Promise<void>;
}
