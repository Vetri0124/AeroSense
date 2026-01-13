import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use absolute URL in production if the URL is relative
  const baseUrl = (import.meta.env.VITE_API_URL || "https://aerosense-2.onrender.com").replace(/\/$/, "");
  const targetUrl = url.startsWith("http") ? url : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;

  const token = localStorage.getItem("token");
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(targetUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const baseUrl = (import.meta.env.VITE_API_URL || "https://aerosense-2.onrender.com").replace(/\/$/, "");
      const path = queryKey.join("/");
      const targetUrl = path.startsWith("http") ? path : `${baseUrl}/${path.startsWith("/") ? path.substring(1) : path}`;

      const token = localStorage.getItem("token");
      const fetchHeaders: Record<string, string> = {};

      if (token) {
        fetchHeaders["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(targetUrl, {
        headers: fetchHeaders,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
