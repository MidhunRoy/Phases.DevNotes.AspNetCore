const notesContainer = document.getElementById("notes");
const noteForm = document.getElementById("note-form");
const searchInput = document.getElementById("search");
const typeFilterInput = document.getElementById("filter-type");
const userFilterInput = document.getElementById("filter-user");
const sortOrderInput = document.getElementById("sort-order");
const statusElement = document.getElementById("status");
const notesSummaryElement = document.getElementById("notes-summary");
const submitButton = document.getElementById("submit-btn");
const cancelEditButton = document.getElementById("cancel-edit-btn");
const descriptionEditor = document.getElementById("description-editor");
const titleInput = document.getElementById("title");
const typeInput = document.getElementById("type");
const tagsInput = document.getElementById("tags");
const createdByInput = document.getElementById("created-by");
const attachmentInput = document.getElementById("attachment");
const codeFilePathInput = document.getElementById("code-file-path");
const codeMethodNameInput = document.getElementById("code-method-name");
const codeLineNumberInput = document.getElementById("code-line-number");
const codeFilePathSuggestions = document.getElementById("code-file-path-suggestions");
const exportButton = document.getElementById("export-btn");
const importButton = document.getElementById("import-btn");
const importModal = document.getElementById("import-modal");
const importForm = document.getElementById("import-form");
const importFileInput = document.getElementById("import-file");
const importSubmitButton = document.getElementById("import-submit-btn");
const importCancelButton = document.getElementById("import-cancel-btn");
const importModalCloseButton = document.getElementById("import-modal-close");
const scanProjectButton = document.getElementById("scan-project-btn");
const scanModal = document.getElementById("scan-modal");
const scanModalCloseButton = document.getElementById("scan-modal-close");
const scanCancelButton = document.getElementById("scan-cancel-btn");
const scanImportButton = document.getElementById("scan-import-btn");
const scanSummaryElement = document.getElementById("scan-summary");
const scanWarningElement = document.getElementById("scan-warning");
const scanResultsElement = document.getElementById("scan-results");
const themeToggleButton = document.getElementById("theme-toggle");
const previousPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");
const addNoteButton = document.getElementById("add-note-btn");
const codeGuideAddNoteButton = document.getElementById("code-guide-add-note-btn");
const codeGuideExportButton = document.getElementById("code-guide-export-btn");
const codeGuideHelpButton = document.getElementById("code-guide-help-btn");
const guideHelpModal = document.getElementById("guide-help-modal");
const guideHelpCloseButton = document.getElementById("guide-help-close");
const guideHelpCloseActionButton = document.getElementById("guide-help-close-btn");
const guideHelpScanButton = document.getElementById("guide-help-scan-btn");
const codeGuideExportModal = document.getElementById("code-guide-export-modal");
const codeGuideExportForm = document.getElementById("code-guide-export-form");
const codeGuideExportCloseButton = document.getElementById("code-guide-export-close");
const codeGuideExportCancelButton = document.getElementById("code-guide-export-cancel");
const codeGuideExportSubmitButton = document.getElementById("code-guide-export-submit");
const codeGuideExportFilesPanel = document.getElementById("code-guide-export-files-panel");
const codeGuideExportFiles = document.getElementById("code-guide-export-files");
const codeGuideExportHint = document.getElementById("code-guide-export-hint");
const quickAddNoteFab = document.getElementById("quick-add-note-fab");
const noteModal = document.getElementById("note-modal");
const noteModalContent = noteModal?.querySelector("[data-modal-content]") ?? null;
const modalCloseButton = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescriptionTitle = document.getElementById("modal-description-title");
const modalDescription = document.getElementById("modal-description");
const modalMetadataTitle = document.getElementById("modal-metadata-title");
const modalType = document.getElementById("modal-type");
const modalTags = document.getElementById("modal-tags");
const modalCreatedBy = document.getElementById("modal-created-by");
const modalCreated = document.getElementById("modal-created");
const modalAttachmentsSection = document.getElementById("modal-attachments-section");
const modalAttachment = document.getElementById("modal-attachment");
const modalCodeReferenceSection = document.getElementById("modal-code-reference-section");
const modalCodeReferenceTitle = document.getElementById("modal-code-reference-title");
const modalCodeFile = document.getElementById("modal-code-file");
const modalCodeMethod = document.getElementById("modal-code-method");
const modalCodeLine = document.getElementById("modal-code-line");
const modalViewCodeButton = document.getElementById("modal-view-code-btn");
const modalCodeGuideActions = document.getElementById("modal-code-guide-actions");
const modalEditButton = document.getElementById("modal-edit-btn");
const modalCloseActionButton = document.getElementById("modal-close-action-btn");
const modalGuideLearning = document.getElementById("modal-guide-learning");
const modalGuideSections = document.getElementById("modal-guide-sections");
const modalGuideWhereBlock = document.getElementById("modal-guide-where-block");
const modalGuideWhere = document.getElementById("modal-guide-where");
const modalGuideMethodBlock = document.getElementById("modal-guide-method-block");
const modalGuideMethod = document.getElementById("modal-guide-method");
const modalGuideTagsBlock = document.getElementById("modal-guide-tags-block");
const modalGuideTags = document.getElementById("modal-guide-tags");
const modalGuideSecondary = document.getElementById("modal-guide-secondary");
const modalGuideSecondaryType = document.getElementById("modal-guide-secondary-type");
const modalGuideSecondaryCreatedBy = document.getElementById("modal-guide-secondary-created-by");
const modalGuideSecondaryCreated = document.getElementById("modal-guide-secondary-created");
const notesOnlyModalSections = Array.from(document.querySelectorAll("[data-notes-only-section]"));
const guideCardPreviewMax = 160;
const codePreviewModal = document.getElementById("code-preview-modal");
const codePreviewTitle = document.getElementById("code-preview-title");
const codePreviewCloseButton = document.getElementById("code-preview-close");
const codePreviewOpenVscodeLink = document.getElementById("code-preview-open-vscode");
const codePreviewCopyButton = document.getElementById("code-preview-copy");
const codePreviewStatus = document.getElementById("code-preview-status");
const codePreviewBody = document.getElementById("code-preview-body");
const codePreviewCode = document.getElementById("code-preview-code");
const composerModal = document.getElementById("composer-modal");
const composerCloseButton = document.getElementById("composer-close-btn");
const composerTitle = document.getElementById("composer-title");
const dashboardRoot = document.querySelector(".dashboard");
const modeNotesBtn = document.getElementById("mode-notes-btn");
const modeCodeGuideBtn = document.getElementById("mode-code-guide-btn");
const notesModeHeader = document.getElementById("notes-mode-header");
const codeGuideModeHeader = document.getElementById("code-guide-mode-header");
const notesModeFilters = document.getElementById("notes-mode-filters");
const codeGuideModeFilters = document.getElementById("code-guide-mode-filters");
const notesModeSummary = document.getElementById("notes-mode-summary");
const codeGuideModeSummary = document.getElementById("code-guide-mode-summary");
const notesModeStats = document.getElementById("notes-mode-stats");
const notesPagination = document.getElementById("notes-pagination");
const guideSearchInput = document.getElementById("guide-search");
const guideSearchClearButton = document.getElementById("guide-search-clear");
const guideFilterFile = document.getElementById("guide-filter-file");
const guideFilterConcept = document.getElementById("guide-filter-concept");
const guideFilterTag = document.getElementById("guide-filter-tag");
const guideClearFiltersButton = document.getElementById("guide-clear-filters");
const guideMoreFiltersButton = document.getElementById("guide-more-filters-btn");
const guideMoreFiltersPanel = document.getElementById("guide-more-filters");
const guideSummaryElement = document.getElementById("guide-summary");
const guideUiStateStorageKey = "devnotes_code_guide_ui_state";
const statTotal = document.getElementById("stat-total");
const statBugs = document.getElementById("stat-bugs");
const statTasks = document.getElementById("stat-tasks");
const statIdeas = document.getElementById("stat-ideas");
const statContributors = document.getElementById("stat-contributors");
const statLastUpdated = document.getElementById("stat-last-updated");
const statValueElements = [statTotal, statBugs, statTasks, statIdeas, statContributors, statLastUpdated].filter(Boolean);
const statFilterPills = Array.from(document.querySelectorAll("[data-stat-filter]"));
const fabRevealScrollY = 200;
const MODE_NOTES = "notes";
const MODE_CODE_GUIDE = "code-guide";
const guideFetchPageSize = 100;

const NOTE_TYPE_META = {
    bug: { icon: "\uD83D\uDC1E", label: "Bug" },
    task: { icon: "\u2713", label: "Task" },
    idea: { icon: "\uD83D\uDCA1", label: "Idea" },
    code: { icon: "\uD83D\uDD39", label: "Code" }
};

const themeStorageKey = "dev-notes-theme";
const darkTheme = "dark";
const lightTheme = "light";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const blockedDescriptionTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED", "META", "LINK", "BASE"]);
const apiTimeoutMs = 10000;
let scanResults = [];
let scanFetchController = null;
const searchDebounceMs = 300;
const fileSuggestionDebounceMs = 180;
const minFileSuggestionChars = 1;
const createdByStorageKey = "devnotes_user_override";
const defaultCreatedByFallback = "Unknown";

let allNotes = [];
let renderedNotes = [];
let editingNoteId = null;
let editingAttachments = [];
/** @type {File[]} Accumulated files for the composer; file input replaces each pick unless we merge here. */
let composerPendingFiles = [];
let renderSignature = "";
let activeFetchId = 0;
let currentPage = 1;
const pageSize = 10;
let totalNotes = 0;
let lastFocusedElement = null;
let imageZoomOverlay = null;
let imageLightboxReturnFocus = null;
let imageZoomCloseTimerId = 0;
let statusResetTimer = 0;
let notesFetchController = null;
let fileSuggestionsFetchController = null;
let lastFileSuggestionQuery = "";
let notesSurfaceReady = false;
let lastSummaryText = "";
let lastPaginationKey = "";
let lastComposerFocusedElement = null;
let configDefaultCreatedBy = "";
let createdByManuallyEdited = false;
let activeStatsFetchId = 0;
let statsFetchController = null;
let activeModalNote = null;
let activeCodePreviewPayload = null;
let lastImportModalFocusedElement = null;
let dashboardMode = MODE_NOTES;
let codeGuideSourceNotes = [];
let codeGuideSurfaceReady = false;
let guideModalPresentation = false;
let activeGuideFetchId = 0;
let guideFetchController = null;
let lastGuideSummaryText = "";
let lastGuideRenderSignature = "";
/** @type {Record<string, boolean>} */
let guideCollapsedFiles = {};
let guideMoreFiltersOpen = false;
/** Currently selected Code Guide annotation id (for Code Map / card highlight). */
let selectedGuideNoteId = "";

function getPreferredTheme() {
    const stored = localStorage.getItem(themeStorageKey);
    if (stored === darkTheme || stored === lightTheme) {
        return stored;
    }

    return systemThemeQuery.matches ? darkTheme : lightTheme;
}

function applyTheme(theme) {
    const currentTheme = theme === darkTheme ? darkTheme : lightTheme;
    document.documentElement.dataset.theme = currentTheme;

    if (themeToggleButton) {
        themeToggleButton.textContent = currentTheme === darkTheme ? "Light mode" : "Dark mode";
        themeToggleButton.setAttribute("aria-pressed", String(currentTheme === darkTheme));
    }
}

function initializeTheme() {
    applyTheme(getPreferredTheme());

    if (!themeToggleButton) {
        return;
    }

    themeToggleButton.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === darkTheme ? lightTheme : darkTheme;
        localStorage.setItem(themeStorageKey, nextTheme);
        applyTheme(nextTheme);
    });

    systemThemeQuery.addEventListener("change", (event) => {
        if (localStorage.getItem(themeStorageKey)) {
            return;
        }

        applyTheme(event.matches ? darkTheme : lightTheme);
    });
}

async function apiRequest(url, options = {}) {
    const { signal: externalSignal, ...fetchOptions } = options;
    const controller = new AbortController();
    /** @type {"timeout" | "caller" | null} */
    let abortReason = null;

    const timeoutId = window.setTimeout(() => {
        abortReason = "timeout";
        controller.abort();
    }, apiTimeoutMs);

    const onExternalAbort = () => {
        abortReason = "caller";
        controller.abort();
    };

    if (externalSignal) {
        if (externalSignal.aborted) {
            abortReason = "caller";
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", onExternalAbort, { once: true });
        }
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });

        let payload = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            payload = await response.json();
        } else {
            const text = await response.text();
            payload = text ? { message: text } : null;
        }

        if (!response.ok) {
            const message = payload && typeof payload === "object" && "error" in payload
                ? String(payload.error)
                : "Request failed.";
            throw new Error(message);
        }

        return payload;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            if (abortReason === "caller") {
                throw error;
            }

            throw new Error("Request timed out.");
        }

        throw error instanceof Error ? error : new Error("Unexpected error.");
    } finally {
        window.clearTimeout(timeoutId);
        externalSignal?.removeEventListener("abort", onExternalAbort);
    }
}

function getSavedCreatedBy() {
    return String(localStorage.getItem(createdByStorageKey) || "").trim();
}

function getConfigCreatedBy() {
    return String(configDefaultCreatedBy || "").trim();
}

function resolveCreatedBy(inputValue = "") {
    const explicitValue = String(inputValue || "").trim();
    if (explicitValue) {
        return explicitValue;
    }

    const configValue = getConfigCreatedBy();
    if (configValue) {
        return configValue;
    }

    const savedValue = getSavedCreatedBy();
    if (savedValue) {
        return savedValue;
    }

    return defaultCreatedByFallback;
}

function getCreatedBy() {
    return resolveCreatedBy();
}

async function loadClientConfig() {
    try {
        const payload = await apiRequest("/devnotes/config");
        configDefaultCreatedBy = String(payload?.defaultCreatedBy || "").trim();
        if (createdByInput && !createdByManuallyEdited && configDefaultCreatedBy) {
            createdByInput.value = configDefaultCreatedBy;
        }
    } catch {
        configDefaultCreatedBy = "";
    }
}

function setStatsLoadingState(isLoading) {
    for (const element of statValueElements) {
        const pill = element.closest(".stat-pill");
        if (isLoading) {
            element.textContent = "-";
            pill?.classList.add("stat-pill--loading");
        } else {
            pill?.classList.remove("stat-pill--loading");
        }
    }
}

function syncStatFilterActiveState() {
    const activeType = (typeFilterInput?.value || "all").trim().toLowerCase();
    for (const pill of statFilterPills) {
        const filter = String(pill.dataset.statFilter || "all").toLowerCase();
        const isActive = filter === activeType || (filter === "all" && activeType === "all");
        pill.classList.toggle("stat-pill--active", isActive);
        pill.setAttribute("aria-pressed", String(isActive));
    }
}

function applyTypeFilterFromStat(filterValue) {
    if (!typeFilterInput) {
        return;
    }

    const nextValue = String(filterValue || "all").toLowerCase();
    const allowed = new Set(["all", "bug", "task", "idea", "code"]);
    typeFilterInput.value = allowed.has(nextValue) ? nextValue : "all";
    syncStatFilterActiveState();
    currentPage = 1;
    void loadNotes({ soft: true });
}

function applyStatistics(payload) {
    if (!payload || typeof payload !== "object") {
        return;
    }

    const byType = payload.byType && typeof payload.byType === "object" ? payload.byType : {};
    if (statTotal) {
        statTotal.textContent = String(Number(payload.totalNotes) || 0);
    }
    if (statBugs) {
        statBugs.textContent = String(Number(byType.bug) || 0);
    }
    if (statTasks) {
        statTasks.textContent = String(Number(byType.task) || 0);
    }
    if (statIdeas) {
        statIdeas.textContent = String(Number(byType.idea) || 0);
    }
    if (statContributors) {
        statContributors.textContent = String(Number(payload.contributors) || 0);
    }
    if (statLastUpdated) {
        const lastUpdated = payload.recentActivity?.lastUpdated;
        statLastUpdated.textContent = lastUpdated ? formatRelativeTime(lastUpdated) : "Never";
    }
}

