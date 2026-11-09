/**
 * Tipos utilitários compartilhados entre todas as stores.
 *
 * Centraliza as interfaces de estado assíncrono para garantir
 * consistência e evitar duplicação em cada store.
 */

// ─── Estado assíncrono padronizado ───────────────────────────────
/**
 * Representa o estado de qualquer operação assíncrona (fetch, mutação).
 * Cada store que lida com dados remotos deve compor este tipo
 * para garantir tratamento uniforme de loading/error/data.
 */
export interface AsyncSlice<T> {
  /** Dados retornados pela operação. */
  data: T;
  /** Indica se a operação está em andamento. */
  isLoading: boolean;
  /** Mensagem de erro da última operação. Null = sem erro. */
  error: string | null;
  /** Timestamp Unix (ms) da última atualização com sucesso. */
  lastFetchedAt: number | null;
}

/**
 * Cria um estado assíncrono com valores iniciais padrão.
 *
 * @example
 * ```ts
 * interface MyState {
 *   items: AsyncSlice<Item[]>;
 * }
 *
 * const initialState: MyState = {
 *   items: createAsyncSlice([]),
 * };
 * ```
 */
export function createAsyncSlice<T>(initialData: T): AsyncSlice<T> {
  return {
    data: initialData,
    isLoading: false,
    error: null,
    lastFetchedAt: null,
  };
}

// ─── Helpers de atualização ──────────────────────────────────────

/** Retorna o slice marcado como "carregando". */
export function setLoading<T>(slice: AsyncSlice<T>): AsyncSlice<T> {
  return { ...slice, isLoading: true, error: null };
}

/** Retorna o slice com dados atualizados e loading encerrado. */
export function setData<T>(slice: AsyncSlice<T>, data: T): AsyncSlice<T> {
  return { ...slice, data, isLoading: false, error: null, lastFetchedAt: Date.now() };
}

/** Retorna o slice com erro e loading encerrado. */
export function setError<T>(slice: AsyncSlice<T>, error: string): AsyncSlice<T> {
  return { ...slice, isLoading: false, error };
}

// ─── Stale-while-revalidate ──────────────────────────────────────

/** Duração padrão de cache: 2 minutos. */
const DEFAULT_STALE_MS = 2 * 60 * 1000;

/**
 * Verifica se os dados do slice estão "frescos" (dentro do TTL).
 * Útil para evitar refetch desnecessário.
 *
 * @param slice - O slice assíncrono a verificar.
 * @param ttlMs - Tempo de vida em milissegundos (padrão: 2 min).
 */
export function isFresh<T>(slice: AsyncSlice<T>, ttlMs: number = DEFAULT_STALE_MS): boolean {
  if (slice.lastFetchedAt === null) return false;
  return Date.now() - slice.lastFetchedAt < ttlMs;
}
