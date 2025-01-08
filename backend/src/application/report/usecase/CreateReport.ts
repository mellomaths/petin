import { Inject } from "../../../infra/di/DependencyInjection";
import {
  Report,
  ReportEventQueue,
  ReportEventType,
  ReportStatus,
} from "../Report";
import { Authenticate } from "../../account/usecase/Authenticate";
import { Account } from "../../account/Account";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { Pet } from "../../pet/Pet";
import { ReportValidator } from "../validator/ReportValidator";
import { MessageBroker } from "../../../infra/queue/MessageBroker";
import { Event } from "../../event/Event";

export class CreateReport {
  @Inject("Authenticate")
  authenticate: Authenticate;

  @Inject("ReportsRepository")
  reportsRepository: CreateReportRepository;

  @Inject("AccountsRepository")
  accountsRepository: CreateReportAccountRepository;

  @Inject("PetsRepository")
  petsRepository: CreateReportPetsRepository;

  @Inject("MessageBroker")
  messageBroker: MessageBroker;

  async execute(token: string, report: Report): Promise<{ reportId: string }> {
    ReportValidator.validate(report);
    const createdByAccount = await this.authenticate.execute(token);
    const againstAccount = await this.accountsRepository.get(
      report.againstAccountId
    );
    if (!againstAccount) {
      throw new ApplicationException(
        404,
        { message: "Account to be reported not found" },
        "Account to be reported not found"
      );
    }
    const pet = await this.petsRepository.get(report.petId);
    if (!pet) {
      throw new ApplicationException(
        404,
        { message: "Pet to be reported not found" },
        "Pet to be reported not found"
      );
    }
    report.createdByAccountId = createdByAccount.id!;
    report.id = crypto.randomUUID();
    report.status = ReportStatus.PENDING.toString();
    report.createdAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    await this.reportsRepository.save(report);

    const event: Event<ReportEventType, ReportEventQueue, Report> = {
      id: crypto.randomUUID(),
      type: ReportEventType.ReportCreated,
      queue: ReportEventQueue.Report,
      timestamp: Date.now(),
      sentAt: new Date().toISOString(),
      payload: report,
    };
    await this.messageBroker.send(event);
    return { reportId: report.id };
  }
}

export interface CreateReportRepository {
  save(report: Report): Promise<void>;
}

export interface CreateReportAccountRepository {
  get(accountId: string): Promise<Account | null>;
}

export interface CreateReportPetsRepository {
  get(petId: string): Promise<Pet | null>;
}
