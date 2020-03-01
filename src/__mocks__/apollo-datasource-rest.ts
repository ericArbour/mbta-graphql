export const mockGet = jest.fn();

class MockRESTDataSource {
  baseUrl = "";
  get = mockGet;
}

export const RESTDataSource = MockRESTDataSource;