function formatExactDateTime(isoValue) {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function formatRelativeTime(isoValue) {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) {
        return diffSeconds <= 1 ? "Just now" : `${diffSeconds} seconds ago`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24 && startOfDate.getTime() === startOfToday.getTime()) {
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    }

    if (startOfDate.getTime() === startOfYesterday.getTime()) {
        return "Yesterday";
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    }

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function getNoteTypeKey(type) {
    const key = String(type || "").trim().toLowerCase();
    return NOTE_TYPE_META[key] ? key : "";
}

function formatTypeLabel(type) {
    const key = getNoteTypeKey(type);
    if (!key) {
        const raw = String(type || "").trim();
        return raw || "";
    }

    const meta = NOTE_TYPE_META[key];
    return `${meta.icon} ${meta.label}`;
}

function renderTypeBadge(type, { className = "note-type-badge" } = {}) {
    const key = getNoteTypeKey(type);
    if (!key) {
        return "";
    }

    const meta = NOTE_TYPE_META[key];
    const label = `${meta.icon} ${meta.label}`;
    return `<span class="${className} ${className}--${key}">${escapeHtml(label)}</span>`;
}

function formatUserDisplayName(rawValue) {
    let value = String(rawValue || "").trim();
    if (!value) {
        return defaultCreatedByFallback;
    }

    value = value.replace(/\s*<[^>]+>\s*/g, " ").trim();
    const emailMatch = value.match(/^([^@\s]+)@/);
    if (emailMatch) {
        const localPart = emailMatch[1];
        return localPart
            .split(/[._-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");
    }

    if (value.includes("@")) {
        return value.split("@")[0];
    }

    return value;
}

async function loadStatistics() {
    if (statValueElements.length === 0) {
        return;
    }

    const fetchId = ++activeStatsFetchId;
    statsFetchController?.abort();
    const fetchController = new AbortController();
    statsFetchController = fetchController;

    setStatsLoadingState(true);

    try {
        const response = await fetch("/devnotes/stats", {
            signal: fetchController.signal,
            headers: { Accept: "application/json" }
        });

        if (fetchId !== activeStatsFetchId) {
            return;
        }

        let payload = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            payload = await response.json();
        }

        if (!response.ok) {
            return;
        }

        applyStatistics(payload);
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }
    } finally {
        if (fetchId === activeStatsFetchId) {
            setStatsLoadingState(false);
            if (statsFetchController === fetchController) {
                statsFetchController = null;
            }
        }
    }
}

function getCreatedByForSubmit() {
    const inputValue = String(createdByInput?.value || "").trim();
    if (createdByManuallyEdited && inputValue) {
        return inputValue;
    }

    return resolveCreatedBy(inputValue);
}

function getCreatedByForDisplay(value) {
    const noteValue = String(value || "").trim();
    if (noteValue) {
        return noteValue;
    }

    return resolveCreatedBy();
}

function persistCreatedByOverride(rawValue) {
    const overrideValue = String(rawValue || "").trim();
    if (overrideValue) {
        localStorage.setItem(createdByStorageKey, overrideValue);
    } else {
        localStorage.removeItem(createdByStorageKey);
    }
}

function debounce(fn, delayMs) {
    let timerId = 0;

    return (...args) => {
        if (timerId) {
            window.clearTimeout(timerId);
        }

        timerId = window.setTimeout(() => {
            fn(...args);
        }, delayMs);
    };
}

function setLoadingState(isLoading, { soft = false } = {}) {
    notesContainer.setAttribute("aria-busy", String(isLoading));
    if (searchInput) {
        searchInput.disabled = isLoading && !soft;
    }
    if (typeFilterInput) {
        typeFilterInput.disabled = isLoading && !soft;
    }
    if (userFilterInput) {
        userFilterInput.disabled = isLoading && !soft;
    }
    if (sortOrderInput) {
        sortOrderInput.disabled = isLoading && !soft;
    }
    if (guideSearchInput) {
        guideSearchInput.disabled = isLoading && !soft;
    }
    if (guideSearchClearButton) {
        guideSearchClearButton.disabled = isLoading && !soft;
    }
    if (guideFilterFile) {
        guideFilterFile.disabled = isLoading && !soft;
    }
    if (guideFilterConcept) {
        guideFilterConcept.disabled = isLoading && !soft;
    }
    if (guideFilterTag) {
        guideFilterTag.disabled = isLoading && !soft;
    }
    if (guideClearFiltersButton) {
        guideClearFiltersButton.disabled = isLoading && !soft;
    }
    if (guideMoreFiltersButton) {
        guideMoreFiltersButton.disabled = isLoading && !soft;
    }
    notesContainer.classList.toggle("notes-loading", isLoading && soft);

    if (isLoading && !soft) {
        notesContainer.innerHTML = `
            <div class="loading-indicator" role="status" aria-live="polite">
                <span class="spinner" aria-hidden="true"></span>
                <span>${isCodeGuideMode() ? "Loading Code Guide..." : "Loading notes..."}</span>
            </div>
        `;
    }

    if (!isLoading) {
        notesContainer.classList.remove("notes-loading");
    }
}

/**
 * @param {{ soft?: boolean }} [options]
 */
async function loadNotes(options = {}) {
    const soft = Boolean(options.soft) && notesSurfaceReady;
    const fetchId = ++activeFetchId;

    notesFetchController?.abort();
    const fetchController = new AbortController();
    notesFetchController = fetchController;

    setLoadingState(true, { soft });
    if (previousPageButton) {
        previousPageButton.disabled = true;
    }
    if (nextPageButton) {
        nextPageButton.disabled = true;
    }
    if (!soft) {
        setStatus("Loading notes...");
    }

    try {
        const search = searchInput.value.trim();
        const type = (typeFilterInput?.value || "all").trim();
        const sort = (sortOrderInput?.value || "newest").trim();
        let attemptPage = currentPage;

        for (let clampPass = 0; clampPass < 2; clampPass += 1) {
            const query = new URLSearchParams({
                page: String(attemptPage),
                pageSize: String(pageSize),
                search,
                type,
                sort
            });
            const response = await apiRequest(`/devnotes/api?${query.toString()}`, {
                signal: fetchController.signal
            });

            if (fetchId !== activeFetchId) {
                return;
            }

            if (Array.isArray(response)) {
                allNotes = response.slice().reverse();
                totalNotes = allNotes.length;
            } else {
                const items = Array.isArray(response?.items) ? response.items : [];
                allNotes = items;
                totalNotes = Number.isFinite(response?.total) ? response.total : items.length;
            }

            const totalPages = Math.max(1, Math.ceil(totalNotes / pageSize));
            if (attemptPage > totalPages) {
                attemptPage = totalPages;
                currentPage = totalPages;
                continue;
            }

            break;
        }

        updateUserFilterOptions();
        renderSignature = "";
        renderNotes(true);
        updatePaginationUI();
        updateNotesSummary();
        setStatus("");
        notesSurfaceReady = true;
    } catch (error) {
        if (fetchId !== activeFetchId) {
            return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        lastSummaryText = "";
        lastPaginationKey = "";
        const message = error instanceof Error ? error.message : "Failed to fetch notes.";
        notesContainer.innerHTML = `<p class="notes-empty">${escapeHtml(message)}</p>`;
        if (notesSummaryElement) {
            notesSummaryElement.textContent = "";
        }
        setStatus(message, true);
    } finally {
        if (fetchId === activeFetchId) {
            setLoadingState(false, { soft });
            if (notesFetchController === fetchController) {
                notesFetchController = null;
            }
        }
    }
}

function isCodeGuideMode() {
    return dashboardMode === MODE_CODE_GUIDE;
}

function setDashboardMode(mode) {
    const nextMode = mode === MODE_CODE_GUIDE ? MODE_CODE_GUIDE : MODE_NOTES;
    if (dashboardMode === nextMode) {
        return;
    }

    dashboardMode = nextMode;
    dashboardRoot?.setAttribute("data-dashboard-mode", nextMode);

    const isGuide = nextMode === MODE_CODE_GUIDE;
    modeNotesBtn?.classList.toggle("mode-tab--active", !isGuide);
    modeCodeGuideBtn?.classList.toggle("mode-tab--active", isGuide);
    modeNotesBtn?.setAttribute("aria-selected", String(!isGuide));
    modeCodeGuideBtn?.setAttribute("aria-selected", String(isGuide));

    if (notesModeHeader) {
        notesModeHeader.hidden = isGuide;
    }
    if (codeGuideModeHeader) {
        codeGuideModeHeader.hidden = !isGuide;
    }
    if (notesModeFilters) {
        notesModeFilters.hidden = isGuide;
    }
    if (codeGuideModeFilters) {
        codeGuideModeFilters.hidden = !isGuide;
    }
    if (notesModeSummary) {
        notesModeSummary.hidden = isGuide;
    }
    if (codeGuideModeSummary) {
        codeGuideModeSummary.hidden = !isGuide;
    }
    if (notesModeStats) {
        notesModeStats.hidden = isGuide;
    }
    if (notesPagination) {
        notesPagination.hidden = isGuide;
    }

    notesContainer.classList.toggle("notes--code-guide", isGuide);
    renderSignature = "";
    lastGuideRenderSignature = "";
    if (!isGuide) {
        selectedGuideNoteId = "";
    }
    void refreshActiveDashboard({ soft: false }).then(() => {
        if (isGuide) {
            syncGuideClearFiltersVisibility();
            guideSearchInput?.focus();
        }
    });
}

async function refreshActiveDashboard(options = {}) {
    if (isCodeGuideMode()) {
        await loadCodeGuideNotes(options);
        return;
    }

    await loadNotes(options);
}

function isCodeGuideAnnotation(note) {
    return Boolean(getCodeReferenceDetails(note).filePath);
}

function normalizeGuidePath(path) {
    return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "").trim();
}

function getGuideConceptKey(note) {
    const type = String(note?.type || "").trim().toLowerCase();
    return type || "untagged";
}

function getGuideConceptVisual(note) {
    const key = getNoteTypeKey(note?.type);
    if (key === "bug") {
        return { icon: "\uD83D\uDC1E", tone: "bug" };
    }
    if (key === "task") {
        return { icon: "\u2713", tone: "task" };
    }
    if (key === "code") {
        return { icon: "\uD83D\uDD39", tone: "code" };
    }
    if (key === "idea") {
        const palette = [
            { icon: "\uD83D\uDD39", tone: "idea" },
            { icon: "\uD83D\uDFE3", tone: "concept" },
            { icon: "\uD83D\uDFE1", tone: "accent" }
        ];
        const hash = Array.from(String(note?.title || "")).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
        return palette[hash % palette.length];
    }

    return { icon: "\uD83D\uDD39", tone: "neutral" };
}

function getGuideDescriptionPreview(note) {
    return getGuideCardPreview(note);
}

function getGuidePlainDescription(note) {
    const raw = String(note?.description || "");
    if (!raw.trim()) {
        return "";
    }

    // Preserve paragraph/line breaks from RTE HTML so WHAT/WHY splitting still works.
    const withBreaks = raw
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/\s*(p|div|li|h[1-6]|tr)\s*>/gi, "\n")
        .replace(/<\s*(p|div|li|h[1-6]|tr)(\s[^>]*)?>/gi, "\n");

    return stripHtml(withBreaks).replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Supported DEVNOTE learning field labels → Code Guide question headings.
 * Matching is case-insensitive; "Why here" is checked before "Why".
 */
const GUIDE_LEARNING_FIELDS = [
    { key: "what", labelPattern: /^what$/i, question: "What does this do?", displayOrder: 1 },
    { key: "why", labelPattern: /^why$/i, question: "Why is it used?", displayOrder: 2 },
    { key: "whyHere", labelPattern: /^why\s+here$/i, question: "Why is it here?", displayOrder: 3 },
    { key: "advantage", labelPattern: /^advantage$/i, question: "What is the advantage?", displayOrder: 4 },
    { key: "how", labelPattern: /^how$/i, question: "How does it work?", displayOrder: 5 },
    { key: "example", labelPattern: /^example$/i, question: "Example", displayOrder: 6 }
];

const GUIDE_STRUCTURED_FIELD_LINE = /^(What|Why\s+here|Why|Advantage|How|Example)\s*:\s*(.*)$/i;

function matchGuideLearningField(labelText) {
    const normalized = String(labelText || "").trim().replace(/\s+/g, " ");
    // Prefer longer / more specific matches first (Why here before Why).
    const ordered = [
        GUIDE_LEARNING_FIELDS.find((field) => field.key === "whyHere"),
        ...GUIDE_LEARNING_FIELDS.filter((field) => field.key !== "whyHere")
    ];
    return ordered.find((field) => field.labelPattern.test(normalized)) || null;
}

/**
 * Parse stored Description into structured learning sections.
 * Does not invent missing fields — only returns labels present in the text.
 * Falls back to legacy first-line / remaining-lines for unlabeled freeform notes.
 * @returns {{ sections: Array<{ key: string, question: string, answer: string }>, preamble: string, what: string, why: string }}
 */
function parseGuideExplanation(description) {
    const normalized = String(description || "").replace(/\r\n/g, "\n").trim();
    if (!normalized) {
        return { sections: [], preamble: "", what: "", why: "" };
    }

    const lines = normalized.split("\n").map((line) => line.trimEnd());
    const preambleLines = [];
    /** @type {Map<string, { key: string, question: string, answer: string, displayOrder: number }>} */
    const sectionMap = new Map();
    let currentKey = null;
    let sawStructuredLabel = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) {
            if (currentKey && sectionMap.has(currentKey)) {
                const existing = sectionMap.get(currentKey);
                existing.answer = `${existing.answer}\n`;
            }
            continue;
        }

        const match = line.match(GUIDE_STRUCTURED_FIELD_LINE);
        if (match) {
            const field = matchGuideLearningField(match[1]);
            if (field) {
                sawStructuredLabel = true;
                currentKey = field.key;
                const value = String(match[2] ?? "").trimEnd();
                if (sectionMap.has(field.key)) {
                    const existing = sectionMap.get(field.key);
                    if (value) {
                        existing.answer = existing.answer
                            ? `${existing.answer}\n${value}`
                            : value;
                    }
                } else {
                    sectionMap.set(field.key, {
                        key: field.key,
                        question: field.question,
                        answer: value,
                        displayOrder: field.displayOrder
                    });
                }
                continue;
            }
        }

        if (currentKey && sectionMap.has(currentKey)) {
            const existing = sectionMap.get(currentKey);
            existing.answer = existing.answer ? `${existing.answer}\n${line}` : line;
            continue;
        }

        if (!sawStructuredLabel) {
            preambleLines.push(line);
        }
    }

    if (sawStructuredLabel) {
        const sections = Array.from(sectionMap.values())
            .map((section) => ({
                key: section.key,
                question: section.question,
                answer: String(section.answer || "").replace(/\n{3,}/g, "\n\n").trim()
            }))
            .filter((section) => section.answer.length > 0)
            .sort((a, b) => {
                const orderA = GUIDE_LEARNING_FIELDS.find((field) => field.key === a.key)?.displayOrder ?? 99;
                const orderB = GUIDE_LEARNING_FIELDS.find((field) => field.key === b.key)?.displayOrder ?? 99;
                return orderA - orderB;
            });

        return {
            sections,
            preamble: preambleLines.join("\n").trim(),
            what: sections.find((section) => section.key === "what")?.answer || "",
            why: sections.find((section) => section.key === "why")?.answer || ""
        };
    }

    // Legacy unlabeled freeform: first paragraph/line = What, remainder = Why.
    // Only used when no structured labels exist — does not invent Why here / Example / etc.
    const paragraphs = normalized.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
    let what = "";
    let why = "";
    if (paragraphs.length >= 2) {
        what = paragraphs[0];
        why = paragraphs.slice(1).join("\n\n");
    } else {
        const plainLines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
        if (plainLines.length >= 2) {
            what = plainLines[0];
            why = plainLines.slice(1).join("\n");
        } else {
            what = normalized;
        }
    }

    const sections = [];
    if (what) {
        sections.push({ key: "what", question: "What does this do?", answer: what });
    }
    if (why) {
        sections.push({ key: "why", question: "Why is it used?", answer: why });
    }

    return { sections, preamble: "", what, why };
}

function renderGuideLearningSectionsMarkup(parsed) {
    const blocks = [];
    const preamble = String(parsed?.preamble || "").trim();
    if (preamble) {
        blocks.push(`
            <div class="guide-detail-block guide-detail-block--preamble">
                <div class="guide-detail-text">${escapeHtml(preamble)}</div>
            </div>
        `);
    }

    const sections = Array.isArray(parsed?.sections) ? parsed.sections : [];
    for (const section of sections) {
        const answer = String(section.answer || "").trim();
        if (!answer) {
            continue;
        }
        const monoClass = section.key === "example" ? " guide-detail-text--mono" : "";
        blocks.push(`
            <div class="guide-detail-block" data-guide-section="${escapeHtml(section.key)}">
                <h4 class="guide-detail-label">${escapeHtml(section.question)}</h4>
                <div class="guide-detail-text${monoClass}">${escapeHtml(answer)}</div>
            </div>
        `);
    }

    if (blocks.length === 0) {
        return `
            <div class="guide-detail-block">
                <div class="guide-detail-text guide-detail-text--empty">No explanation added yet.</div>
            </div>
        `;
    }

    return blocks.join("");
}

function getGuideCardPreview(note) {
    const plain = getGuidePlainDescription(note);
    if (!plain) {
        return { empty: true, text: "No explanation added yet.", truncated: false };
    }

    const parsed = parseGuideExplanation(plain);
    const cardText = parsed.what
        || parsed.sections.find((section) => section.key === "what")?.answer
        || parsed.sections[0]?.answer
        || parsed.preamble
        || plain;
    let text = cardText;
    const hasMore = parsed.sections.length > 1
        || Boolean(parsed.why)
        || plain.length > guideCardPreviewMax
        || cardText.length > guideCardPreviewMax;
    let truncated = hasMore;

    if (cardText.length > guideCardPreviewMax) {
        text = `${cardText.slice(0, guideCardPreviewMax - 1).trimEnd()}\u2026`;
        truncated = true;
    }

    return { empty: false, text, truncated };
}

