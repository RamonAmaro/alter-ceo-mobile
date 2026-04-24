import { create } from "zustand";

import type { PdfUploadSource } from "@/services/pdf-upload-types";
import * as sourceService from "@/services/source-service";
import type { SourceDetailResponse, SourceStatus, SourceSummaryItem } from "@/types/source";
import { createPoller } from "@/utils/create-poller";
import { toErrorMessage } from "@/utils/to-error-message";

type UploadStage = "uploading" | "processing" | "ready" | "failed";

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 90; // ~6 min — backend allows up to 300-page PDFs.
const LIST_LIMIT = 50;

function isTerminalStatus(status: SourceStatus | string | null | undefined): boolean {
  return status === "ready" || status === "failed";
}

function isInProgressStatus(status: SourceStatus | string | null | undefined): boolean {
  return status === "pending" || status === "processing";
}

function summaryFromDetail(detail: SourceDetailResponse): SourceSummaryItem {
  return {
    source_id: detail.source_id,
    source_type: detail.source_type,
    status: detail.status,
    title: detail.title ?? null,
    filename: detail.filename ?? null,
    created_at: detail.created_at ?? null,
    updated_at: detail.updated_at ?? null,
  };
}

function upsertSummary(items: SourceSummaryItem[], next: SourceSummaryItem): SourceSummaryItem[] {
  const index = items.findIndex((item) => item.source_id === next.source_id);
  if (index === -1) return [next, ...items];
  const copy = items.slice();
  copy[index] = { ...copy[index], ...next };
  return copy;
}

// Merge backend list with local state, preserving any local items the backend
// hasn't returned yet (typical when an upload just 202'd — the /sources/me
// query may not see it for a few seconds). Backend wins for items it returned.
function mergePdfLists(
  current: SourceSummaryItem[],
  fromBackend: SourceSummaryItem[],
): SourceSummaryItem[] {
  const backendIds = new Set(fromBackend.map((item) => item.source_id));
  const localOnly = current.filter((item) => !backendIds.has(item.source_id));
  return [...fromBackend, ...localOnly];
}

interface UploadProgress {
  source_id: string;
  filename: string;
  stage: UploadStage;
  error?: string;
}

interface SourcesState {
  pdfs: SourceSummaryItem[];
  isLoading: boolean;
  listError: string | null;
  uploadProgress: UploadProgress | null;
  activeSource: SourceDetailResponse | null;
  isDetailLoading: boolean;
  detailError: string | null;
  _uploadPoller: { stop: () => void } | null;
  _detailPoller: { stop: () => void } | null;
  _loadedForUserId: string | null;

  ensurePdfsLoaded: (userId: string, companyName?: string) => Promise<void>;
  refreshPdfs: (userId: string, companyName?: string) => Promise<void>;
  uploadPdf: (params: {
    userId: string;
    companyName?: string;
    file: PdfUploadSource;
    title?: string;
  }) => Promise<void>;
  loadSourceDetail: (sourceId: string) => Promise<void>;
  stopDetailPolling: () => void;
  dismissUploadProgress: () => void;
  reset: () => void;
}

async function fetchAndStorePdfs(
  userId: string,
  companyName: string | undefined,
  set: (partial: Partial<SourcesState>) => void,
  get: () => SourcesState,
): Promise<void> {
  set({ isLoading: true, listError: null });
  try {
    const response = await sourceService.listSources({
      userId,
      companyName,
      sourceType: "pdf",
      limit: LIST_LIMIT,
    });
    const backendItems = response.items ?? [];
    set({
      pdfs: mergePdfLists(get().pdfs, backendItems),
      isLoading: false,
      _loadedForUserId: userId,
    });
  } catch (err) {
    set({ listError: toErrorMessage(err), isLoading: false });
  }
}

