export async function apiFetch(endpoint) {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    console.log(data);

    if (!data.success) {
      // Standardized error from backend
      throw new Error(data.message || "Unknown error");
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}