function formatGuideLocationMarkup(details, { includeFileIcon = true } = {}) {
    const fileName = details.filePath ? getFileBaseName(details.filePath) : "";
    const rows = [];
    if (fileName) {
        rows.push(`<div class="guide-location-row guide-location-row--file">${includeFileIcon ? `<span aria-hidden="true">\uD83D\uDCC4</span> ` : ""}<span>${escapeHtml(fileName)}</span></div>`);
    }
    if (details.methodName) {
        rows.push(`<div class="guide-location-row guide-location-row--nested"><span class="guide-location-nest" aria-hidden="true">\u21B3</span><span>${escapeHtml(details.methodName)}</span></div>`);
    }
    if (details.lineNumber) {
        rows.push(`<div class="guide-location-row guide-location-row--nested"><span class="guide-location-nest" aria-hidden="true">\u21B3</span><span>Line ${escapeHtml(String(details.lineNumber))}</span></div>`);
    }
    return rows.length > 0 ? rows.join("") : `<div class="guide-location-row">No location</div>`;
}

function getGuideConceptBadge(note) {
    const visual = getGuideConceptVisual(note);
    const typeKey = getNoteTypeKey(note?.type);
    const label = typeKey ? (NOTE_TYPE_META[typeKey]?.label || typeKey) : "Concept";
    return {
        icon: visual.icon,
        label,
        tone: visual.tone
    };
}

function renderGuideAnnotationCard(note, index) {
    const safeTitle = escapeHtml(note.title || "Untitled");
    const preview = getGuideCardPreview(note);
    const details = getCodeReferenceDetails(note);
    const badge = getGuideConceptBadge(note);
    const locationMarkup = formatGuideLocationMarkup(details);
    const noteId = getNoteId(note);
    const isSelected = Boolean(noteId) && noteId === selectedGuideNoteId;
    const readMoreMarkup = preview.truncated
        ? `<button type="button" class="guide-annotation__read-more" data-guide-open data-note-index="${index}">Read more</button>`
        : "";

    return `
        <article class="guide-annotation guide-annotation--${badge.tone} note${isSelected ? " guide-annotation--selected" : ""}" data-note-index="${index}" data-note-id="${escapeHtml(noteId)}" role="button" tabindex="0" aria-label="Open annotation ${safeTitle}">
            <div class="guide-annotation__top">
                <span class="guide-concept-badge guide-concept-badge--${badge.tone}">
                    <span class="guide-concept-badge__icon" aria-hidden="true">${badge.icon}</span>
                    <span class="guide-concept-badge__label">${escapeHtml(badge.label)}</span>
                </span>
                <button type="button" class="guide-annotation__open" data-guide-open data-note-index="${index}">Open</button>
            </div>
            <h3 class="guide-annotation__title">${safeTitle}</h3>
            <p class="guide-annotation__description${preview.empty ? " guide-annotation__description--empty" : ""}">${escapeHtml(preview.text)}</p>
            ${readMoreMarkup}
            <div class="guide-annotation__location">
                ${locationMarkup}
            </div>
        </article>
    `;
}

function noteMatchesGuideSearch(note, term) {
    if (!term) {
        return true;
    }

    const haystacks = [
        note?.title,
        stripHtml(note?.description || ""),
        note?.filePath,
        note?.methodName,
        ...(Array.isArray(note?.tags) ? note.tags : [])
    ];

    return haystacks.some((value) => String(value || "").toLowerCase().includes(term));
}

function getGuideFilterState() {
    return {
        search: String(guideSearchInput?.value || "").trim().toLowerCase(),
        file: String(guideFilterFile?.value || "all"),
        concept: String(guideFilterConcept?.value || "all"),
        tag: String(guideFilterTag?.value || "all")
    };
}

function hasActiveGuideFilters() {
    const state = getGuideFilterState();
    return Boolean(state.search) || state.file !== "all" || state.concept !== "all" || state.tag !== "all";
}

function hasGuideSearchText() {
    return Boolean(String(guideSearchInput?.value || "").trim());
}

function syncGuideSearchClearVisibility() {
    guideSearchClearButton?.classList.toggle("hidden", !hasGuideSearchText());
}

function syncGuideClearFiltersVisibility() {
    guideClearFiltersButton?.classList.toggle("hidden", !hasActiveGuideFilters());
    syncGuideSearchClearVisibility();
    syncGuideMoreFiltersVisibility();
}

function syncGuideMoreFiltersVisibility() {
    const hasTags = Boolean(guideFilterTag && guideFilterTag.options.length > 1);
    const tagActive = String(guideFilterTag?.value || "all") !== "all";
    if (tagActive) {
        guideMoreFiltersOpen = true;
    }

    if (guideMoreFiltersButton) {
        guideMoreFiltersButton.hidden = !hasTags && !tagActive && !guideMoreFiltersOpen;
        guideMoreFiltersButton.setAttribute("aria-expanded", String(guideMoreFiltersOpen));
        guideMoreFiltersButton.textContent = guideMoreFiltersOpen ? "Fewer filters" : "More filters";
    }

    if (guideMoreFiltersPanel) {
        guideMoreFiltersPanel.classList.toggle("hidden", !guideMoreFiltersOpen);
    }
}

function setGuideMoreFiltersOpen(open) {
    guideMoreFiltersOpen = Boolean(open);
    syncGuideMoreFiltersVisibility();
    persistGuideUiState();
}

function persistGuideUiState() {
    try {
        const payload = {
            search: String(guideSearchInput?.value || ""),
            file: String(guideFilterFile?.value || "all"),
            concept: String(guideFilterConcept?.value || "all"),
            tag: String(guideFilterTag?.value || "all"),
            moreFiltersOpen: guideMoreFiltersOpen,
            collapsedFiles: guideCollapsedFiles
        };
        sessionStorage.setItem(guideUiStateStorageKey, JSON.stringify(payload));
    } catch {
        // Ignore storage failures (private mode / quota).
    }
}

function restoreGuideUiState() {
    try {
        const raw = sessionStorage.getItem(guideUiStateStorageKey);
        if (!raw) {
            return;
        }

        const payload = JSON.parse(raw);
        if (!payload || typeof payload !== "object") {
            return;
        }

        if (guideSearchInput && typeof payload.search === "string") {
            guideSearchInput.value = payload.search;
        }
        if (guideFilterFile && typeof payload.file === "string") {
            guideFilterFile.dataset.pendingValue = payload.file;
        }
        if (guideFilterConcept && typeof payload.concept === "string") {
            guideFilterConcept.dataset.pendingValue = payload.concept;
        }
        if (guideFilterTag && typeof payload.tag === "string") {
            guideFilterTag.dataset.pendingValue = payload.tag;
        }
        guideMoreFiltersOpen = Boolean(payload.moreFiltersOpen);
        guideCollapsedFiles = payload.collapsedFiles && typeof payload.collapsedFiles === "object"
            ? payload.collapsedFiles
            : {};
    } catch {
        guideCollapsedFiles = {};
    }
}

function applyPendingGuideFilterValues() {
    const applyPending = (select) => {
        if (!select) {
            return;
        }
        const pending = select.dataset.pendingValue;
        if (!pending) {
            return;
        }
        const exists = Array.from(select.options).some((option) => option.value === pending);
        select.value = exists ? pending : "all";
        delete select.dataset.pendingValue;
    };

    applyPending(guideFilterFile);
    applyPending(guideFilterConcept);
    applyPending(guideFilterTag);
}

function clearGuideSearchOnly() {
    if (!guideSearchInput) {
        return false;
    }

    if (!hasGuideSearchText()) {
        return false;
    }

    guideSearchInput.value = "";
    syncGuideClearFiltersVisibility();
    persistGuideUiState();
    renderCodeGuide(true);
    return true;
}

function clearGuideFilters() {
    if (guideSearchInput) {
        guideSearchInput.value = "";
    }
    if (guideFilterFile) {
        guideFilterFile.value = "all";
    }
    if (guideFilterConcept) {
        guideFilterConcept.value = "all";
    }
    if (guideFilterTag) {
        guideFilterTag.value = "all";
    }
    syncGuideClearFiltersVisibility();
    persistGuideUiState();
    renderCodeGuide(true);
}

function formatGuideFileFilterLabel(filePath) {
    const normalized = normalizeGuidePath(filePath);
    if (!normalized) {
        return "Unknown file";
    }

    return normalized;
}

