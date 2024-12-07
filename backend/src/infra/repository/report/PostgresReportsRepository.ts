import { Report } from "../../../application/report/Report";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { Inject } from "../../di/DependencyInjection";
import { ReportsRepository } from "./ReportsRepository";

export class PostgresReportsRepository implements ReportsRepository {
  @Inject("Database")
  connection: DatabaseConnection;

  async save(report: Report): Promise<void> {
    const statement = `INSERT INTO petin.report (report_id, created_by_account_id, against_account_id, pet_id, reason, explanation, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await this.connection.query(statement, [
      report.id,
      report.createdByAccountId,
      report.againstAccountId,
      report.petId,
      report.reason,
      report.explanation,
      report.status,
      report.createdAt,
      report.updatedAt,
    ]);
  }
}
