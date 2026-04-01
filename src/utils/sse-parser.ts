export interface SSEEvent {
  readonly id?: string;
  readonly event?: string;
  readonly data: string;
}

export function createSSEParser(onEvent: (event: SSEEvent) => void) {
  let buffer = "";

  function push(chunk: string): void {
    buffer += chunk;

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const block of parts) {
      const event = parseBlock(block);
      if (event) onEvent(event);
    }
  }

  function flush(): void {
    if (buffer.trim()) {
      const event = parseBlock(buffer);
      if (event) onEvent(event);
    }
    buffer = "";
  }

  return { push, flush };
}

function parseBlock(block: string): SSEEvent | null {
  const lines = block.split("\n");

  let id: string | undefined;
  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith(":")) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const field = line.slice(0, colonIndex);
    const value =
      line[colonIndex + 1] === " " ? line.slice(colonIndex + 2) : line.slice(colonIndex + 1);

    switch (field) {
      case "data":
        dataLines.push(value);
        break;
      case "event":
        event = value;
        break;
      case "id":
        id = value;
        break;
    }
  }

  if (dataLines.length === 0) return null;

  return { id, event, data: dataLines.join("\n") };
}