function updateGuideFilterOptions(sourceNotes) {
    const previousFile = String(guideFilterFile?.dataset.pendingValue || guideFilterFile?.value || "all");
    const previousConcept = String(guideFilterConcept?.dataset.pendingValue || guideFilterConcept?.value || "all");
    const previousTag = String(guideFilterTag?.dataset.pendingValue || guideFilterTag?.value || "all");

    const files = Array.from(new Set(
        sourceNotes
            .map((note) => normalizeGuidePath(getCodeReferenceDetails(note).filePath))
            .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    const concepts = Array.from(new Set(
        sourceNotes.map((note) => getGuideConceptKey(note)).filter((value) => value && value !== "untagged")
    )).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    const tags = Array.from(new Set(
        sourceNotes.flatMap((note) => Array.isArray(note.tags) ? note.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [])
    )).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    if (guideFilterFile) {
        guideFilterFile.innerHTML = "";
        const allFiles = document.createElement("option");
        allFiles.value = "all";
        allFiles.textContent = "All files";
        guideFilterFile.append(allFiles);
        for (const file of files) {
            const option = document.createElement("option");
            option.value = file;
            option.textContent = formatGuideFileFilterLabel(file);
            option.title = file;
            guideFilterFile.append(option);
        }
        guideFilterFile.value = files.includes(previousFile) ? previousFile : "all";
        delete guideFilterFile.dataset.pendingValue;
    }

    if (guideFilterConcept) {
        const known = new Set(["bug", "idea", "task", "code"]);
        guideFilterConcept.innerHTML = "";
        const allConcepts = document.createElement("option");
        allConcepts.value = "all";
        allConcepts.textContent = "All concepts";
        guideFilterConcept.append(allConcepts);
        for (const concept of ["code", "bug", "idea", "task"]) {
            const option = document.createElement("option");
            option.value = concept;
            option.textContent = formatTypeLabel(concept) || concept;
            guideFilterConcept.append(option);
        }
        for (const concept of concepts) {
            if (known.has(concept)) {
                continue;
            }
            const option = document.createElement("option");
            option.value = concept;
            option.textContent = concept;
            guideFilterConcept.append(option);
        }
        const conceptValues = Array.from(guideFilterConcept.options).map((option) => option.value);
        guideFilterConcept.value = conceptValues.includes(previousConcept) ? previousConcept : "all";
        delete guideFilterConcept.dataset.pendingValue;
    }

    if (guideFilterTag) {
        guideFilterTag.innerHTML = "";
        const allTags = document.createElement("option");
        allTags.value = "all";
        allTags.textContent = "All tags";
        guideFilterTag.append(allTags);
        for (const tag of tags) {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = `#${tag}`;
            guideFilterTag.append(option);
        }
        guideFilterTag.value = tags.includes(previousTag) ? previousTag : "all";
        delete guideFilterTag.dataset.pendingValue;
    }

    syncGuideClearFiltersVisibility();
}

function getFilteredGuideNotes() {
    const state = getGuideFilterState();
    return codeGuideSourceNotes.filter((note) => {
        if (!isCodeGuideAnnotation(note)) {
            return false;
        }

        if (!noteMatchesGuideSearch(note, state.search)) {
            return false;
        }

        const filePath = normalizeGuidePath(getCodeReferenceDetails(note).filePath);
        if (state.file !== "all" && filePath !== state.file) {
            return false;
        }

        if (state.concept !== "all" && getGuideConceptKey(note) !== state.concept) {
            return false;
        }

        if (state.tag !== "all") {
            const tags = Array.isArray(note.tags)
                ? note.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
                : [];
            if (!tags.some((tag) => tag.toLowerCase() === state.tag.toLowerCase())) {
                return false;
            }
        }

        return true;
    });
}

async function fetchAllNotesForGuide(signal) {
    const items = [];
    let page = 1;
    let total = Number.POSITIVE_INFINITY;

    while (items.length < total && page <= 50) {
        const query = new URLSearchParams({
            page: String(page),
            pageSize: String(guideFetchPageSize),
            search: "",
            type: "all",
            sort: "oldest"
        });
        const response = await apiRequest(`/devnotes/api?${query.toString()}`, { signal });
        const batch = Array.isArray(response)
            ? response
            : (Array.isArray(response?.items) ? response.items : []);
        total = Array.isArray(response)
            ? batch.length
            : (Number.isFinite(response?.total) ? response.total : batch.length);
        items.push(...batch);
        if (batch.length === 0 || items.length >= total) {
            break;
        }

        page += 1;
    }

    return items;
}

/**
 * @param {{ soft?: boolean }} [options]
 */
async function loadCodeGuideNotes(options = {}) {
    const soft = Boolean(options.soft) && codeGuideSurfaceReady;
    const fetchId = ++activeGuideFetchId;

    guideFetchController?.abort();
    const fetchController = new AbortController();
    guideFetchController = fetchController;

    setLoadingState(true, { soft });
    if (!soft) {
        setStatus("Loading Code Guide...");
    }

    try {
        const items = await fetchAllNotesForGuide(fetchController.signal);
        if (fetchId !== activeGuideFetchId) {
            return;
        }

        codeGuideSourceNotes = items.filter((note) => isCodeGuideAnnotation(note));
        updateGuideFilterOptions(codeGuideSourceNotes);
        applyPendingGuideFilterValues();
        renderCodeGuide(true);
        setStatus("");
        codeGuideSurfaceReady = true;
    } catch (error) {
        if (fetchId !== activeGuideFetchId) {
            return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        const message = error instanceof Error ? error.message : "Failed to load Code Guide.";
        notesContainer.innerHTML = `<p class="notes-empty">${escapeHtml(message)}</p>`;
        if (guideSummaryElement) {
            guideSummaryElement.textContent = "";
        }
        setStatus(message, true);
    } finally {
        if (fetchId === activeGuideFetchId) {
            setLoadingState(false, { soft });
            if (guideFetchController === fetchController) {
                guideFetchController = null;
            }
        }
    }
}

function isGuideFileCollapsed(filePath) {
    return Boolean(guideCollapsedFiles[normalizeGuidePath(filePath)]);
}

function setGuideFileCollapsed(filePath, collapsed) {
    const key = normalizeGuidePath(filePath);
    if (!key) {
        return;
    }

    if (collapsed) {
        guideCollapsedFiles[key] = true;
    } else {
        delete guideCollapsedFiles[key];
    }
    persistGuideUiState();
}

function toggleGuideFileGroup(filePath) {
    const key = normalizeGuidePath(filePath);
    setGuideFileCollapsed(key, !isGuideFileCollapsed(key));
    const groups = notesContainer.querySelectorAll("[data-guide-file]");
    let group = null;
    for (const candidate of groups) {
        if (candidate instanceof HTMLElement && normalizeGuidePath(candidate.dataset.guideFile || "") === key) {
            group = candidate;
            break;
        }
    }
    if (!(group instanceof HTMLElement)) {
        renderCodeGuide(true);
        return;
    }

    const collapsed = isGuideFileCollapsed(key);
    group.classList.toggle("guide-file-group--collapsed", collapsed);
    const toggle = group.querySelector("[data-guide-toggle]");
    if (toggle instanceof HTMLElement) {
        toggle.setAttribute("aria-expanded", String(!collapsed));
    }
}

function renderCodeGuide(force = false) {
    const filtered = getFilteredGuideNotes();
    const state = getGuideFilterState();
    renderedNotes = filtered;

    const signature = [
        state.search,
        state.file,
        state.concept,
        state.tag,
        JSON.stringify(guideCollapsedFiles),
        filtered.map((note) => {
            const details = getCodeReferenceDetails(note);
            return `${getNoteId(note)}:${details.filePath}:${details.lineNumber}:${note.title}:${note.description}:${(note.tags || []).join(",")}`;
        }).join("|")
    ].join("::");
    if (!force && signature === lastGuideRenderSignature) {
        updateGuideSummary(filtered);
        return;
    }
    lastGuideRenderSignature = signature;

    if (filtered.length === 0) {
        const hasFilters = hasActiveGuideFilters();
        const fileOnlyEmpty = state.file !== "all" && !state.search && state.concept === "all" && state.tag === "all";
        notesContainer.innerHTML = fileOnlyEmpty
            ? `
                <div class="notes-empty notes-empty-state guide-empty-state">
                    <p class="notes-empty-state__title">No Code Guide annotations found for this file.</p>
                    <button type="button" class="empty-state-action" data-guide-clear-filters>Clear filters</button>
                </div>
            `
            : hasFilters
            ? `
                <div class="notes-empty notes-empty-state guide-empty-state">
                    <p class="notes-empty-state__title">No code annotations found.</p>
                    <p class="notes-empty-state__subtitle">Try:</p>
                    <ul class="guide-empty-hints">
                        <li>another concept (e.g. Dependency Injection)</li>
                        <li>a filename (e.g. Program.cs)</li>
                        <li>a method name</li>
                        <li>a tag</li>
                    </ul>
                    <button type="button" class="empty-state-action" data-guide-clear-filters>Clear filters</button>
                </div>
            `
            : `
                <div class="notes-empty notes-empty-state guide-empty-state">
                    <p class="notes-empty-state__title">No code annotations yet</p>
                    <p class="notes-empty-state__subtitle">Add learning notes in source, then scan:</p>
                    <ul class="guide-empty-hints">
                        <li><code>// DEVNOTE: Dependency Injection</code></li>
                        <li><code>// Registers services into the DI container.</code></li>
                    </ul>
                    <p class="guide-empty-hint-extra">Then use <strong>Scan Project</strong> and import into Code Guide.</p>
                    <button type="button" class="empty-state-action" data-guide-help>How to annotate</button>
                </div>
            `;
        updateGuideSummary(filtered);
        persistGuideUiState();
        return;
    }

    const groups = new Map();
    filtered.forEach((note, index) => {
        const filePath = normalizeGuidePath(getCodeReferenceDetails(note).filePath) || "Unknown file";
        if (!groups.has(filePath)) {
            groups.set(filePath, []);
        }
        groups.get(filePath).push({ note, index });
    });

    // Code Guide only: preserve physical source order (line ascending).
    // Do not sort by created/updated date, title, or author.
    for (const items of groups.values()) {
        items.sort(compareGuideAnnotationsBySourceOrder);
    }

    const sortedGroups = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" }));
    const usingSearch = Boolean(state.search);

    notesContainer.innerHTML = sortedGroups.map(([filePath, items]) => {
        const fileName = getFileBaseName(filePath);
        const folderPath = filePath.includes("/") ? filePath : "";
        const countLabel = usingSearch
            ? (items.length === 1 ? "1 result" : `${items.length} results`)
            : (items.length === 1 ? "1 annotation" : `${items.length} annotations`);
        const collapsed = isGuideFileCollapsed(filePath);
        const codeMap = renderCodeMap(filePath, items);
        const cards = items.map((item) => renderGuideAnnotationCard(item.note, item.index)).join("");
        return `
            <section class="guide-file-group${collapsed ? " guide-file-group--collapsed" : ""}" data-guide-file="${escapeHtml(filePath)}">
                <button type="button" class="guide-file-group__header" data-guide-toggle aria-expanded="${collapsed ? "false" : "true"}">
                    <span class="guide-file-group__chevron" aria-hidden="true"></span>
                    <span class="guide-file-group__heading">
                        <span class="guide-file-group__title">
                            <span class="guide-file-group__icon" aria-hidden="true">\uD83D\uDCC4</span>
                            <span class="guide-file-group__name">${escapeHtml(fileName)}</span>
                        </span>
                        ${folderPath && folderPath !== fileName
                            ? `<span class="guide-file-group__path">${escapeHtml(folderPath)}</span>`
                            : ""}
                    </span>
                    <span class="guide-file-group__count">${countLabel}</span>
                </button>
                <div class="guide-file-group__body">
                    ${codeMap}
                    <div class="guide-file-group__list">
                        ${cards}
                    </div>
                </div>
            </section>
        `;
    }).join("");

    updateGuideSelectionHighlights();
    updateGuideSummary(filtered);
    persistGuideUiState();
}

/**
 * Flat table-of-contents for a file's DEVNOTE annotations (source order).
 * Does not create records — indexes existing DevNote items only.
 * @param {string} filePath
 * @param {Array<{ note: object, index: number }>} items Already sorted by LineNumber ASC.
 */
function renderCodeMap(filePath, items) {
    if (!Array.isArray(items) || items.length === 0) {
        // Never show an empty Code Map.
        return "";
    }

    const fileName = getFileBaseName(filePath) || "File";
    const rows = items.map((item, mapIndex) => {
        const note = item.note;
        const noteId = getNoteId(note);
        const title = note?.title || "Untitled";
        const line = getGuideSourceLineNumber(note);
        const isActive = Boolean(noteId) && noteId === selectedGuideNoteId;
        const lineMarkup = line > 0
            ? `<span class="code-map-item__leader" aria-hidden="true"></span><span class="code-map-item__line">Line ${escapeHtml(String(line))}</span>`
            : "";

        return `
            <button
                type="button"
                class="code-map-item${isActive ? " code-map-item--active" : ""}"
                data-code-map-item
                data-note-id="${escapeHtml(noteId)}"
                data-note-index="${item.index}"
                role="listitem"
                aria-current="${isActive ? "true" : "false"}"
            >
                <span class="code-map-item__index">${formatCodeMapIndex(mapIndex)}</span>
                <span class="code-map-item__title">${escapeHtml(title)}</span>
                ${lineMarkup}
            </button>
        `;
    }).join("");

    return `
        <nav class="code-map" aria-label="Code map for ${escapeHtml(fileName)}">
            <div class="code-map__header">
                <h3 class="code-map__heading">Code Map</h3>
            </div>
            <div class="code-map__list" role="list">
                ${rows}
            </div>
        </nav>
    `;
}

function formatCodeMapIndex(zeroBasedIndex) {
    return String(Number(zeroBasedIndex) + 1).padStart(2, "0");
}

function updateGuideSelectionHighlights() {
    if (!notesContainer) {
        return;
    }

    const selectedId = selectedGuideNoteId || "";

    notesContainer.querySelectorAll(".code-map-item").forEach((el) => {
        if (!(el instanceof HTMLElement)) {
            return;
        }
        const isActive = Boolean(selectedId) && el.dataset.noteId === selectedId;
        el.classList.toggle("code-map-item--active", isActive);
        el.setAttribute("aria-current", isActive ? "true" : "false");
    });

    notesContainer.querySelectorAll(".guide-annotation[data-note-index]").forEach((el) => {
        if (!(el instanceof HTMLElement)) {
            return;
        }
        const note = getRenderedNote(el.dataset.noteIndex);
        const isSelected = Boolean(selectedId) && getNoteId(note) === selectedId;
        el.classList.toggle("guide-annotation--selected", isSelected);
    });
}

function scrollGuideAnnotationIntoView(note) {
    if (!notesContainer || !note) {
        return;
    }

    const noteId = getNoteId(note);
    const index = renderedNotes.findIndex((candidate) => getNoteId(candidate) === noteId);
    if (index < 0) {
        return;
    }

    const card = notesContainer.querySelector(`.guide-annotation[data-note-index="${index}"]`);
    if (!(card instanceof HTMLElement)) {
        return;
    }

    const group = card.closest("[data-guide-file]");
    if (group instanceof HTMLElement && group.classList.contains("guide-file-group--collapsed")) {
        const filePath = group.dataset.guideFile || "";
        if (filePath) {
            setGuideFileCollapsed(filePath, false);
            renderCodeGuide(true);
            const expandedCard = notesContainer.querySelector(`.guide-annotation[data-note-index="${index}"]`);
            expandedCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            updateGuideSelectionHighlights();
            return;
        }
    }

    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Select a Code Guide annotation from the Code Map: highlight, scroll list, open detail.
 * @param {object} note
 */
function selectGuideAnnotationFromMap(note) {
    if (!note) {
        return;
    }

    selectedGuideNoteId = getNoteId(note);
    updateGuideSelectionHighlights();
    scrollGuideAnnotationIntoView(note);
    openModal(note);
}

/**
 * Sort key for Code Guide: LineNumber ascending, missing lines last,
 * then scanner/discovery order (stable index) for equal lines.
 * @param {{ note: object, index: number }} a
 * @param {{ note: object, index: number }} b
 */
function compareGuideAnnotationsBySourceOrder(a, b) {
    const lineA = getGuideSourceLineNumber(a.note);
    const lineB = getGuideSourceLineNumber(b.note);
    const hasLineA = lineA > 0;
    const hasLineB = lineB > 0;

    if (hasLineA && hasLineB && lineA !== lineB) {
        return lineA - lineB;
    }
    if (hasLineA && !hasLineB) {
        return -1;
    }
    if (!hasLineA && hasLineB) {
        return 1;
    }

    // Same line (or both missing): keep discovery / list order.
    return a.index - b.index;
}

function getGuideSourceLineNumber(note) {
    const raw = getCodeReferenceDetails(note).lineNumber;
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : 0;
}

function updateGuideSummary(filteredNotes) {
    if (!guideSummaryElement) {
        return;
    }

    const fileCount = new Set(
        filteredNotes.map((note) => normalizeGuidePath(getCodeReferenceDetails(note).filePath)).filter(Boolean)
    ).size;
    const annotationLabel = filteredNotes.length === 1 ? "1 annotation" : `${filteredNotes.length} annotations`;
    const fileLabel = fileCount === 1 ? "1 file" : `${fileCount} files`;
    const text = `${annotationLabel} \u00B7 ${fileLabel}`;
    if (text === lastGuideSummaryText) {
        return;
    }

    lastGuideSummaryText = text;
    guideSummaryElement.textContent = text;
}

const debouncedGuideSearch = debounce(() => {
    persistGuideUiState();
    renderCodeGuide(true);
}, searchDebounceMs);

noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = sanitizeDescriptionHtml(descriptionEditor ? descriptionEditor.innerHTML : "");
    const descriptionText = stripHtml(description).trim();
    if (!descriptionText) {
        setStatus("Description is required.", true);
        descriptionEditor?.focus();
        return;
    }

    const type = typeInput.value.trim();
    const rawTags = tagsInput.value.trim();
    const tags = rawTags ? rawTags.split(",").map((x) => x.trim()).filter(Boolean) : [];
    const createdBy = getCreatedByForSubmit();
    const codeFilePath = codeFilePathInput?.value.trim() || "";
    const methodName = codeMethodNameInput?.value.trim() || "";
    const lineNumberRaw = codeLineNumberInput?.value.trim() || "";
    const parsedLineNumber = Number.parseInt(lineNumberRaw, 10);
    const lineNumber = Number.isFinite(parsedLineNumber) && parsedLineNumber > 0 ? parsedLineNumber : null;
    const isEditing = Boolean(editingNoteId);
    const successMessage = isEditing ? "Note updated." : "Note added.";

    if (isCodeGuideMode() && !codeFilePath) {
        setStatus("Tip: set a code file path so this annotation appears in Code Guide.", true);
        codeFilePathInput?.focus();
        return;
    }

    submitButton.disabled = true;
    cancelEditButton?.setAttribute("disabled", "true");
    setStatus(isEditing ? "Updating note..." : "Saving note...");

    try {
        const attachments = isEditing ? editingAttachments.slice() : [];
        const selectedFiles = composerPendingFiles.length > 0
            ? composerPendingFiles.slice()
            : (attachmentInput?.files?.length ? Array.from(attachmentInput.files) : []);
        if (selectedFiles.length > 0) {
            for (let i = 0; i < selectedFiles.length; i++) {
                const n = selectedFiles.length;
                setStatus(n > 1 ? `Uploading attachment ${i + 1} of ${n}...` : "Uploading attachment...");
                const uploadData = new FormData();
                uploadData.append("file", selectedFiles[i]);

                const uploadResult = await apiRequest("/devnotes/upload", {
                    method: "POST",
                    body: uploadData
                });

                const path = uploadResult?.filePath || uploadResult?.fileUrl || "";
                if (path) {
                    attachments.push(path);
                }
            }
        }

        const payload = {
            title,
            description,
            type,
            tags,
            createdBy,
            attachments,
            attachment: attachments.length > 0 ? attachments[0] : "",
            filePath: codeFilePath,
            methodName,
            lineNumber
        };
        const endpoint = isEditing ? `/devnotes/${encodeURIComponent(editingNoteId)}` : "/devnotes/add";
        const method = isEditing ? "PUT" : "POST";

        await apiRequest(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (createdByManuallyEdited) {
            persistCreatedByOverride(createdByInput?.value);
        }

        // Reinitialize the create form immediately so stale values never linger.
        resetComposerAfterSave();
        closeComposerModal();

        try {
            await refreshActiveDashboard({ soft: false });
        } catch {
            // Active dashboard loader handles its own status/error UI; avoid treating reload as save failure.
        }

        void loadStatistics();
        setStatus(successMessage, false, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : (isEditing ? "Failed to update note." : "Failed to save note.");
        setStatus(message, true);
    } finally {
        submitButton.disabled = false;
        cancelEditButton?.removeAttribute("disabled");
    }
});

const debouncedSearch = debounce(() => {
    currentPage = 1;
    void loadNotes({ soft: true });
}, searchDebounceMs);
const debouncedFileSuggestions = debounce(() => {
    void loadCodeFileSuggestions();
}, fileSuggestionDebounceMs);

searchInput.addEventListener("input", () => {
    debouncedSearch();
});

codeFilePathInput?.addEventListener("input", () => {
    debouncedFileSuggestions();
});

codeFilePathInput?.addEventListener("focus", () => {
    void loadCodeFileSuggestions();
});

createdByInput?.addEventListener("input", () => {
    createdByManuallyEdited = true;
    persistCreatedByOverride(createdByInput.value);
});

createdByInput?.addEventListener("blur", () => {
    if (!createdByInput.value.trim()) {
        createdByManuallyEdited = false;
        createdByInput.value = resolveCreatedBy();
    }
});

typeFilterInput?.addEventListener("change", () => {
    syncStatFilterActiveState();
    currentPage = 1;
    void loadNotes({ soft: true });
});

for (const pill of statFilterPills) {
    pill.addEventListener("click", () => {
        applyTypeFilterFromStat(pill.dataset.statFilter || "all");
    });
}

userFilterInput?.addEventListener("change", () => {
    applyUserFilter(userFilterInput.value);
});

sortOrderInput?.addEventListener("change", () => {
    currentPage = 1;
    void loadNotes({ soft: true });
});

previousPageButton?.addEventListener("click", () => {
    if (currentPage <= 1) {
        return;
    }

    currentPage -= 1;
    void loadNotes({ soft: true });
});

nextPageButton?.addEventListener("click", () => {
    if (currentPage * pageSize >= totalNotes) {
        return;
    }

    currentPage += 1;
    void loadNotes({ soft: true });
});

noteForm.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rte-command]");
    if (!(button instanceof HTMLElement) || !descriptionEditor) {
        return;
    }

    event.preventDefault();
    const command = button.dataset.rteCommand;
    if (!command) {
        return;
    }

    descriptionEditor.focus();
    document.execCommand(command, false);
});

descriptionEditor?.addEventListener("paste", (event) => {
    void handleDescriptionPaste(event);
});

notesContainer.addEventListener("click", (event) => {
    const emptyStateAction = event.target.closest("[data-empty-action]");
    if (emptyStateAction instanceof HTMLElement && emptyStateAction.dataset.emptyAction === "create") {
        openComposerForCreate();
        return;
    }

    const guideToggle = event.target.closest("[data-guide-toggle]");
    if (guideToggle instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        const group = guideToggle.closest("[data-guide-file]");
        const filePath = group instanceof HTMLElement ? group.dataset.guideFile || "" : "";
        if (filePath) {
            toggleGuideFileGroup(filePath);
        }
        return;
    }

    const codeMapItem = event.target.closest("[data-code-map-item]");
    if (codeMapItem instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        const note = getRenderedNote(codeMapItem.dataset.noteIndex);
        if (note) {
            selectGuideAnnotationFromMap(note);
        }
        return;
    }

    const guideOpenButton = event.target.closest("[data-guide-open]");
    if (guideOpenButton instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        const note = getRenderedNote(guideOpenButton.dataset.noteIndex);
        if (note) {
            openModal(note);
        }
        return;
    }

    const guideClearFiltersAction = event.target.closest("[data-guide-clear-filters]");
    if (guideClearFiltersAction instanceof HTMLElement) {
        event.preventDefault();
        clearGuideFilters();
        return;
    }

    const guideHelpAction = event.target.closest("[data-guide-help]");
    if (guideHelpAction instanceof HTMLElement) {
        event.preventDefault();
        openGuideHelpModal();
        return;
    }

    if (event.target.closest("a[data-attachment-link]")) {
        return;
    }
    const codeReferenceLink = event.target.closest("a[data-code-reference-link]");
    if (codeReferenceLink instanceof HTMLAnchorElement) {
        const href = codeReferenceLink.getAttribute("href") || "#";
        if (href !== "#") {
            event.stopPropagation();
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        const noteElement = codeReferenceLink.closest(".note[data-note-index]");
        const note = noteElement ? getRenderedNote(noteElement.dataset.noteIndex) : null;
        if (note && getCodeReferenceDetails(note).filePath) {
            void openCodePreview(note);
        }
        return;
    }

    const actionButton = event.target.closest("[data-note-action]");
    if (actionButton instanceof HTMLElement) {
        const note = getRenderedNote(actionButton.dataset.noteIndex);
        if (!note) {
            return;
        }

        const action = actionButton.dataset.noteAction;
        if (action === "edit") {
            startEditingNote(note);
        } else if (action === "delete") {
            void deleteNote(note);
        }

        return;
    }

    const userFilterButton = event.target.closest("[data-user-filter]");
    if (userFilterButton instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        applyUserFilter(userFilterButton.dataset.userFilter || "all");
        return;
    }

    const noteElement = event.target.closest(".note[data-note-index]");
    const note = noteElement ? getRenderedNote(noteElement.dataset.noteIndex) : null;
    if (note) {
        openModal(note);
    }
});

notesContainer.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }

    const noteElement = event.target.closest(".note[data-note-index]");
    const note = noteElement ? getRenderedNote(noteElement.dataset.noteIndex) : null;
    if (!note) {
        return;
    }

    event.preventDefault();
    openModal(note);
});

if (cancelEditButton) {
    cancelEditButton.addEventListener("click", () => {
        openComposerForCreate();
        setStatus("Edit cancelled.");
    });
}

