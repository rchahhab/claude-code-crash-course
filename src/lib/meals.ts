const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string): boolean {
  return DATE_RE.test(value) && !Number.isNaN(Date.parse(value));
}

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}
