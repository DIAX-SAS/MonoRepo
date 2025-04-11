import { PimmsStepUnit } from "../../../app/dashboard/dashboard.types";

global.fetch = jest.fn();

describe("API Service Tests", () => {
  
  const mockAuth = { accessToken: "mock-token" };
  const mockInfoSettings = { initTime: 0, endTime:0, stepUnit: PimmsStepUnit.SECOND};

  beforeAll(() => {
    process.env.NEXT_PUBLIC_API_BASE_PATH = "http://mock-api-base-path.com";
  })
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchData should make a POST request and return data", async () => {
    const mockResponse = { data: "mocked-data" };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const fetchData = (await import("../diax-back")).fetchData;   

    const result = await fetchData(mockAuth, mockInfoSettings);

    expect(fetch).toHaveBeenCalledWith("http://mock-api-base-path.com/api/pimms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-token",
      },
      body: JSON.stringify(mockInfoSettings),
    });

    expect(result).toEqual(mockResponse);
  });

  it("fetchData should throw an error on HTTP failure", async () => {
    const fetchData = (await import("../diax-back")).fetchData; 
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchData(mockAuth, mockInfoSettings)).rejects.toThrow(
      "HTTP error! status: 500"
    );
  });

  it("fetchCredentialsCore should make a GET request and return credentials", async () => {
    const mockCredentials = { username: "test-user", password: "test-pass" };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockCredentials),
    });
    const {fetchCredentialsCore} = (await import("../diax-back"));
    const result = await fetchCredentialsCore(mockAuth);

    expect(fetch).toHaveBeenCalledWith("http://mock-api-base-path.com/api/pimms/credentials", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-token",
      },
    });

    expect(result).toEqual(mockCredentials);
  });

  it("fetchCredentialsCore should throw an error on HTTP failure", async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 403 });
    const {fetchCredentialsCore} = (await import("../diax-back"));
    await expect(fetchCredentialsCore(mockAuth)).rejects.toThrow(
      "HTTP error! status: 403"
    );
  });
});
