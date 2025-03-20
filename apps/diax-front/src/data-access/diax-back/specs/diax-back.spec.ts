import { fetchData, fetchCredentialsCore } from "../diax-back"; // Adjust path as needed
import { config } from "../../../config";

jest.mock("../../../config", () => ({
  config: { backendURL: "https://mock-api.com" },
}));

global.fetch = jest.fn();

describe("API Service Tests", () => {
  const mockAuth = { accessToken: "mock-token" };
  const mockInfoSettings = { key: "value" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchData should make a POST request and return data", async () => {
    const mockResponse = { data: "mocked-data" };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await fetchData(mockAuth, mockInfoSettings);

    expect(fetch).toHaveBeenCalledWith("https://mock-api.com/pimms", {
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

    const result = await fetchCredentialsCore(mockAuth);

    expect(fetch).toHaveBeenCalledWith("https://mock-api.com/pimms/credentials", {
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

    await expect(fetchCredentialsCore(mockAuth)).rejects.toThrow(
      "HTTP error! status: 403"
    );
  });
});
