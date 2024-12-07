import { faker } from "@faker-js/faker";
import { Reason, Report } from "../../../src/application/report/Report";
import { CreateReport } from "../../../src/application/report/usecase/CreateReport";
import { mockAuthenticate } from "../../helpers/Mock";

describe("CreateReport", () => {
  let service: CreateReport;

  beforeEach(() => {
    service = new CreateReport();
    service.authenticate = mockAuthenticate();
    service.reportsRepository = {
      save: jest.fn(),
    };
    service.accountsRepository = {
      get: jest.fn(),
    };
    service.petsRepository = {
      get: jest.fn(),
    };
  });

  it("should create a report", async () => {
    const report: Report = {
      againstAccountId: faker.string.uuid(),
      petId: faker.string.uuid(),
      reason: Reason.FAKE_ACCOUNT,
      explanation: "description",
    };
    const createdByAccountId = faker.string.uuid();
    service.authenticate.execute = jest.fn().mockResolvedValue({
      id: createdByAccountId,
    });
    service.accountsRepository.get = jest
      .fn()
      .mockResolvedValue({ id: report.againstAccountId });
    service.petsRepository.get = jest
      .fn()
      .mockResolvedValue({ id: report.petId });
    const result = await service.execute("token", report);
    expect(result).toBeDefined();
    expect(result.reportId).toBeDefined();
    expect(service.reportsRepository.save).toHaveBeenCalledTimes(1);
    expect(service.reportsRepository.save).toHaveBeenCalledWith({
      id: expect.any(String),
      createdByAccountId: createdByAccountId,
      againstAccountId: report.againstAccountId,
      petId: report.petId,
      reason: report.reason,
      explanation: report.explanation,
      status: "PENDING",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    } as Report);
  });

  it("should throw an error when account to be reported is not found", async () => {
    const report: Report = {
      againstAccountId: faker.string.uuid(),
      petId: faker.string.uuid(),
      reason: Reason.FAKE_ACCOUNT,
      explanation: "description",
    };
    service.authenticate.execute = jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
    });
    service.accountsRepository.get = jest.fn().mockResolvedValue(null);
    await expect(service.execute("token", report)).rejects.toThrow(
      "Account to be reported not found"
    );
    expect(service.reportsRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error when pet to be reported is not found", async () => {
    const report: Report = {
      againstAccountId: faker.string.uuid(),
      petId: faker.string.uuid(),
      reason: Reason.FAKE_ACCOUNT,
      explanation: "description",
    };
    service.authenticate.execute = jest.fn().mockResolvedValue({
      id: faker.string.uuid(),
    });
    service.accountsRepository.get = jest.fn().mockResolvedValue({
      id: report.againstAccountId,
    });
    service.petsRepository.get = jest.fn().mockResolvedValue(null);
    await expect(service.execute("token", report)).rejects.toThrow(
      "Pet to be reported not found"
    );
    expect(service.reportsRepository.save).not.toHaveBeenCalled();
  });
});
