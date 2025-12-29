const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export const apiRequest = async (url, method = "GET", body) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
    }

    // ✅ SAFE RESPONSE PARSING
    const contentType = res.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text || "Request failed" };
    }

    if (!res.ok) {
      const error = new Error(data.message || "API Error");
      error.response = {
        status: res.status,
        data,
      };
      throw error;
    }

    return data;
  } catch (err) {
    // Preserve structured errors
    if (err.response) {
      throw err;
    }

    // Network / parsing error
    const error = new Error(err.message || "Network error");
    error.response = {
      status: 0,
      data: { message: error.message },
    };
    throw error;
  }
};