function handleGlobalShortcuts(event) {
    const key = event.key.toLowerCase();
    const isTyping = isTypingTarget(event.target);

    // Ctrl+N is reserved by the browser (new window/tab) and cannot be overridden.
    // Alt+N works reliably for "new note" on Windows/Linux; Option+N on macOS.
    const isQuickCreateShortcut = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && key === "n";
    if (isQuickCreateShortcut && !isTyping) {
        event.preventDefault();
        event.stopPropagation();
        openComposerForCreate();
        return;
    }

    const isSearchShortcut = (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && key === "k";
    if (isSearchShortcut && !isTyping) {
        event.preventDefault();
        event.stopPropagation();
        const targetSearch = isCodeGuideMode() ? guideSearchInput : searchInput;
        targetSearch?.focus();
        targetSearch?.select();
        return;
    }
}

document.addEventListener("keydown", handleGlobalShortcuts, true);
document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && imageZoomOverlay) {
        closeImageZoom();
        return;
    }

    if (event.key === "Escape" && isCodePreviewModalOpen()) {
        closeCodePreviewModal();
        return;
    }

    if (event.key === "Escape" && isNoteModalOpen()) {
        closeModal();
        return;
    }

    if (event.key === "Escape" && isScanModalOpen()) {
        closeScanModal();
        return;
    }

    if (event.key === "Escape" && isGuideHelpModalOpen()) {
        closeGuideHelpModal();
        return;
    }

    if (event.key === "Escape" && isImportModalOpen()) {
        closeImportModal();
        return;
    }

    if (event.key === "Escape" && isCodeGuideExportModalOpen()) {
        closeCodeGuideExportModal();
        return;
    }

    if (event.key === "Escape" && isComposerModalOpen()) {
        closeComposerModal();
        return;
    }

    if (event.key === "Escape" && isCodeGuideMode() && hasGuideSearchText()) {
        event.preventDefault();
        clearGuideSearchOnly();
        guideSearchInput?.focus();
    }
});

function isTypingTarget(target) {
    if (!(target instanceof Element)) {
        return false;
    }

    return target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.closest("[contenteditable='true']") !== null ||
        target.isContentEditable;
}

addNoteButton?.addEventListener("click", () => {
    openComposerForCreate();
});

codeGuideAddNoteButton?.addEventListener("click", () => {
    openComposerForCreate();
});

codeGuideHelpButton?.addEventListener("click", () => {
    openGuideHelpModal();
});

guideHelpCloseButton?.addEventListener("click", () => {
    closeGuideHelpModal();
});

guideHelpCloseActionButton?.addEventListener("click", () => {
    closeGuideHelpModal();
});

guideHelpScanButton?.addEventListener("click", () => {
    closeGuideHelpModal();
    scanProjectButton?.click();
});

guideHelpModal?.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Element)) {
        return;
    }

    if (!clickTarget.closest(".guide-help-modal")) {
        closeGuideHelpModal();
    }
});

modeNotesBtn?.addEventListener("click", () => {
    setDashboardMode(MODE_NOTES);
});

modeCodeGuideBtn?.addEventListener("click", () => {
    setDashboardMode(MODE_CODE_GUIDE);
});

guideSearchInput?.addEventListener("input", () => {
    syncGuideClearFiltersVisibility();
    debouncedGuideSearch();
});

guideSearchClearButton?.addEventListener("click", () => {
    if (clearGuideSearchOnly()) {
        guideSearchInput?.focus();
    }
});

guideFilterFile?.addEventListener("change", () => {
    syncGuideClearFiltersVisibility();
    persistGuideUiState();
    renderCodeGuide(true);
});

guideFilterConcept?.addEventListener("change", () => {
    syncGuideClearFiltersVisibility();
    persistGuideUiState();
    renderCodeGuide(true);
});

guideFilterTag?.addEventListener("change", () => {
    syncGuideClearFiltersVisibility();
    persistGuideUiState();
    renderCodeGuide(true);
});

guideClearFiltersButton?.addEventListener("click", () => {
    clearGuideFilters();
});

guideMoreFiltersButton?.addEventListener("click", () => {
    setGuideMoreFiltersOpen(!guideMoreFiltersOpen);
});

modalEditButton?.addEventListener("click", () => {
    if (activeModalNote) {
        startEditingNote(activeModalNote);
    }
});

modalCloseActionButton?.addEventListener("click", () => {
    closeModal();
});

quickAddNoteFab?.addEventListener("click", () => {
    openComposerForCreate();
});

window.addEventListener("scroll", () => {
    syncQuickAddFabVisibility();
}, { passive: true });

function openComposerForCreate() {
    openComposerModal();
    if (isCodeGuideMode() && typeInput && !String(typeInput.value || "").trim()) {
        typeInput.value = "code";
    }
}

function syncQuickAddFabVisibility() {
    if (!quickAddNoteFab) {
        return;
    }

    const shouldShow = window.scrollY > fabRevealScrollY;
    quickAddNoteFab.classList.toggle("quick-add-note-fab--visible", shouldShow);
}

composerCloseButton?.addEventListener("click", () => {
    closeComposerModal();
});

composerModal?.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Element)) {
        return;
    }

    if (!clickTarget.closest(".composer-modal")) {
        closeComposerModal();
    }
});

modalCloseButton?.addEventListener("click", () => {
    closeModal();
});

noteModal?.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Element)) {
        return;
    }

    if (!clickTarget.closest("[data-modal-content]")) {
        closeModal();
    }
});

noteModalContent?.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element) {
        const attachmentImage = target.closest(".modal-attachment-image");
        if (attachmentImage instanceof HTMLImageElement) {
            event.preventDefault();
            openImageZoom(attachmentImage.currentSrc || attachmentImage.src);
            event.stopPropagation();
            return;
        }

        const descriptionImage = target.closest(".modal-description img");
        if (descriptionImage instanceof HTMLImageElement) {
            event.preventDefault();
            openImageZoom(descriptionImage.currentSrc || descriptionImage.src);
            event.stopPropagation();
            return;
        }
    }

    event.stopPropagation();
});

window.addEventListener("unhandledrejection", () => {
    setStatus("A background request failed. Please try again.", true);
});

window.addEventListener("error", () => {
    setStatus("DevNotes UI recovered from an unexpected error.", true);
});

noteForm.addEventListener("keydown", (event) => {
    const isSubmitShortcut = (event.ctrlKey || event.metaKey) && event.key === "Enter";
    if (!isSubmitShortcut) {
        return;
    }

    event.preventDefault();
    noteForm.requestSubmit();
});

function getRenderedNote(indexValue) {
    const noteIndex = Number(indexValue);
    if (Number.isNaN(noteIndex) || noteIndex < 0 || noteIndex >= renderedNotes.length) {
        return null;
    }

    return renderedNotes[noteIndex];
}

function renderNotes(force = false) {
    const selectedUser = getSelectedUserFilterValue();
    renderedNotes = selectedUser === "all"
        ? allNotes
        : allNotes.filter((note) => getCreatedByGroupName(note) === selectedUser);

    const signature = `${currentPage}|${totalNotes}|${selectedUser}|${renderedNotes.length}|${renderedNotes.map((n) => `${getNoteId(n)}:${n.createdAt ?? ""}:${getCreatedByGroupName(n)}`).join("|")}`;
    if (!force && signature === renderSignature) {
        return;
    }
    renderSignature = signature;

    if (renderedNotes.length === 0) {
        const hasSearch = Boolean(searchInput.value.trim());
        const hasTypeFilter = Boolean(typeFilterInput && typeFilterInput.value !== "all");
        const hasUserFilter = Boolean(userFilterInput && userFilterInput.value !== "all");
        const isFirstNoteState = totalNotes === 0 && !hasSearch && !hasTypeFilter && !hasUserFilter;
        if (isFirstNoteState) {
            notesContainer.innerHTML = `
                <div class="notes-empty notes-empty-state">
                    <p class="notes-empty-state__title">No DevNotes yet</p>
                    <p class="notes-empty-state__subtitle">Capture bugs, ideas, and tasks while coding.</p>
                    <button type="button" class="empty-state-action" data-empty-action="create">Create first note</button>
                </div>
            `;
        } else {
            notesContainer.innerHTML = `
                <div class="notes-empty notes-empty-state">
                    <p class="notes-empty-state__title">No notes found</p>
                    <p class="notes-empty-state__subtitle">Try adjusting search or filters.</p>
                </div>
            `;
        }
        return;
    }

    const grouped = new Map();
    renderedNotes.forEach((note, index) => {
        const groupName = getCreatedByGroupName(note);
        if (!grouped.has(groupName)) {
            grouped.set(groupName, []);
        }

        grouped.get(groupName).push({ note, index });
    });

    notesContainer.innerHTML = Array.from(grouped.entries())
        .map(([groupName, items]) => {
            const countLabel = items.length === 1 ? "1 note" : `${items.length} notes`;
            const displayName = formatUserDisplayName(groupName);
            const notesMarkup = items.map((item) => renderNoteCard(item.note, item.index)).join("");
            return `
                <section class="notes-group" data-created-by-group="${escapeHtml(groupName)}">
                    <header class="notes-group__header">
                        <h2 class="notes-group__title">
                            <span class="notes-group__icon" aria-hidden="true">\uD83D\uDC64</span>
                            <span class="notes-group__name">${escapeHtml(displayName)}</span>
                        </h2>
                        <span class="notes-group__count">${countLabel}</span>
                    </header>
                    <div class="notes-group__list">
                        ${notesMarkup}
                    </div>
                </section>
            `;
        })
        .join("");
}

function getCreatedByGroupName(note) {
    const createdBy = String(note?.createdBy || "").trim();
    return createdBy || defaultCreatedByFallback;
}

function getSelectedUserFilterValue() {
    return String(userFilterInput?.value || "all");
}

function applyUserFilter(userValue) {
    if (!userFilterInput) {
        return;
    }

    const nextValue = String(userValue || "all");
    userFilterInput.value = Array.from(userFilterInput.options).some((option) => option.value === nextValue)
        ? nextValue
        : "all";
    renderSignature = "";
    renderNotes(true);
    updateNotesSummary();
}

function updateUserFilterOptions() {
    if (!userFilterInput) {
        return;
    }

    const previousValue = getSelectedUserFilterValue();
    const uniqueUsers = Array.from(new Set(allNotes.map((note) => getCreatedByGroupName(note))))
        .sort((a, b) => a.localeCompare(b));

    userFilterInput.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All users";
    userFilterInput.append(allOption);

    for (const user of uniqueUsers) {
        const option = document.createElement("option");
        option.value = user;
        option.textContent = formatUserDisplayName(user);
        userFilterInput.append(option);
    }

    userFilterInput.value = uniqueUsers.includes(previousValue) ? previousValue : "all";
}

function renderNoteCard(note, index) {
    const safeTitle = escapeHtml(note.title || "Untitled");
    const safeDescription = formatNoteDescriptionHtml(note.description || "");
    const hasDescription = Boolean(stripHtml(safeDescription).trim());
    const descriptionMarkup = hasDescription
        ? `<div class="note__description-wrap"><div class="note-description note-description--preview">${safeDescription}</div></div>`
        : "";
    const noteId = getNoteId(note);
    const actionButtons = noteId
        ? `
            <div class="note-actions">
                <button type="button" class="note-action-btn" data-note-action="edit" data-note-index="${index}" aria-label="Edit note ${safeTitle}">Edit</button>
                <button type="button" class="note-action-btn note-action-btn--delete" data-note-action="delete" data-note-index="${index}" aria-label="Delete note ${safeTitle}">Delete</button>
            </div>
        `
        : "";
    const typeKey = getNoteTypeKey(note.type);
    const typeBadge = renderTypeBadge(note.type);
    const tagsMarkup = Array.isArray(note.tags) && note.tags.length > 0
        ? `<div class="note__tags">${note.tags.map((tag) => `<span class="note-tag-pill">${escapeHtml(String(tag).trim())}</span>`).join("")}</div>`
        : "";
    const attachmentMarkup = getAttachmentMarkup(note, "card");
    const attachmentSection = attachmentMarkup
        ? `<div class="note__attachments">${attachmentMarkup}</div>`
        : "";
    const codeReferenceMarkup = getCodeReferenceMarkup(note, "card");
    const codeRefSection = codeReferenceMarkup
        ? `<div class="note__code-ref">${codeReferenceMarkup}</div>`
        : "";
    const authorName = escapeHtml(formatUserDisplayName(getCreatedByForDisplay(note.createdBy)));
    const createdAtRelative = note.createdAt ? formatRelativeTime(note.createdAt) : "";
    const createdAtExact = note.createdAt ? formatExactDateTime(note.createdAt) : "";
    const createdAtMarkup = createdAtRelative
        ? `<time class="meta meta--created" datetime="${escapeHtml(note.createdAt)}" title="${escapeHtml(createdAtExact)}">${escapeHtml(createdAtRelative)}</time>`
        : "";
    const noteTypeAttr = typeKey ? ` data-note-type="${typeKey}"` : "";
    const footerMarkup = `
        <div class="note__footer">
            <div class="note__meta-row">
                <span class="note__author"><span aria-hidden="true">\uD83D\uDC64 </span>${authorName}</span>
                ${createdAtMarkup ? `<span class="note__meta-sep" aria-hidden="true">\u00B7</span>${createdAtMarkup}` : ""}
            </div>
        </div>
    `;

    return `
        <article class="note"${noteTypeAttr} data-note-index="${index}" role="button" tabindex="0" aria-label="Open note ${safeTitle}">
            <div class="note__header">
                ${typeBadge}
                <h3 class="note-title">${safeTitle}</h3>
            </div>
            ${descriptionMarkup}
            ${codeRefSection}
            ${tagsMarkup}
            ${attachmentSection}
            ${footerMarkup}
            ${actionButtons}
        </article>
    `;
}

function updateNotesSummary() {
    if (!notesSummaryElement) {
        return;
    }

    const visibleCount = renderedNotes.length;
    const sortLabel = (sortOrderInput?.value || "newest").toLowerCase() === "oldest" ? "Oldest" : "Newest";
    const selectedUser = getSelectedUserFilterValue();
    const segments = [
        `${totalNotes} notes`,
        `Showing ${visibleCount}`
    ];

    if (selectedUser !== "all") {
        segments.push(formatUserDisplayName(selectedUser));
    }

    segments.push(sortLabel);
    const text = segments.join(" • ");
    if (text === lastSummaryText) {
        return;
    }

    lastSummaryText = text;
    notesSummaryElement.textContent = text;
}

function updatePaginationUI() {
    const totalPages = Math.max(1, Math.ceil(totalNotes / pageSize));
    const indicator = `Page ${currentPage} of ${totalPages}`;
    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage * pageSize >= totalNotes;
    const key = `${indicator}|${prevDisabled}|${nextDisabled}`;
    if (key === lastPaginationKey) {
        return;
    }

    lastPaginationKey = key;

    if (pageIndicator) {
        pageIndicator.textContent = indicator;
    }

    if (previousPageButton) {
        previousPageButton.disabled = prevDisabled;
    }

    if (nextPageButton) {
        nextPageButton.disabled = nextDisabled;
    }
}

function getNoteId(note) {
    if (!note || typeof note !== "object") {
        return "";
    }

    return String(note.id ?? note.noteId ?? note.noteID ?? "");
}

function startEditingNote(note) {
    const noteId = getNoteId(note);
    if (!noteId) {
        setStatus("Cannot edit note: missing id.", true);
        return;
    }

    editingNoteId = noteId;
    titleInput.value = note.title || "";
    if (descriptionEditor) {
        descriptionEditor.innerHTML = formatNoteDescriptionHtml(note.description || "");
    }
    typeInput.value = note.type || "";
    tagsInput.value = Array.isArray(note.tags) ? note.tags.join(", ") : "";
    if (createdByInput) {
        createdByInput.value = getCreatedByForDisplay(note.createdBy);
    }
    createdByManuallyEdited = false;
    if (codeFilePathInput) {
        codeFilePathInput.value = note.filePath || "";
    }
    if (codeMethodNameInput) {
        codeMethodNameInput.value = note.methodName || "";
    }
    if (codeLineNumberInput) {
        codeLineNumberInput.value = note.lineNumber ? String(note.lineNumber) : "";
    }
    editingAttachments = getAttachmentPaths(note);
    clearComposerAttachmentFiles();

    submitButton.textContent = "Update Note";
    if (composerTitle) {
        composerTitle.textContent = "Edit Note";
    }
    cancelEditButton?.classList.remove("hidden");
    setStatus("Editing note.");
    closeModal();
    openComposerModal({ preserveValues: true });
}

async function deleteNote(note) {
    const noteId = getNoteId(note);
    if (!noteId) {
        setStatus("Cannot delete note: missing id.", true);
        return;
    }

    if (!window.confirm("Delete this note?")) {
        return;
    }

    setStatus("Deleting note...");
    try {
        await apiRequest(`/devnotes/${encodeURIComponent(noteId)}`, { method: "DELETE" });

        if (editingNoteId === noteId) {
            resetFormState();
        }

        closeModal();
        await refreshActiveDashboard({ soft: false });
        void loadStatistics();
        setStatus("Note deleted.");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete note.";
        setStatus(message, true);
    }
}

function composerFileKey(file) {
    return `${file.name}\0${file.size}\0${file.lastModified}`;
}

