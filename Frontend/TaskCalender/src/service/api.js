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

    const data = await res.json();

    if (!res.ok) {
      // Create a proper error object with response data
      const error = new Error(data.message || "API Error");
      error.response = {
        status: res.status,
        data: data,
      };
      throw error;
    }

    return data;
  } catch (err) {
    // If it's already our custom error, just throw it
    if (err.response) {
      throw err;
    }
    
    // Network error or JSON parse error
    const error = new Error(err.message || "Network error");
    error.response = {
      status: 0,
      data: { message: err.message },
    };
    throw error;
  }
};