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
const quickAddNoteFab = document.getElementById("quick-add-note-fab");
const noteModal = document.getElementById("note-modal");
const noteModalContent = noteModal?.querySelector("[data-modal-content]") ?? null;
const modalCloseButton = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalType = document.getElementById("modal-type");
const modalTags = document.getElementById("modal-tags");
const modalCreatedBy = document.getElementById("modal-created-by");
const modalCreated = document.getElementById("modal-created");
const modalAttachmentsSection = document.getElementById("modal-attachments-section");
const modalAttachment = document.getElementById("modal-attachment");
const modalCodeReferenceSection = document.getElementById("modal-code-reference-section");
const modalCodeFile = document.getElementById("modal-code-file");
const modalCodeMethod = document.getElementById("modal-code-method");
const modalCodeLine = document.getElementById("modal-code-line");
const modalViewCodeButton = document.getElementById("modal-view-code-btn");
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
const statTotal = document.getElementById("stat-total");
const statBugs = document.getElementById("stat-bugs");
const statTasks = document.getElementById("stat-tasks");
const statIdeas = document.getElementById("stat-ideas");
const statContributors = document.getElementById("stat-contributors");
const statLastUpdated = document.getElementById("stat-last-updated");
const statValueElements = [statTotal, statBugs, statTasks, statIdeas, statContributors, statLastUpdated].filter(Boolean);
const statFilterPills = Array.from(document.querySelectorAll("[data-stat-filter]"));
const fabRevealScrollY = 200;

const NOTE_TYPE_META = {
    bug: { icon: "\uD83D\uDC1E", label: "Bug" },
    task: { icon: "\u2713", label: "Task" },
    idea: { icon: "\uD83D\uDCA1", label: "Idea" }
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
    const allowed = new Set(["all", "bug", "task", "idea"]);
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
    searchInput.disabled = isLoading && !soft;
    if (typeFilterInput) {
        typeFilterInput.disabled = isLoading && !soft;
    }
    if (userFilterInput) {
        userFilterInput.disabled = isLoading && !soft;
    }
    if (sortOrderInput) {
        sortOrderInput.disabled = isLoading && !soft;
    }
    notesContainer.classList.toggle("notes-loading", isLoading && soft);

    if (isLoading && !soft) {
        notesContainer.innerHTML = `
            <div class="loading-indicator" role="status" aria-live="polite">
                <span class="spinner" aria-hidden="true"></span>
                <span>Loading notes...</span>
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
            await loadNotes({ soft: false });
        } catch {
            // loadNotes handles its own status/error UI; avoid treating reload as save failure.
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
        searchInput?.focus();
        searchInput?.select();
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

    if (event.key === "Escape" && isImportModalOpen()) {
        closeImportModal();
        return;
    }

    if (event.key === "Escape" && isComposerModalOpen()) {
        closeComposerModal();
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

quickAddNoteFab?.addEventListener("click", () => {
    openComposerForCreate();
});

window.addEventListener("scroll", () => {
    syncQuickAddFabVisibility();
}, { passive: true });

function openComposerForCreate() {
    openComposerModal();
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
    const safeDescription = sanitizeDescriptionHtml(note.description || "");
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
        descriptionEditor.innerHTML = sanitizeDescriptionHtml(note.description || "");
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
        await loadNotes({ soft: false });
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

    const title = note.title || "Untitled";
    const type = formatTypeLabel(note.type) || "N/A";
    const tags = Array.isArray(note.tags) && note.tags.length > 0
        ? note.tags.map((tag) => `#${String(tag).trim()}`).join(" ")
        : "N/A";
    const createdBy = formatUserDisplayName(getCreatedByForDisplay(note.createdBy));
    const createdAtRelative = note.createdAt ? formatRelativeTime(note.createdAt) : "N/A";
    const createdAtExact = note.createdAt ? formatExactDateTime(note.createdAt) : "";

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalTitle.textContent = title;
    const modalDescriptionHtml = sanitizeDescriptionHtml(note.description || "");
    const hasModalDescription = Boolean(stripHtml(modalDescriptionHtml).trim());
    modalDescription.innerHTML = hasModalDescription ? modalDescriptionHtml : "";
    modalDescription.closest(".modal-section--description")?.classList.toggle("hidden", !hasModalDescription);
    activeModalNote = note;
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
    modalTags.textContent = tags;
    modalCreatedBy.textContent = `Created by ${createdBy}`;
    modalCreated.textContent = createdAtRelative;
    if (note.createdAt) {
        modalCreated.setAttribute("title", createdAtExact);
        modalCreated.setAttribute("datetime", note.createdAt);
    } else {
        modalCreated.removeAttribute("title");
        modalCreated.removeAttribute("datetime");
    }
    const typeKey = getNoteTypeKey(note.type);
    for (const cls of ["type-bug", "type-idea", "type-task"]) {
        modalType.classList.remove(cls);
    }
    if (typeKey) {
        modalType.classList.add(`type-${typeKey}`);
    }
    noteModal.hidden = false;
    syncBodyScrollLock();
    modalCloseButton?.focus();
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
    const shouldLock = isNoteModalOpen() || isComposerModalOpen() || isImportModalOpen() || isScanModalOpen() || isCodePreviewModalOpen() || imageZoomOverlay;
    document.body.style.overflow = shouldLock ? "hidden" : "";
}

function isScanModalOpen() {
    return scanModal && !scanModal.hidden;
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
        return `
            <label class="scan-result-item" role="listitem" data-scan-index="${index}">
                <input class="scan-result-item__checkbox" type="checkbox" data-scan-select checked />
                <div class="scan-result-item__content">
                    <div class="scan-result-item__header">
                        <span class="scan-result-item__marker ${markerClass}">${marker}</span>
                        <span class="scan-result-item__title">${title}</span>
                    </div>
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
        await loadNotes({ soft: false });
        await loadStatistics();

        const created = Number(payload?.created) || 0;
        const skipped = Number(payload?.skipped) || 0;
        let successMessage = `${created} note${created === 1 ? "" : "s"} imported`;
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
        await loadNotes({ soft: false });
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
if (noteModal) {
    noteModal.hidden = true;
}
closeComposerModal();
closeImportModal();
closeScanModal();
closeModal();
void loadClientConfig();
void loadStatistics();
loadNotes();

if (attachmentInput) {
    attachmentInput.multiple = true;
}

attachmentInput?.addEventListener("change", onComposerAttachmentInputChange);