function mergeComposerPendingFiles(fileList) {
    const added = Array.from(fileList || []).filter(Boolean);
    if (added.length === 0 || !attachmentInput) {
        return;
    }

    const keys = new Set(composerPendingFiles.map(composerFileKey));
    for (const file of added) {
        const key = composerFileKey(file);
        if (!keys.has(key)) {
            keys.add(key);
            composerPendingFiles.push(file);
        }
    }

    syncAttachmentInputFromPending();
}

function syncAttachmentInputFromPending() {
    if (!attachmentInput) {
        return;
    }

    const dataTransfer = new DataTransfer();
    for (const file of composerPendingFiles) {
        dataTransfer.items.add(file);
    }

    attachmentInput.files = dataTransfer.files;
}

function clearComposerAttachmentFiles() {
    composerPendingFiles = [];
    syncAttachmentInputFromPending();
}

function onComposerAttachmentInputChange() {
    if (!attachmentInput?.files?.length) {
        return;
    }

    mergeComposerPendingFiles(attachmentInput.files);
}

function resetFormState() {
    composerPendingFiles = [];
    noteForm.reset();
    syncAttachmentInputFromPending();
    if (descriptionEditor) {
        descriptionEditor.innerHTML = "";
    }

    editingNoteId = null;
    editingAttachments = [];
    if (codeFilePathInput) {
        codeFilePathInput.value = "";
    }
    if (createdByInput) {
        createdByInput.value = getCreatedBy();
    }
    createdByManuallyEdited = false;
    if (codeMethodNameInput) {
        codeMethodNameInput.value = "";
    }
    if (codeLineNumberInput) {
        codeLineNumberInput.value = "";
    }
    clearCodeFileSuggestions();
    lastFileSuggestionQuery = "";
    submitButton.textContent = "Add Note";
    if (composerTitle) {
        composerTitle.textContent = "Add Note";
    }
    cancelEditButton?.classList.add("hidden");
}

function resetComposerAfterSave() {
    resetFormState();
    if (createdByInput) {
        createdByInput.value = getCreatedBy();
    }
    createdByManuallyEdited = false;
}

function isComposerModalOpen() {
    return composerModal && !composerModal.hidden;
}

function openComposerModal(options = {}) {
    if (!composerModal) {
        return;
    }

    const preserveValues = Boolean(options.preserveValues);
    if (!preserveValues) {
        resetFormState();
        if (createdByInput) {
            // Always repopulate from source-of-truth on open; never reuse stale DOM value.
            createdByInput.value = getCreatedBy();
        }
        createdByManuallyEdited = false;
    }

    if (isComposerModalOpen()) {
        return;
    }

    lastComposerFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    composerModal.hidden = false;
    syncBodyScrollLock();
    titleInput.focus();
}

function closeComposerModal() {
    if (!composerModal) {
        return;
    }

    if (!isComposerModalOpen()) {
        return;
    }

    composerModal.hidden = true;
    syncBodyScrollLock();
    lastComposerFocusedElement?.focus();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function looksLikeHtmlDescription(value) {
    return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function formatNoteDescriptionHtml(description) {
    const raw = String(description || "");
    if (!raw.trim()) {
        return "";
    }

    if (looksLikeHtmlDescription(raw)) {
        return sanitizeDescriptionHtml(raw);
    }

    return escapeHtml(raw).replace(/\r\n|\r|\n/g, "<br>");
}

function sanitizeDescriptionHtml(inputHtml) {
    const template = document.createElement("template");
    template.innerHTML = String(inputHtml || "");

    const sanitizedRoot = document.createElement("div");
    for (const node of template.content.childNodes) {
        const safeNode = sanitizeNode(node);
        if (safeNode) {
            sanitizedRoot.appendChild(safeNode);
        }
    }

    return sanitizedRoot.innerHTML.trim();
}

function sanitizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        return document.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const source = /** @type {Element} */ (node);
    if (blockedDescriptionTags.has(source.tagName)) {
        return null;
    }

    if (source.tagName === "IMG") {
        const src = String(source.getAttribute("src") || "").trim();
        if (!isAllowedImageSource(src)) {
            return null;
        }

        const cleanImage = document.createElement("img");
        cleanImage.setAttribute("src", src);
        cleanImage.setAttribute("alt", source.getAttribute("alt") || "Pasted image");
        cleanImage.setAttribute("loading", "lazy");
        cleanImage.className = source.getAttribute("class") || "description-image";
        return cleanImage;
    }

    const cleanElement = document.createElement(source.tagName.toLowerCase());
    for (const attr of Array.from(source.attributes)) {
        const attrName = attr.name.toLowerCase();
        if (attrName.startsWith("on")) {
            continue;
        }

        if ((source.tagName === "A" && attrName === "href")) {
            const href = String(attr.value || "").trim();
            if (!isAllowedLinkSource(href)) {
                continue;
            }
        }

        cleanElement.setAttribute(attr.name, attr.value);
    }

    for (const child of source.childNodes) {
        const safeChild = sanitizeNode(child);
        if (safeChild) {
            cleanElement.appendChild(safeChild);
        }
    }

    return cleanElement;
}

function stripHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = sanitizeDescriptionHtml(html);
    return template.content.textContent || "";
}

async function handleDescriptionPaste(event) {
    if (!descriptionEditor) {
        return;
    }

    const clipboardData = event.clipboardData;
    if (!clipboardData) {
        return;
    }

    const imageItems = Array.from(clipboardData.items || []).filter((item) => item.type.startsWith("image/"));
    if (imageItems.length === 0) {
        return;
    }

    event.preventDefault();
    setStatus("Uploading pasted image...");

    for (const item of imageItems) {
        const blob = item.getAsFile();
        if (!blob) {
            continue;
        }

        try {
            const imageUrl = await uploadDescriptionImage(blob);
            insertImageAtCaret(imageUrl);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload pasted image.";
            setStatus(message, true);
        }
    }

    // Ensure the editor content never keeps data URLs.
    descriptionEditor.innerHTML = sanitizeDescriptionHtml(descriptionEditor.innerHTML);
}

async function uploadDescriptionImage(fileBlob) {
    const uploadData = new FormData();
    const extension = getImageExtension(fileBlob.type);
    const fileName = `pasted-image-${Date.now()}.${extension}`;
    uploadData.append("file", fileBlob, fileName);

    const uploadResult = await apiRequest("/devnotes/upload", {
        method: "POST",
        body: uploadData
    });

    const imageUrl = String(uploadResult?.filePath || uploadResult?.fileUrl || "").trim();
    if (!imageUrl) {
        throw new Error("Image upload did not return a file URL.");
    }

    return imageUrl;
}

function insertImageAtCaret(imageUrl) {
    if (!descriptionEditor) {
        return;
    }

    const safeUrl = escapeHtml(imageUrl);
    const imageMarkup = `<p><img src="${safeUrl}" alt="Pasted image" loading="lazy" class="description-image" /></p>`;
    descriptionEditor.focus();
    document.execCommand("insertHTML", false, imageMarkup);
}

function getImageExtension(mimeType) {
    if (mimeType === "image/png") {
        return "png";
    }
    if (mimeType === "image/jpeg") {
        return "jpg";
    }
    if (mimeType === "image/gif") {
        return "gif";
    }
    if (mimeType === "image/webp") {
        return "webp";
    }

    return "png";
}

