import type { ApiResponse } from "@vibecode/shared";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

type TokenGetter = () => Promise<string | null>;

let _getToken: TokenGetter | null = null;
let _baseUrl = "";

export const configureApi = (getToken: TokenGetter, baseUrl: string) => {
  _getToken = getToken;
  _baseUrl = baseUrl;
};

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (_getToken) {
    const token = await _getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const throwApiError = (
  payload: ApiResponse<unknown>,
  status: number,
): never => {
  const error = payload.error;

  throw new ApiError(
    error?.code ?? "UNKNOWN",
    error?.message ?? "An unexpected error occurred",
    status,
  );
};

const request = async <T>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<T> => {
  const response = await fetch(`${_baseUrl}${endpoint}`, {
    method,
    headers: await buildHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throwApiError(data, response.status);
  }

  return data.data as T;
};

export const api = {
  get: <T>(endpoint: string) => request<T>("GET", endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>("PUT", endpoint, body),
  delete: <T>(endpoint: string) => request<T>("DELETE", endpoint),
};

export const apiRaw = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${_baseUrl}${endpoint}`, {
      method: "GET",
      headers: await buildHeaders(),
    });

    const data = (await response.json()) as ApiResponse<unknown>;

    if (!response.ok || data.success === false) {
      throwApiError(data, response.status);
    }

    return data as T;
  },
};
