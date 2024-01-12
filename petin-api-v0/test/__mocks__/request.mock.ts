import { faker } from '@faker-js/faker';

export const mockRequest = () => {
  const request = {
    user: {
      id: faker.datatype.uuid(),
    },
  } as unknown as Request;
  return request;
};
