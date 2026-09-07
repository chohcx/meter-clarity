export async function withRetries(operation, delayMs = 1_000) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}
