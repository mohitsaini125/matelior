export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function classifyOrderTimeline(status: string) {
  const stages = ["confirmed", "packed", "shipped", "delivered"];
  const currentIndex = stages.indexOf(status);
  return stages.map((stage, i) => ({
    stage,
    completed: currentIndex >= 0 && i <= currentIndex,
  }));
}
