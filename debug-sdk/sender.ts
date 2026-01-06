
type SendEvent = {
  type: string;
  payload: unknown;
};

export function safeSend(event: SendEvent): void {
  try {
    // async fire-and-forget
    void fetch(process.env.DEBUG_API_URL + "/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    }).catch(() => {
      // swallow network errors
    });
  } catch {
    // swallow everything
  }
}
