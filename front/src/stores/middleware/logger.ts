import type { StateCreator, StoreMutatorIdentifier } from "zustand";

/**
 * Middleware de logging para desenvolvimento.
 *
 * Registra no console cada mutação de estado, mostrando
 * o estado anterior, a ação disparada e o novo estado.
 *
 * Ativado apenas quando `import.meta.env.DEV` é true,
 * garantindo zero overhead em produção.
 *
 * @example
 * ```ts
 * const useMyStore = create<MyState>()(
 *   logger(
 *     (set) => ({ ... }),
 *     "MyStore",
 *   ),
 * );
 * ```
 */
type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(
  f: StateCreator<T, [], []>,
  name?: string,
) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prev = get();
    set(...(args as Parameters<typeof set>));
    const next = get();

    if (import.meta.env.DEV) {
      console.groupCollapsed(
        `%c[Zustand] ${name ?? "store"} — atualização`,
        "color: #2f681f; font-weight: bold;",
      );
      console.log("Estado anterior:", prev);
      console.log("Estado atual:  ", next);
      console.groupEnd();
    }
  };

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;
