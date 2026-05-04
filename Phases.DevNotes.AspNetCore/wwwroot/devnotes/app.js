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
const composerModal = document.getElementById("composer-modal");
const composerCloseButton = document.getElementById("composer-close-btn");
const composerTitle = document.getElementById("composer-title");
const fabRevealScrollY = 200;

const themeStorageKey = "dev-notes-theme";
const darkTheme = "dark";
const lightTheme = "light";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const blockedDescriptionTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED", "META", "LINK", "BASE"]);
const apiTimeoutMs = 10000;
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
    currentPage = 1;
    void loadNotes({ soft: true });
});

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
        if (codeReferenceLink.getAttribute("href") === "#") {
            event.preventDefault();
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

document.addEventListener("keydown", (event) => {
    const isQuickCreateShortcut = event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && event.key.toLowerCase() === "n";
    if (isQuickCreateShortcut && !isTypingTarget(event.target)) {
        event.preventDefault();
        openComposerForCreate();
        return;
    }

    if (event.key === "Escape" && imageZoomOverlay) {
        closeImageZoom();
        return;
    }

    if (event.key === "Escape" && isNoteModalOpen()) {
        closeModal();
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
                    <p>No notes yet</p>
                    <button type="button" class="empty-state-action" data-empty-action="create">Add your first note</button>
                </div>
            `;
        } else {
            notesContainer.innerHTML = `<p class="notes-empty">No notes found</p>`;
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
            const notesMarkup = items.map((item) => renderNoteCard(item.note, item.index)).join("");
            return `
                <section class="notes-group" data-created-by-group="${escapeHtml(groupName)}">
                    <header class="notes-group__header">
                        <h2 class="notes-group__title">${escapeHtml(groupName)}</h2>
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
        option.textContent = user;
        userFilterInput.append(option);
    }

    userFilterInput.value = uniqueUsers.includes(previousValue) ? previousValue : "all";
}

function renderNoteCard(note, index) {
    const safeTitle = escapeHtml(note.title || "Untitled");
    const safeDescription = sanitizeDescriptionHtml(note.description || "");
    const descriptionMarkup = safeDescription || "<p>No description.</p>";
    const noteId = getNoteId(note);
    const actionButtons = noteId
        ? `
            <div class="note-actions">
                <button type="button" class="note-action-btn" data-note-action="edit" data-note-index="${index}" aria-label="Edit note ${safeTitle}">Edit</button>
                <button type="button" class="note-action-btn" data-note-action="delete" data-note-index="${index}" aria-label="Delete note ${safeTitle}">Delete</button>
            </div>
        `
        : "";
    const safeType = note.type ? `<div class="meta meta--type">Type: ${escapeHtml(note.type)}</div>` : "";
    const safeTags = Array.isArray(note.tags) && note.tags.length > 0
        ? `<div class="meta meta--tags">Tags: ${escapeHtml(note.tags.join(", "))}</div>`
        : "";
    const attachmentMarkup = getAttachmentMarkup(note, "card");
    const codeReferenceMarkup = getCodeReferenceMarkup(note);
    const createdAt = note.createdAt
        ? `<div class="meta meta--created">Created: ${new Date(note.createdAt).toLocaleString()}</div>`
        : "";
    const typeKey = String(note.type || "").trim().toLowerCase();
    const noteTypeAttr = ["bug", "idea", "task"].includes(typeKey) ? ` data-note-type="${typeKey}"` : "";
    const chipsInner = `${safeType}${safeTags}${codeReferenceMarkup}`;
    const metaSection = chipsInner || createdAt
        ? `<div class="note__meta">
                ${chipsInner ? `<div class="note__chips">${chipsInner}</div>` : ""}
                ${createdAt}
            </div>`
        : "";
    const footer = metaSection || actionButtons
        ? `<div class="note__footer">
                ${metaSection}
                ${actionButtons}
            </div>`
        : "";

    return `
        <article class="note"${noteTypeAttr} data-note-index="${index}" role="button" tabindex="0" aria-label="Open note ${safeTitle}">
            <div class="note__header">
                <h3 class="note-title">${safeTitle}</h3>
            </div>
            <div class="note__body">
                <div class="note-description">${descriptionMarkup}</div>
                ${attachmentMarkup}
            </div>
            ${footer}
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
        segments.push(selectedUser);
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
    const type = note.type || "N/A";
    const tags = Array.isArray(note.tags) && note.tags.length > 0 ? note.tags.join(", ") : "N/A";
    const createdBy = getCreatedByForDisplay(note.createdBy);
    const createdAt = note.createdAt ? new Date(note.createdAt).toLocaleString() : "N/A";

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalTitle.textContent = title;
    modalDescription.innerHTML = sanitizeDescriptionHtml(note.description) || "<p>No description.</p>";
    const codeReference = getCodeReferenceDetails(note);
    const hasCodeReference = Boolean(codeReference.filePath || codeReference.methodName || codeReference.lineNumber);
    if (modalCodeReferenceSection && modalCodeFile && modalCodeMethod && modalCodeLine) {
        modalCodeReferenceSection.classList.toggle("hidden", !hasCodeReference);
        modalCodeFile.innerHTML = codeReference.filePath ? `<strong>${escapeHtml(codeReference.filePath)}</strong>` : "";
        modalCodeMethod.textContent = codeReference.methodName ? `Method: ${codeReference.methodName}` : "";
        modalCodeLine.textContent = codeReference.lineNumber ? `Line: L${codeReference.lineNumber}` : "";
    }

    const hasAttachment = getAttachmentPaths(note).length > 0;
    const attachmentMarkup = hasAttachment ? getAttachmentMarkup(note, "modal") : "";
    modalAttachment.innerHTML = attachmentMarkup;
    if (modalAttachmentsSection) {
        modalAttachmentsSection.classList.toggle("hidden", !hasAttachment);
    }
    modalType.textContent = `Type: ${type}`;
    modalTags.textContent = `Tags: ${tags}`;
    modalCreatedBy.textContent = `Created by: ${createdBy}`;
    modalCreated.textContent = `Created: ${createdAt}`;
    const typeKey = type.trim().toLowerCase();
    for (const cls of ["type-bug", "type-idea", "type-task"]) {
        modalType.classList.remove(cls);
    }
    if (typeKey === "bug" || typeKey === "idea" || typeKey === "task") {
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

function getCodeReferenceMarkup(note) {
    const referenceLabel = formatCodeReference(note);
    if (!referenceLabel) {
        return "";
    }

    const href = getCodeReferenceLinkHref(note);
    const targetAttributes = href !== "#"
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
    return `<a class="meta meta--code-reference" data-code-reference-link href="${escapeHtml(href)}"${targetAttributes}>${escapeHtml(referenceLabel)}</a>`;
}

function formatCodeReference(note) {
    const { filePath, methodName, lineNumber } = getCodeReferenceDetails(note);
    const lineNumberValue = Number(lineNumber);
    const hasLine = Number.isInteger(lineNumberValue) && lineNumberValue > 0;
    if (!filePath && !methodName && !hasLine) {
        return "";
    }

    let label = filePath || "Code reference";
    if (methodName) {
        label = `${label} \u2192 ${methodName}()`;
    }
    if (hasLine) {
        label = `${label} (L${lineNumberValue})`;
    }

    return label;
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
    const shouldLock = isNoteModalOpen() || isComposerModalOpen() || imageZoomOverlay;
    document.body.style.overflow = shouldLock ? "hidden" : "";
}

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
if (composerModal) {
    composerModal.hidden = true;
}
if (noteModal) {
    noteModal.hidden = true;
}
closeComposerModal();
closeModal();
void loadClientConfig();
loadNotes();

if (attachmentInput) {
    attachmentInput.multiple = true;
}

attachmentInput?.addEventListener("change", onComposerAttachmentInputChange);