function isAllowedImageSource(source) {
    const value = String(source || "").trim();
    if (!value) {
        return false;
    }

    if (value.startsWith("data:")) {
        return false;
    }

    if (value.startsWith("/")) {
        return true;
    }

    try {
        const parsed = new URL(value, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function isAllowedLinkSource(value) {
    const href = String(value || "").trim();
    if (!href) {
        return false;
    }

    if (href.startsWith("/") || href.startsWith("#")) {
        return true;
    }

    try {
        const parsed = new URL(href, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:";
    } catch {
        return false;
    }
}

function isNoteModalOpen() {
    return noteModal && !noteModal.hidden;
}

function openModal(note) {
    if (!noteModal || !modalTitle || !modalDescription || !modalType || !modalTags || !modalCreatedBy || !modalCreated || !modalAttachment) {
        return;
    }

    const asGuide = isCodeGuideMode();
    guideModalPresentation = asGuide;
    noteModal.classList.toggle("note-modal--code-guide", asGuide);

    if (asGuide) {
        selectedGuideNoteId = getNoteId(note);
        updateGuideSelectionHighlights();
    }

    const title = note.title || "Untitled";
    const type = formatTypeLabel(note.type) || "N/A";
    const tags = Array.isArray(note.tags) && note.tags.length > 0
        ? note.tags.map((tag) => `#${String(tag).trim()}`).join(" ")
        : (asGuide ? "" : "N/A");
    const createdBy = formatUserDisplayName(getCreatedByForDisplay(note.createdBy));
    const createdAtRelative = note.createdAt ? formatRelativeTime(note.createdAt) : "N/A";
    const createdAtExact = note.createdAt ? formatExactDateTime(note.createdAt) : "";

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalTitle.textContent = title;
    activeModalNote = note;

    for (const section of notesOnlyModalSections) {
        if (section instanceof HTMLElement) {
            section.classList.toggle("hidden", asGuide);
        }
    }
    modalGuideLearning?.classList.toggle("hidden", !asGuide);

    if (asGuide) {
        const plain = getGuidePlainDescription(note);
        const parsed = parseGuideExplanation(plain);
        const details = getCodeReferenceDetails(note);

        if (modalGuideSections) {
            modalGuideSections.innerHTML = renderGuideLearningSectionsMarkup(parsed);
        }
        if (modalGuideWhere) {
            // Location already shows file + method + line; avoid duplicating Method below.
            modalGuideWhere.innerHTML = formatGuideLocationMarkup(details);
        }
        if (modalGuideMethodBlock) {
            modalGuideMethodBlock.classList.add("hidden");
        }
        if (modalGuideTagsBlock && modalGuideTags) {
            const tagList = Array.isArray(note.tags)
                ? note.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
                : [];
            modalGuideTagsBlock.classList.toggle("hidden", tagList.length === 0);
            modalGuideTags.innerHTML = tagList
                .map((tag) => `<span class="guide-tag">${escapeHtml(tag)}</span>`)
                .join("");
        }
        if (modalGuideSecondaryType) {
            modalGuideSecondaryType.textContent = `Type: ${type}`;
        }
        if (modalGuideSecondaryCreatedBy) {
            modalGuideSecondaryCreatedBy.textContent = `Created by ${createdBy}`;
        }
        if (modalGuideSecondaryCreated) {
            modalGuideSecondaryCreated.textContent = createdAtRelative === "N/A"
                ? "Created: Unknown"
                : `Created ${createdAtRelative}`;
            if (note.createdAt) {
                modalGuideSecondaryCreated.setAttribute("title", createdAtExact);
            } else {
                modalGuideSecondaryCreated.removeAttribute("title");
            }
        }
        if (modalGuideSecondary instanceof HTMLDetailsElement) {
            modalGuideSecondary.open = false;
        }

        // Keep View Code available in guide mode via a small action near location if needed.
        if (modalViewCodeButton && modalGuideWhereBlock) {
            const canViewCode = Boolean(details.filePath);
            if (canViewCode) {
                modalViewCodeButton.classList.remove("hidden");
                modalViewCodeButton.disabled = false;
                if (!modalGuideWhereBlock.contains(modalViewCodeButton)) {
                    modalGuideWhereBlock.append(modalViewCodeButton);
                }
            } else {
                modalViewCodeButton.classList.add("hidden");
                modalViewCodeButton.disabled = true;
            }
        }
    } else {
        if (modalDescriptionTitle) {
            modalDescriptionTitle.textContent = "Description";
        }
        if (modalMetadataTitle) {
            modalMetadataTitle.textContent = "Metadata";
        }
        if (modalCodeReferenceTitle) {
            modalCodeReferenceTitle.textContent = "Code Reference";
        }

        const modalDescriptionHtml = formatNoteDescriptionHtml(note.description || "");
        const hasModalDescription = Boolean(stripHtml(modalDescriptionHtml).trim());
        modalDescription.innerHTML = hasModalDescription ? modalDescriptionHtml : "";
        modalDescription.closest(".modal-section--description")?.classList.toggle("hidden", !hasModalDescription);

        const codeReference = getCodeReferenceDetails(note);
        const hasCodeReference = Boolean(codeReference.filePath || codeReference.methodName || codeReference.lineNumber);
        if (modalCodeReferenceSection && modalCodeFile && modalCodeMethod && modalCodeLine) {
            modalCodeReferenceSection.classList.toggle("hidden", !hasCodeReference);
            if (codeReference.filePath) {
                const fileName = getFileBaseName(codeReference.filePath);
                modalCodeFile.innerHTML = `<span class="modal-code-reference__icon" aria-hidden="true">\uD83D\uDCC4</span> <strong>${escapeHtml(fileName)}</strong>`;
            } else {
                modalCodeFile.innerHTML = "";
            }

            modalCodeMethod.textContent = codeReference.methodName
                ? `${codeReference.methodName}()`
                : "";
            modalCodeLine.textContent = codeReference.lineNumber
                ? `Line ${codeReference.lineNumber}`
                : "";
        }

        if (modalViewCodeButton) {
            const codeRefSection = document.getElementById("modal-code-reference");
            if (codeRefSection && !codeRefSection.contains(modalViewCodeButton)) {
                codeRefSection.append(modalViewCodeButton);
            }
            const canViewCode = Boolean(codeReference.filePath);
            modalViewCodeButton.classList.toggle("hidden", !canViewCode);
            modalViewCodeButton.disabled = !canViewCode;
        }

        const hasAttachment = getAttachmentPaths(note).length > 0;
        const attachmentMarkup = hasAttachment ? getAttachmentMarkup(note, "modal") : "";
        modalAttachment.innerHTML = attachmentMarkup;
        if (modalAttachmentsSection) {
            modalAttachmentsSection.classList.toggle("hidden", !hasAttachment);
        }
        modalType.textContent = type;
        modalType.classList.remove("hidden");
        modalTags.textContent = tags || "N/A";
        modalCreatedBy.textContent = `Created by ${createdBy}`;
        modalCreatedBy.classList.remove("hidden");
        modalCreated.textContent = createdAtRelative;
        modalCreated.classList.remove("hidden");
        if (note.createdAt) {
            modalCreated.setAttribute("title", createdAtExact);
            modalCreated.setAttribute("datetime", note.createdAt);
        } else {
            modalCreated.removeAttribute("title");
            modalCreated.removeAttribute("datetime");
        }
        const typeKey = getNoteTypeKey(note.type);
        for (const cls of ["type-bug", "type-idea", "type-task", "type-code"]) {
            modalType.classList.remove(cls);
        }
        if (typeKey) {
            modalType.classList.add(`type-${typeKey}`);
        }
    }

    modalCodeGuideActions?.classList.toggle("hidden", !asGuide);
    noteModal.hidden = false;
    syncBodyScrollLock();
    if (asGuide && modalEditButton) {
        modalEditButton.focus();
    } else {
        modalCloseButton?.focus();
    }
}

function closeModal() {
    if (!noteModal) {
        return;
    }

    if (!isNoteModalOpen()) {
        return;
    }

    noteModal.hidden = true;
    activeModalNote = null;
    guideModalPresentation = false;
    noteModal.classList.remove("note-modal--code-guide");
    closeImageZoom({ immediate: true });
    syncBodyScrollLock();
    lastFocusedElement?.focus();
}

function dedupeAttachmentPaths(paths) {
    const seen = new Set();
    const out = [];
    for (const p of paths) {
        const key = p.toLowerCase();
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        out.push(p);
    }

    return out;
}

function getAttachmentPaths(note) {
    const paths = [];
    if (Array.isArray(note?.attachments)) {
        for (const p of note.attachments) {
            const t = String(p || "").trim();
            if (t) {
                paths.push(t);
            }
        }
    }

    if (paths.length > 0) {
        return dedupeAttachmentPaths(paths);
    }

    const legacy = getLegacyAttachmentPath(note);
    return legacy ? [legacy] : [];
}

function getAttachmentPath(note) {
    const paths = getAttachmentPaths(note);
    return paths.length > 0 ? paths[0] : "";
}

function getLegacyAttachmentPath(note) {
    const attachment = typeof note?.attachment === "string" ? note.attachment.trim() : "";
    if (attachment) {
        return attachment;
    }

    // Backward compatibility: legacy notes stored attachment path in filePath.
    const filePath = String(note?.filePath || "").trim();
    const hasCodeMethod = String(note?.methodName || "").trim().length > 0;
    const lineNumberValue = Number(note?.lineNumber);
    const hasCodeLine = Number.isInteger(lineNumberValue) && lineNumberValue > 0;
    if (!hasCodeMethod && !hasCodeLine && isLikelyAttachmentPath(filePath)) {
        return filePath;
    }

    return "";
}

function getOneAttachmentBlockMarkup(path, view) {
    if (isImageFile(path)) {
        const imageClass = view === "modal" ? "modal-attachment-image" : "note-attachment-image";
        return `
            <div class="attachment-block attachment-block--image">
                <img src="${escapeHtml(path)}" alt="Uploaded note image" class="${imageClass}" loading="lazy" />
            </div>
        `;
    }

    if (view === "card") {
        return "";
    }

    const label = attachmentFileLabel(path);
    return `
        <div class="attachment-block attachment-block--file">
            <a href="${escapeHtml(path)}" data-attachment-link target="_blank" rel="noopener noreferrer">Download ${escapeHtml(label)}</a>
        </div>
    `;
}

function attachmentFileLabel(path) {
    try {
        const u = new URL(path, window.location.origin);
        const last = u.pathname.split("/").filter(Boolean).pop();
        return last || "attachment";
    } catch {
        const parts = String(path || "").split(/[/\\]/);
        return parts.pop() || "attachment";
    }
}

function getAttachmentCardMarkup(paths) {
    const images = paths.filter((p) => isImageFile(p));
    const files = paths.filter((p) => !isImageFile(p));
    const maxThumbs = 3;
    let html = "";

    for (let i = 0; i < Math.min(images.length, maxThumbs); i++) {
        html += getOneAttachmentBlockMarkup(images[i], "card");
    }

    const extra = images.length - maxThumbs;
    if (extra > 0) {
        html += `<div class="attachment-block attachment-block--more" aria-label="${extra} more images">+${extra}</div>`;
    }

    for (const f of files) {
        html += getOneAttachmentBlockMarkup(f, "card");
    }

    if (!html) {
        return "";
    }

    return `<div class="note-attachments-row">${html}</div>`;
}

function getAttachmentMarkup(note, view) {
    const paths = getAttachmentPaths(note);
    if (paths.length === 0) {
        return "";
    }

    if (view === "modal") {
        return paths.map((path) => getOneAttachmentBlockMarkup(path, "modal")).join("");
    }

    return getAttachmentCardMarkup(paths);
}

function getCodeReferenceMarkup(note, view = "default") {
    const parts = getCodeReferenceParts(note);
    if (!parts) {
        return "";
    }

    const href = getCodeReferenceLinkHref(note);
    const targetAttributes = href !== "#"
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
    const ariaLabel = `View code reference: ${parts.ariaLabel}`;
    const modifierClass = view === "card" ? " meta--code-reference--compact" : "";

    if (view === "card") {
        return `<a class="meta meta--code-reference${modifierClass}" data-code-reference-link href="${escapeHtml(href)}" aria-label="${escapeHtml(ariaLabel)}"${targetAttributes}>${escapeHtml(parts.compact)}</a>`;
    }

    return `<a class="meta meta--code-reference" data-code-reference-link href="${escapeHtml(href)}" aria-label="${escapeHtml(ariaLabel)}"${targetAttributes}><span class="note__code-file-line">${escapeHtml(parts.fileLine)}</span><span class="note__code-meta-line">${escapeHtml(parts.metaLine)}</span></a>`;
}

function getCodeReferenceParts(note) {
    const { filePath, methodName, lineNumber } = getCodeReferenceDetails(note);
    const lineNumberValue = Number(lineNumber);
    const hasLine = Number.isInteger(lineNumberValue) && lineNumberValue > 0;
    if (!filePath && !methodName && !hasLine) {
        return null;
    }

    const fileName = filePath ? getFileBaseName(filePath) : "";
    const compactParts = [];
    if (fileName) {
        compactParts.push(fileName);
    }
    if (methodName) {
        compactParts.push(`${methodName}()`);
    }
    if (hasLine) {
        compactParts.push(`L${lineNumberValue}`);
    }

    const metaParts = [];
    if (methodName) {
        metaParts.push(`${methodName}()`);
    }
    if (hasLine) {
        metaParts.push(`Line ${lineNumberValue}`);
    }

    return {
        fileLine: fileName ? `\uD83D\uDCC4 ${fileName}` : "",
        metaLine: metaParts.join(" \u00B7 "),
        compact: compactParts.length > 0 ? `\uD83D\uDCC4 ${compactParts.join(" \u00B7 ")}` : "",
        ariaLabel: [fileName, methodName ? `${methodName}()` : "", hasLine ? `Line ${lineNumberValue}` : ""].filter(Boolean).join(", ")
    };
}

function formatCodeReference(note, view = "default") {
    const parts = getCodeReferenceParts(note);
    if (!parts) {
        return "";
    }

    if (view === "card") {
        return parts.compact;
    }

    return [parts.fileLine, parts.metaLine].filter(Boolean).join("\n");
}

function getCodeReferenceDetails(note) {
    const rawFilePath = String(note?.filePath || "").trim();
    const methodName = String(note?.methodName || "").trim();
    const lineNumberValue = Number(note?.lineNumber);
    const lineNumber = Number.isInteger(lineNumberValue) && lineNumberValue > 0
        ? lineNumberValue
        : null;
    const attachmentPaths = getAttachmentPaths(note);
    const rawLower = rawFilePath.toLowerCase();
    const filePath = attachmentPaths.some((p) => p.toLowerCase() === rawLower) ? "" : rawFilePath;

    return { filePath, methodName, lineNumber };
}

function isLikelyAttachmentPath(path) {
    const value = String(path || "").trim();
    if (!value) {
        return false;
    }

    const normalized = value.toLowerCase();
    if (normalized.includes("/uploads/") || normalized.includes("\\uploads\\")) {
        return true;
    }

    return normalized.endsWith(".png") ||
        normalized.endsWith(".jpg") ||
        normalized.endsWith(".jpeg") ||
        normalized.endsWith(".gif") ||
        normalized.endsWith(".webp") ||
        normalized.endsWith(".pdf") ||
        normalized.endsWith(".txt");
}

function getCodeReferenceLinkHref(note) {
    const filePath = String(note?.filePath || "").trim();
    if (!filePath) {
        return "#";
    }

    try {
        const parsed = new URL(filePath, window.location.origin);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.href;
        }
    } catch {
        return "#";
    }

    return "#";
}

function isImageFile(path) {
    const cleanPath = String(path || "").toLowerCase().split("?")[0].split("#")[0];
    return cleanPath.endsWith(".png") || cleanPath.endsWith(".jpg") || cleanPath.endsWith(".jpeg");
}

function openImageZoom(imageUrl) {
    if (!imageUrl) {
        return;
    }

    closeImageZoom({ immediate: true });

    imageLightboxReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const overlay = document.createElement("div");
    overlay.className = "image-zoom-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image preview");

    const backdrop = document.createElement("div");
    backdrop.className = "image-zoom-backdrop";

    const stage = document.createElement("div");
    stage.className = "image-zoom-stage";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "image-zoom-close";
    closeButton.setAttribute("aria-label", "Close image preview");
    closeButton.innerHTML = `<svg class="image-zoom-close__icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

    const zoomedImage = document.createElement("img");
    zoomedImage.src = imageUrl;
    zoomedImage.alt = "Zoomed note attachment";
    zoomedImage.className = "image-zoom-content";
    zoomedImage.decoding = "async";

    backdrop.addEventListener("click", () => {
        closeImageZoom();
    });
    closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        closeImageZoom();
    });

    stage.append(zoomedImage);
    overlay.append(backdrop, stage, closeButton);
    document.body.append(overlay);
    imageZoomOverlay = overlay;
    syncBodyScrollLock();
    closeButton.focus();
}

function restoreImageLightboxFocus() {
    const previous = imageLightboxReturnFocus;
    imageLightboxReturnFocus = null;
    if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus({ preventScroll: true });
    }
}

function closeImageZoom(options = {}) {
    if (!imageZoomOverlay) {
        return;
    }

    if (imageZoomCloseTimerId) {
        window.clearTimeout(imageZoomCloseTimerId);
        imageZoomCloseTimerId = 0;
    }

    const immediate = options.immediate === true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (immediate || reduceMotion) {
        imageZoomOverlay.remove();
        imageZoomOverlay = null;
        syncBodyScrollLock();
        restoreImageLightboxFocus();
        return;
    }

    if (imageZoomOverlay.dataset.closing === "true") {
        return;
    }

    imageZoomOverlay.dataset.closing = "true";
    imageZoomOverlay.classList.add("image-zoom-overlay--closing");
    imageZoomCloseTimerId = window.setTimeout(() => {
        imageZoomCloseTimerId = 0;
        if (imageZoomOverlay) {
            imageZoomOverlay.remove();
            imageZoomOverlay = null;
        }
        syncBodyScrollLock();
        restoreImageLightboxFocus();
    }, 240);
}

function syncBodyScrollLock() {
    const shouldLock = isNoteModalOpen() || isComposerModalOpen() || isImportModalOpen() || isCodeGuideExportModalOpen() || isScanModalOpen() || isGuideHelpModalOpen() || isCodePreviewModalOpen() || imageZoomOverlay;
    document.body.style.overflow = shouldLock ? "hidden" : "";
}

function isScanModalOpen() {
    return scanModal && !scanModal.hidden;
}

function isGuideHelpModalOpen() {
    return guideHelpModal && !guideHelpModal.hidden;
}

let lastGuideHelpFocusedElement = null;

function openGuideHelpModal() {
    if (!guideHelpModal) {
        return;
    }

    lastGuideHelpFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    guideHelpModal.hidden = false;
    syncBodyScrollLock();
    guideHelpCloseButton?.focus();
}

function closeGuideHelpModal() {
    if (!guideHelpModal || !isGuideHelpModalOpen()) {
        return;
    }

    guideHelpModal.hidden = true;
    syncBodyScrollLock();
    lastGuideHelpFocusedElement?.focus();
}

function isCodePreviewModalOpen() {
    return codePreviewModal && !codePreviewModal.hidden;
}

function getFileBaseName(filePath) {
    const normalized = String(filePath || "").replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : normalized;
}

function setCodePreviewLoading(message) {
    if (codePreviewStatus) {
        codePreviewStatus.textContent = message;
        codePreviewStatus.classList.remove("hidden");
    }

    if (codePreviewBody) {
        codePreviewBody.hidden = true;
    }

    if (codePreviewCopyButton) {
        codePreviewCopyButton.disabled = true;
    }

    if (codePreviewOpenVscodeLink) {
        codePreviewOpenVscodeLink.classList.add("hidden");
        codePreviewOpenVscodeLink.removeAttribute("href");
    }
}

function setCodePreviewError(message) {
    activeCodePreviewPayload = null;
    setCodePreviewLoading(message);
}

function renderCodePreview(preview) {
    activeCodePreviewPayload = preview;
    const lines = Array.isArray(preview?.lines) ? preview.lines : [];
    const gutterWidth = Math.max(2, String(preview?.endLine || lines.length || 1).length);

    if (codePreviewTitle) {
        codePreviewTitle.textContent = getFileBaseName(preview?.filePath || "");
    }

    if (codePreviewCode) {
        codePreviewCode.innerHTML = lines.map((line) => {
            const lineNumber = Number(line?.number) || 0;
            const isHighlight = Boolean(line?.highlight);
            const gutter = String(lineNumber).padStart(gutterWidth, " ");
            const marker = isHighlight ? "&gt;" : " ";
            const content = escapeHtml(String(line?.content ?? ""));
            return `<div class="code-preview-line${isHighlight ? " code-preview-line--highlight" : ""}"><span class="code-preview-line__gutter" aria-hidden="true">${gutter} ${marker}</span><span class="code-preview-line__content">${content || " "}</span></div>`;
        }).join("");
    }

    if (codePreviewStatus) {
        codePreviewStatus.textContent = "";
        codePreviewStatus.classList.add("hidden");
    }

    if (codePreviewBody) {
        codePreviewBody.hidden = lines.length === 0;
    }

    if (codePreviewCopyButton) {
        codePreviewCopyButton.disabled = lines.length === 0;
    }

    const openUrl = String(preview?.openUrl || "").trim();
    if (codePreviewOpenVscodeLink) {
        if (openUrl) {
            codePreviewOpenVscodeLink.href = openUrl;
            codePreviewOpenVscodeLink.classList.remove("hidden");
        } else {
            codePreviewOpenVscodeLink.classList.add("hidden");
            codePreviewOpenVscodeLink.removeAttribute("href");
        }
    }
}

async function openCodePreview(note) {
    const sourceNote = note || activeModalNote;
    if (!sourceNote || !codePreviewModal) {
        return;
    }

    const { filePath, lineNumber } = getCodeReferenceDetails(sourceNote);
    if (!filePath) {
        return;
    }

    codePreviewModal.hidden = false;
    syncBodyScrollLock();
    setCodePreviewLoading("Loading code preview...");
    codePreviewCloseButton?.focus();

    const params = new URLSearchParams({ file: filePath });
    if (lineNumber) {
        params.set("line", String(lineNumber));
    }

    try {
        const payload = await apiRequest(`/devnotes/code?${params.toString()}`);
        if (!payload || typeof payload !== "object") {
            setCodePreviewError("Unable to load code preview.");
            return;
        }

        if ("error" in payload && payload.error) {
            setCodePreviewError(String(payload.error));
            return;
        }

        renderCodePreview(payload);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load code preview.";
        setCodePreviewError(message);
    }
}

function closeCodePreviewModal() {
    if (!codePreviewModal || codePreviewModal.hidden) {
        return;
    }

    codePreviewModal.hidden = true;
    activeCodePreviewPayload = null;
    if (codePreviewCode) {
        codePreviewCode.innerHTML = "";
    }

    syncBodyScrollLock();
}

async function copyCodePreview() {
    const lines = Array.isArray(activeCodePreviewPayload?.lines) ? activeCodePreviewPayload.lines : [];
    if (lines.length === 0) {
        return;
    }

    const text = lines.map((line) => String(line?.content ?? "")).join("\n");
    try {
        await navigator.clipboard.writeText(text);
        setStatus("Code copied to clipboard.");
    } catch {
        setStatus("Unable to copy code.");
    }
}

modalViewCodeButton?.addEventListener("click", () => {
    if (activeModalNote) {
        openCodePreview(activeModalNote);
    }
});

codePreviewCloseButton?.addEventListener("click", closeCodePreviewModal);
codePreviewCopyButton?.addEventListener("click", () => {
    copyCodePreview();
});

codePreviewModal?.addEventListener("click", (event) => {
    if (event.target === codePreviewModal) {
        closeCodePreviewModal();
    }
});

function isImportModalOpen() {
    return importModal && !importModal.hidden;
}

function getScanMarkerLabel(item) {
    const tag = Array.isArray(item?.tags) && item.tags.length > 0 ? String(item.tags[0]) : "";
    if (tag) {
        return tag.toUpperCase();
    }

    const type = String(item?.type || "").toLowerCase();
    if (type === "bug") {
        return "BUG";
    }

    if (type === "idea") {
        return "IDEA";
    }

    if (type === "code") {
        return "DEVNOTE";
    }

    return "TODO";
}

function getScanMarkerClass(item) {
    const type = String(item?.type || "task").toLowerCase();
    if (type === "bug") {
        return "scan-result-item__marker--bug";
    }

    if (type === "idea") {
        return "scan-result-item__marker--idea";
    }

    if (type === "code") {
        return "scan-result-item__marker--code";
    }

    return "scan-result-item__marker--task";
}

function renderScanResults(items) {
    if (!scanResultsElement) {
        return;
    }

    if (!Array.isArray(items) || items.length === 0) {
        scanResultsElement.innerHTML = `<p class="scan-results-empty">No developer comments found.</p>`;
        return;
    }

    scanResultsElement.innerHTML = items.map((item, index) => {
        const marker = escapeHtml(getScanMarkerLabel(item));
        const markerClass = getScanMarkerClass(item);
        const title = escapeHtml(item.title || "Untitled");
        const filePath = escapeHtml(item.filePath || "");
        const lineNumber = Number(item.lineNumber) > 0 ? Number(item.lineNumber) : "";
        const descriptionPreview = getGuideDescriptionPreview(item);
        const descriptionMarkup = descriptionPreview.empty
            ? ""
            : `<div class="scan-result-item__description">${escapeHtml(descriptionPreview.text)}</div>`;
        return `
            <label class="scan-result-item" role="listitem" data-scan-index="${index}">
                <input class="scan-result-item__checkbox" type="checkbox" data-scan-select checked />
                <div class="scan-result-item__content">
                    <div class="scan-result-item__header">
                        <span class="scan-result-item__marker ${markerClass}">${marker}</span>
                        <span class="scan-result-item__title">${title}</span>
                    </div>
                    ${descriptionMarkup}
                    <div class="scan-result-item__location">${filePath}${lineNumber ? ` : ${lineNumber}` : ""}</div>
                </div>
            </label>
        `;
    }).join("");
}

function updateScanImportButtonState() {
    if (!scanImportButton) {
        return;
    }

    const selectedCount = scanResultsElement
        ? scanResultsElement.querySelectorAll("[data-scan-select]:checked").length
        : 0;

    scanImportButton.disabled = selectedCount === 0;
}

function openScanModal() {
    if (!scanModal) {
        return;
    }

    scanModal.hidden = false;
    syncBodyScrollLock();
}

function closeScanModal() {
    if (!scanModal || scanModal.hidden) {
        return;
    }

    scanFetchController?.abort();
    scanFetchController = null;
    scanModal.hidden = true;
    syncBodyScrollLock();
}

function setScanLoadingState(isLoading) {
    if (isLoading && scanSummaryElement) {
        scanSummaryElement.textContent = "Scanning project...";
    }

    if (isLoading && scanResultsElement) {
        scanResultsElement.innerHTML = `<p class="scan-results-empty">Scanning source files...</p>`;
    }

    if (scanImportButton) {
        scanImportButton.disabled = isLoading;
    }

    if (scanProjectButton) {
        scanProjectButton.disabled = isLoading;
    }
}

async function runProjectScan() {
    openScanModal();
    setScanLoadingState(true);

    if (scanWarningElement) {
        scanWarningElement.textContent = "";
        scanWarningElement.classList.add("hidden");
    }

    scanFetchController?.abort();
    const fetchController = new AbortController();
    scanFetchController = fetchController;

    try {
        const response = await fetch("/devnotes/scan", {
            method: "POST",
            headers: { Accept: "application/json" },
            signal: fetchController.signal
        });

        let payload = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            payload = await response.json();
        }

        if (!response.ok) {
            const message = payload && typeof payload === "object" && "error" in payload
                ? String(payload.error)
                : "Scan failed.";
            throw new Error(message);
        }

        scanResults = Array.isArray(payload?.items) ? payload.items : [];
        const totalFound = Number.isFinite(payload?.totalFound) ? payload.totalFound : scanResults.length;

        if (scanSummaryElement) {
            const label = totalFound === 1 ? "developer comment" : "developer comments";
            scanSummaryElement.textContent = `Found ${totalFound} ${label}`;
        }

        if (scanWarningElement) {
            const warning = typeof payload?.warning === "string" ? payload.warning.trim() : "";
            if (warning) {
                scanWarningElement.textContent = warning;
                scanWarningElement.classList.remove("hidden");
            } else {
                scanWarningElement.textContent = "";
                scanWarningElement.classList.add("hidden");
            }
        }

        renderScanResults(scanResults);
        updateScanImportButtonState();
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        const message = error instanceof Error ? error.message : "Scan failed.";
        if (scanSummaryElement) {
            scanSummaryElement.textContent = message;
        }

        if (scanResultsElement) {
            scanResultsElement.innerHTML = `<p class="scan-results-empty">${escapeHtml(message)}</p>`;
        }
    } finally {
        if (scanFetchController === fetchController) {
            scanFetchController = null;
        }

        setScanLoadingState(false);
        if (scanProjectButton) {
            scanProjectButton.disabled = false;
        }
    }
}

async function importSelectedScanResults() {
    if (!scanResultsElement) {
        return;
    }

    const selectedItems = [];
    const rows = scanResultsElement.querySelectorAll("[data-scan-index]");
    rows.forEach((row) => {
        const checkbox = row.querySelector("[data-scan-select]");
        if (!(checkbox instanceof HTMLInputElement) || !checkbox.checked) {
            return;
        }

        const index = Number.parseInt(row.getAttribute("data-scan-index") || "", 10);
        const item = scanResults[index];
        if (!item || !item.filePath || !(Number(item.lineNumber) > 0)) {
            return;
        }

        selectedItems.push({
            filePath: String(item.filePath),
            lineNumber: Number(item.lineNumber)
        });
    });

    if (selectedItems.length === 0) {
        setStatus("Select at least one scanned comment.", true);
        return;
    }

    if (scanImportButton) {
        scanImportButton.disabled = true;
    }

    setStatus("Importing scanned notes...");

    try {
        const payload = await apiRequest("/devnotes/scan/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: selectedItems })
        });

        closeScanModal();
        currentPage = 1;
        await refreshActiveDashboard({ soft: false });
        await loadStatistics();

        const created = Number(payload?.created) || 0;
        const skipped = Number(payload?.skipped) || 0;
        const updated = Number(payload?.updated) || 0;
        let successMessage = `${created} note${created === 1 ? "" : "s"} imported`;
        if (updated > 0) {
            successMessage += `, ${updated} updated`;
        }
        if (skipped > 0) {
            successMessage += `, ${skipped} duplicate${skipped === 1 ? "" : "s"} skipped`;
        }
        successMessage += ".";

        setStatus(successMessage, false, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Scan import failed.";
        setStatus(message, true);
        updateScanImportButtonState();
    } finally {
        updateScanImportButtonState();
    }
}

function openImportModal() {
    if (!importModal) {
        return;
    }

    if (importForm) {
        importForm.reset();
        const mergeRadio = importForm.querySelector('input[name="import-mode"][value="merge"]');
        if (mergeRadio instanceof HTMLInputElement) {
            mergeRadio.checked = true;
        }
    }

    lastImportModalFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    importModal.hidden = false;
    syncBodyScrollLock();
    importFileInput?.focus();
}

function closeImportModal() {
    if (!importModal || importModal.hidden) {
        return;
    }

    importModal.hidden = true;
    syncBodyScrollLock();
    lastImportModalFocusedElement?.focus();
}

let lastCodeGuideExportFocusedElement = null;

function isCodeGuideExportModalOpen() {
    return codeGuideExportModal && !codeGuideExportModal.hidden;
}

function getGuideExportFilePaths() {
    const paths = Array.from(new Set(
        (codeGuideSourceNotes || [])
            .filter((note) => isCodeGuideAnnotation(note))
            .map((note) => normalizeGuidePath(getCodeReferenceDetails(note).filePath))
            .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return paths;
}

function getSelectedCodeGuideExportScope() {
    const selected = codeGuideExportForm?.querySelector('input[name="code-guide-export-scope"]:checked');
    if (selected instanceof HTMLInputElement) {
        return selected.value || "entireProject";
    }

    return "entireProject";
}

function syncCodeGuideExportScopeUi() {
    const scope = getSelectedCodeGuideExportScope();
    const showFiles = scope === "currentFile" || scope === "selectedFiles";
    codeGuideExportFilesPanel?.classList.toggle("hidden", !showFiles);

    if (!showFiles || !codeGuideExportFiles) {
        return;
    }

    const paths = getGuideExportFilePaths();
    const currentFile = String(guideFilterFile?.value || "all");
    const allowMultiple = scope === "selectedFiles";

    if (paths.length === 0) {
        codeGuideExportFiles.innerHTML = `<p class="field-hint">No Code Guide files available yet.</p>`;
        return;
    }

    codeGuideExportFiles.innerHTML = paths.map((path) => {
        const checked = scope === "currentFile"
            ? (currentFile !== "all" && currentFile === path)
            : true;
        const inputType = allowMultiple ? "checkbox" : "radio";
        const name = allowMultiple ? "code-guide-export-file" : "code-guide-export-file-single";
        return `
            <label class="code-guide-export-file-option">
                <input type="${inputType}" name="${name}" value="${escapeHtml(path)}" ${checked ? "checked" : ""} />
                <span class="code-guide-export-file-option__path">${escapeHtml(path)}</span>
            </label>
        `;
    }).join("");

    if (scope === "currentFile" && currentFile === "all") {
        const first = codeGuideExportFiles.querySelector('input[type="radio"]');
        if (first instanceof HTMLInputElement) {
            first.checked = true;
        }
    }
}

function getSelectedCodeGuideExportFilePaths() {
    const scope = getSelectedCodeGuideExportScope();
    if (scope === "entireProject") {
        return [];
    }

    if (scope === "currentFile") {
        const selected = codeGuideExportFiles?.querySelector('input[name="code-guide-export-file-single"]:checked');
        if (selected instanceof HTMLInputElement && selected.value) {
            return [selected.value];
        }

        const filterValue = String(guideFilterFile?.value || "all");
        return filterValue !== "all" ? [filterValue] : [];
    }

    return Array.from(codeGuideExportFiles?.querySelectorAll('input[name="code-guide-export-file"]:checked') || [])
        .filter((input) => input instanceof HTMLInputElement)
        .map((input) => input.value)
        .filter(Boolean);
}

function openCodeGuideExportModal() {
    if (!codeGuideExportModal) {
        return;
    }

    if (codeGuideExportForm) {
        const entire = codeGuideExportForm.querySelector('input[name="code-guide-export-scope"][value="entireProject"]');
        if (entire instanceof HTMLInputElement) {
            entire.checked = true;
        }
    }

    syncCodeGuideExportScopeUi();
    lastCodeGuideExportFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    codeGuideExportModal.hidden = false;
    syncBodyScrollLock();
    codeGuideExportSubmitButton?.focus();
}

function closeCodeGuideExportModal() {
    if (!codeGuideExportModal || codeGuideExportModal.hidden) {
        return;
    }

    codeGuideExportModal.hidden = true;
    syncBodyScrollLock();
    lastCodeGuideExportFocusedElement?.focus();
}

async function exportCodeGuidePdf(event) {
    event?.preventDefault?.();

    const scope = getSelectedCodeGuideExportScope();
    const filePaths = getSelectedCodeGuideExportFilePaths();

    if ((scope === "currentFile" || scope === "selectedFiles") && filePaths.length === 0) {
        setStatus(scope === "currentFile"
            ? "Select a file to export."
            : "Select at least one file to export.", true);
        return;
    }

    if (codeGuideExportSubmitButton) {
        codeGuideExportSubmitButton.disabled = true;
    }

    try {
        setStatus("Generating Code Guide PDF...");
        const response = await fetch("/devnotes/code-guide/export.pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/pdf"
            },
            body: JSON.stringify({
                scope,
                filePaths
            })
        });

        const contentType = response.headers.get("content-type") || "";
        if (!response.ok) {
            let message = "Failed to generate Code Guide PDF.";
            if (contentType.includes("application/json")) {
                const payload = await response.json().catch(() => null);
                if (payload?.error) {
                    message = String(payload.error);
                }
            }
            throw new Error(message);
        }

        const blob = await response.blob();
        const disposition = response.headers.get("content-disposition") || "";
        const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
        const fileName = fileNameMatch?.[1] || `code-guide-${new Date().toISOString().slice(0, 10)}.pdf`;
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        link.rel = "noopener";
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        closeCodeGuideExportModal();
        setStatus("Code Guide PDF downloaded.", false, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to generate Code Guide PDF.";
        setStatus(message, true);
    } finally {
        if (codeGuideExportSubmitButton) {
            codeGuideExportSubmitButton.disabled = false;
        }
    }
}

async function exportDevNotes() {
    try {
        setStatus("Preparing export...");
        const response = await fetch("/devnotes/export", {
            headers: { Accept: "application/json" }
        });

        if (!response.ok) {
            throw new Error("Export failed.");
        }

        const blob = await response.blob();
        const disposition = response.headers.get("content-disposition") || "";
        const fileNameMatch = disposition.match(/filename="([^"]+)"/i);
        const fileName = fileNameMatch?.[1] || `devnotes-export-${new Date().toISOString().slice(0, 10)}.json`;
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        link.rel = "noopener";
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
        setStatus("Export downloaded.", false, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Export failed.";
        setStatus(message, true);
    }
}

function getSelectedImportMode() {
    const selected = importForm?.querySelector('input[name="import-mode"]:checked');
    if (selected instanceof HTMLInputElement && selected.value === "replace") {
        return "replace";
    }

    return "merge";
}

async function submitImport(event) {
    event.preventDefault();

    const file = importFileInput?.files?.[0];
    if (!file) {
        setStatus("Select a DevNotes export file.", true);
        return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
        setStatus("Only .json export files are allowed.", true);
        return;
    }

    const maxImportBytes = 5 * 1024 * 1024;
    if (file.size > maxImportBytes) {
        setStatus("Import file exceeds the 5 MB limit.", true);
        return;
    }

    const mode = getSelectedImportMode();
    if (mode === "replace") {
        const confirmed = window.confirm("Replace all notes? A backup will be created automatically.");
        if (!confirmed) {
            return;
        }
    }

    const formData = new FormData();
    formData.append("file", file, file.name);

    if (importSubmitButton) {
        importSubmitButton.disabled = true;
    }

    setStatus("Importing notes...");

    try {
        const response = await fetch(`/devnotes/import?mode=${encodeURIComponent(mode)}`, {
            method: "POST",
            body: formData
        });

        let payload = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            payload = await response.json();
        }

        if (!response.ok) {
            const message = payload && typeof payload === "object" && "error" in payload
                ? String(payload.error)
                : "Import failed.";
            throw new Error(message);
        }

        closeImportModal();
        currentPage = 1;
        await refreshActiveDashboard({ soft: false });
        await loadStatistics();

        const importedCount = Number(payload?.importedCount) || 0;
        const skippedCount = Number(payload?.skippedCount) || 0;
        let successMessage = `Import completed. ${importedCount} note${importedCount === 1 ? "" : "s"} imported`;
        if (skippedCount > 0) {
            successMessage += `, ${skippedCount} duplicate${skippedCount === 1 ? "" : "s"} skipped`;
        }
        successMessage += ".";

        setStatus(successMessage, false, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Import failed.";
        setStatus(message, true);
    } finally {
        if (importSubmitButton) {
            importSubmitButton.disabled = false;
        }
    }
}

exportButton?.addEventListener("click", () => {
    void exportDevNotes();
});

codeGuideExportButton?.addEventListener("click", () => {
    openCodeGuideExportModal();
});

codeGuideExportForm?.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === "code-guide-export-scope") {
        syncCodeGuideExportScopeUi();
    }
});

codeGuideExportForm?.addEventListener("submit", (event) => {
    void exportCodeGuidePdf(event);
});

codeGuideExportCancelButton?.addEventListener("click", () => {
    closeCodeGuideExportModal();
});

codeGuideExportCloseButton?.addEventListener("click", () => {
    closeCodeGuideExportModal();
});

codeGuideExportModal?.addEventListener("click", (event) => {
    if (event.target === codeGuideExportModal) {
        closeCodeGuideExportModal();
    }
});

importButton?.addEventListener("click", () => {
    openImportModal();
});

scanProjectButton?.addEventListener("click", () => {
    void runProjectScan();
});

scanImportButton?.addEventListener("click", () => {
    void importSelectedScanResults();
});

scanCancelButton?.addEventListener("click", () => {
    closeScanModal();
});

scanModalCloseButton?.addEventListener("click", () => {
    closeScanModal();
});

scanResultsElement?.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.matches("[data-scan-select]")) {
        updateScanImportButtonState();
    }
});

scanModal?.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Element)) {
        return;
    }

    if (!clickTarget.closest(".scan-modal")) {
        closeScanModal();
    }
});

importForm?.addEventListener("submit", (event) => {
    void submitImport(event);
});

importCancelButton?.addEventListener("click", () => {
    closeImportModal();
});

importModalCloseButton?.addEventListener("click", () => {
    closeImportModal();
});

importModal?.addEventListener("click", (event) => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Element)) {
        return;
    }

    if (!clickTarget.closest(".import-modal")) {
        closeImportModal();
    }
});

async function loadCodeFileSuggestions() {
    if (!codeFilePathInput || !codeFilePathSuggestions) {
        return;
    }

    const query = codeFilePathInput.value.trim();
    if (query.length < minFileSuggestionChars) {
        clearCodeFileSuggestions();
        lastFileSuggestionQuery = "";
        fileSuggestionsFetchController?.abort();
        fileSuggestionsFetchController = null;
        return;
    }

    if (query === lastFileSuggestionQuery) {
        return;
    }

    fileSuggestionsFetchController?.abort();
    const controller = new AbortController();
    fileSuggestionsFetchController = controller;

    try {
        const payload = await apiRequest(`/devnotes/files?q=${encodeURIComponent(query)}`, {
            signal: controller.signal
        });
        if (fileSuggestionsFetchController !== controller) {
            return;
        }

        const items = Array.isArray(payload?.items) ? payload.items : [];
        setCodeFileSuggestions(items);
        lastFileSuggestionQuery = query;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return;
        }

        clearCodeFileSuggestions();
    } finally {
        if (fileSuggestionsFetchController === controller) {
            fileSuggestionsFetchController = null;
        }
    }
}

function setCodeFileSuggestions(items) {
    if (!codeFilePathSuggestions) {
        return;
    }

    codeFilePathSuggestions.innerHTML = "";
    const uniqueItems = Array.from(new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean)));
    for (const item of uniqueItems) {
        const option = document.createElement("option");
        option.value = item;
        codeFilePathSuggestions.append(option);
    }
}

function clearCodeFileSuggestions() {
    if (codeFilePathSuggestions) {
        codeFilePathSuggestions.innerHTML = "";
    }
}

function setStatus(message, isError = false, isSuccess = false) {
    if (statusResetTimer) {
        window.clearTimeout(statusResetTimer);
        statusResetTimer = 0;
    }

    statusElement.textContent = message;
    statusElement.setAttribute("data-status", isError ? "error" : (isSuccess ? "success" : "info"));

    if (isSuccess) {
        statusResetTimer = window.setTimeout(() => {
            if (statusElement.getAttribute("data-status") === "success") {
                statusElement.textContent = "";
                statusElement.setAttribute("data-status", "info");
            }
        }, 2200);
    }
}

initializeTheme();
restoreGuideUiState();
syncGuideClearFiltersVisibility();
syncStatFilterActiveState();
if (composerModal) {
    composerModal.hidden = true;
}
if (importModal) {
    importModal.hidden = true;
}
if (scanModal) {
    scanModal.hidden = true;
}
if (guideHelpModal) {
    guideHelpModal.hidden = true;
}
if (noteModal) {
    noteModal.hidden = true;
}
closeComposerModal();
closeImportModal();
closeScanModal();
closeGuideHelpModal();
closeModal();
void loadClientConfig();
void loadStatistics();
loadNotes();

if (attachmentInput) {
    attachmentInput.multiple = true;
}

attachmentInput?.addEventListener("change", onComposerAttachmentInputChange);