export const useSourcesStore = create<SourcesState>((set, get) => ({
  pdfs: [],
  isLoading: false,
  listError: null,
  uploadProgress: null,
  activeSource: null,
  isDetailLoading: false,
  detailError: null,
  _uploadPoller: null,
  _detailPoller: null,
  _loadedForUserId: null,

  ensurePdfsLoaded: async (userId, companyName) => {
    const { _loadedForUserId, isLoading } = get();
    // Already loaded for this user, or a load is already in flight — no-op.
    // Prevents the history page from refetching every time it remounts
    // (tab switch, resize, Strict Mode double-render).
    if (isLoading) return;
    if (_loadedForUserId === userId) return;
    await fetchAndStorePdfs(userId, companyName, set, get);
  },

  refreshPdfs: async (userId, companyName) => {
    await fetchAndStorePdfs(userId, companyName, set, get);
  },

  uploadPdf: async ({ userId, companyName, file, title }) => {
    get()._uploadPoller?.stop();
    set({
      _uploadPoller: null,
      uploadProgress: {
        source_id: "",
        filename: file.name,
        stage: "uploading",
      },
    });

    let sourceId: string;
    try {
      const accepted = await sourceService.uploadPdfSource({
        userId,
        companyName,
        title,
        file,
      });
      sourceId = accepted.source_id;
      set((state) => ({
        uploadProgress: {
          source_id: sourceId,
          filename: accepted.filename,
          stage: "processing",
        },
        pdfs: upsertSummary(state.pdfs, {
          source_id: sourceId,
          source_type: "pdf",
          status: accepted.status,
          title: accepted.title ?? null,
          filename: accepted.filename,
          created_at: new Date().toISOString(),
        }),
      }));
    } catch (err) {
      set({
        uploadProgress: {
          source_id: "",
          filename: file.name,
          stage: "failed",
          error: toErrorMessage(err),
        },
      });
      return;
    }

    let attempts = 0;
    const poller = createPoller({
      fn: () => sourceService.getSourceDetail(sourceId),
      interval: POLL_INTERVAL_MS,
      shouldStop: (detail) => {
        attempts += 1;
        if (isTerminalStatus(detail.status)) return true;
        return attempts >= POLL_MAX_ATTEMPTS;
      },
      onUpdate: (detail) => {
        set((state) => ({ pdfs: upsertSummary(state.pdfs, summaryFromDetail(detail)) }));

        if (isTerminalStatus(detail.status)) {
          set({
            _uploadPoller: null,
            uploadProgress: {
              source_id: detail.source_id,
              filename: detail.filename ?? "",
              stage: detail.status === "ready" ? "ready" : "failed",
              error: detail.error_message ?? undefined,
            },
          });
          return;
        }

        if (attempts >= POLL_MAX_ATTEMPTS) {
          set({
            _uploadPoller: null,
            uploadProgress: {
              source_id: detail.source_id,
              filename: detail.filename ?? "",
              stage: "failed",
              error: "Tiempo de procesamiento excedido",
            },
          });
        }
      },
      onError: (err) => {
        set({
          _uploadPoller: null,
          uploadProgress: {
            source_id: sourceId,
            filename: file.name,
            stage: "failed",
            error: toErrorMessage(err),
          },
        });
      },
    });

    set({ _uploadPoller: poller });
    poller.start();
  },

  loadSourceDetail: async (sourceId) => {
    // Switching to a new source: drop the old polling + clear stale data.
    get()._detailPoller?.stop();
    const { activeSource } = get();
    set({
      _detailPoller: null,
      isDetailLoading: true,
      detailError: null,
      // Only null out activeSource if we're switching to a different one,
      // so the previous data doesn't flash empty while we refetch the same id.
      activeSource: activeSource?.source_id === sourceId ? activeSource : null,
    });

    let initialDetail: SourceDetailResponse;
    try {
      initialDetail = await sourceService.getSourceDetail(sourceId);
      set((state) => ({
        activeSource: initialDetail,
        isDetailLoading: false,
        pdfs: upsertSummary(state.pdfs, summaryFromDetail(initialDetail)),
      }));
    } catch (err) {
      set({
        activeSource: null,
        isDetailLoading: false,
        detailError: toErrorMessage(err),
      });
      return;
    }

    if (!isInProgressStatus(initialDetail.status)) return;

    // Still processing — keep polling until the source becomes terminal so
    // the detail screen updates in place.
    let attempts = 0;
    const poller = createPoller({
      fn: () => sourceService.getSourceDetail(sourceId),
      interval: POLL_INTERVAL_MS,
      shouldStop: (detail) => {
        attempts += 1;
        if (isTerminalStatus(detail.status)) return true;
        return attempts >= POLL_MAX_ATTEMPTS;
      },
      onUpdate: (detail) => {
        set((state) => ({
          activeSource: detail,
          pdfs: upsertSummary(state.pdfs, summaryFromDetail(detail)),
        }));
        if (isTerminalStatus(detail.status)) {
          set({ _detailPoller: null });
        }
      },
      onError: () => {
        // Keep current activeSource; a single failed poll shouldn't blank the
        // screen. Stop so we don't loop on a persistent backend error.
        set({ _detailPoller: null });
      },
    });

    set({ _detailPoller: poller });
    poller.start();
  },

  stopDetailPolling: () => {
    get()._detailPoller?.stop();
    set({ _detailPoller: null });
  },

  dismissUploadProgress: () => {
    set({ uploadProgress: null });
  },

  reset: () => {
    get()._uploadPoller?.stop();
    get()._detailPoller?.stop();
    set({
      pdfs: [],
      isLoading: false,
      listError: null,
      uploadProgress: null,
      activeSource: null,
      isDetailLoading: false,
      detailError: null,
      _uploadPoller: null,
      _detailPoller: null,
      _loadedForUserId: null,
    });
  },
}));
