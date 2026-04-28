const notesContainer = document.getElementById("notes");
const noteForm = document.getElementById("note-form");
const searchInput = document.getElementById("search");
const typeFilterInput = document.getElementById("filter-type");
const sortOrderInput = document.getElementById("sort-order");
const statusElement = document.getElementById("status");
const notesSummaryElement = document.getElementById("notes-summary");
const submitButton = document.getElementById("submit-btn");
const cancelEditButton = document.getElementById("cancel-edit-btn");
const descriptionEditor = document.getElementById("description-editor");
const titleInput = document.getElementById("title");
const typeInput = document.getElementById("type");
const tagsInput = document.getElementById("tags");
const attachmentInput = document.getElementById("attachment");
const themeToggleButton = document.getElementById("theme-toggle");
const previousPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageIndicator = document.getElementById("page-indicator");
const addNoteButton = document.getElementById("add-note-btn");
const noteModal = document.getElementById("note-modal");
const noteModalContent = noteModal?.querySelector("[data-modal-content]") ?? null;
const modalCloseButton = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalType = document.getElementById("modal-type");
const modalTags = document.getElementById("modal-tags");
const modalCreated = document.getElementById("modal-created");
const modalAttachmentsSection = document.getElementById("modal-attachments-section");
const modalAttachment = document.getElementById("modal-attachment");
const composerModal = document.getElementById("composer-modal");
const composerCloseButton = document.getElementById("composer-close-btn");
const composerTitle = document.getElementById("composer-title");

const themeStorageKey = "dev-notes-theme";
const darkTheme = "dark";
const lightTheme = "light";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const blockedDescriptionTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "OBJECT", "EMBED", "META", "LINK", "BASE"]);
const apiTimeoutMs = 10000;
const searchDebounceMs = 300;

let allNotes = [];
let renderedNotes = [];
let editingNoteId = null;
let editingFilePath = "";
let renderSignature = "";
let activeFetchId = 0;
let currentPage = 1;
const pageSize = 10;
let totalNotes = 0;
let lastFocusedElement = null;
let imageZoomOverlay = null;
let statusResetTimer = 0;
let notesFetchController = null;
let notesSurfaceReady = false;
let lastSummaryText = "";
let lastPaginationKey = "";
let lastComposerFocusedElement = null;

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

        renderSignature = "";
        renderNotes(true);
        updatePaginationUI();
        updateNotesSummary();
        setStatus(`${allNotes.length} note(s) loaded.`);
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
    const isEditing = Boolean(editingNoteId);
    const successMessage = isEditing ? "Note updated." : "Note added.";

    submitButton.disabled = true;
    cancelEditButton?.setAttribute("disabled", "true");
    setStatus(isEditing ? "Updating note..." : "Saving note...");

    try {
        let filePath = isEditing ? editingFilePath : "";
        const selectedFile = attachmentInput?.files?.[0] ?? null;
        if (selectedFile) {
            setStatus("Uploading attachment...");
            const uploadData = new FormData();
            uploadData.append("file", selectedFile);

            const uploadResult = await apiRequest("/devnotes/upload", {
                method: "POST",
                body: uploadData
            });

            filePath = uploadResult?.filePath || uploadResult?.fileUrl || "";
        }

        const payload = { title, description, type, tags, filePath };
        const endpoint = isEditing ? `/devnotes/${encodeURIComponent(editingNoteId)}` : "/devnotes/add";
        const method = isEditing ? "PUT" : "POST";

        await apiRequest(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // Close immediately after a successful save, before async follow-up work.
        resetFormState();
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

searchInput.addEventListener("input", () => {
    debouncedSearch();
});

typeFilterInput?.addEventListener("change", () => {
    currentPage = 1;
    void loadNotes({ soft: true });
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
        resetFormState();
        openComposerModal();
        return;
    }

    if (event.target.closest("a[data-attachment-link]")) {
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
        resetFormState();
        openComposerModal();
        setStatus("Edit cancelled.");
    });
}

document.addEventListener("keydown", (event) => {
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

addNoteButton?.addEventListener("click", () => {
    resetFormState();
    openComposerModal();
});

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
    event.stopPropagation();
});

modalAttachment?.addEventListener("click", (event) => {
    const imageElement = event.target.closest(".modal-attachment-image");
    if (!(imageElement instanceof HTMLImageElement)) {
        return;
    }

    openImageZoom(imageElement.src);
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
    renderedNotes = allNotes;

    const signature = `${currentPage}|${totalNotes}|${renderedNotes.length}|${renderedNotes.map((n) => `${getNoteId(n)}:${n.createdAt ?? ""}`).join("|")}`;
    if (!force && signature === renderSignature) {
        return;
    }
    renderSignature = signature;

    if (renderedNotes.length === 0) {
        const hasSearch = Boolean(searchInput.value.trim());
        const hasTypeFilter = Boolean(typeFilterInput && typeFilterInput.value !== "all");
        const isFirstNoteState = totalNotes === 0 && !hasSearch && !hasTypeFilter;
        if (isFirstNoteState) {
            notesContainer.innerHTML = `
                <div class="notes-empty notes-empty-state">
                    <p>No notes yet. Start by creating your first note.</p>
                    <button type="button" class="empty-state-action" data-empty-action="create">Create first note</button>
                </div>
            `;
        } else {
            notesContainer.innerHTML = `<p class="notes-empty">No notes found</p>`;
        }
        return;
    }

    notesContainer.innerHTML = renderedNotes
        .map((note, index) => {
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
            const createdAt = note.createdAt
                ? `<div class="meta meta--created">Created: ${new Date(note.createdAt).toLocaleString()}</div>`
                : "";
            const typeKey = String(note.type || "").trim().toLowerCase();
            const noteTypeAttr = ["bug", "idea", "task"].includes(typeKey) ? ` data-note-type="${typeKey}"` : "";
            const chipsInner = `${safeType}${safeTags}`;
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
        })
        .join("");
}

function updateNotesSummary() {
    if (!notesSummaryElement) {
        return;
    }

    const noteLabel = totalNotes === 1 ? "note" : "notes";
    const sortLabel = (sortOrderInput?.value || "newest").toLowerCase() === "oldest" ? "Oldest" : "Newest";
    const text = `${totalNotes} ${noteLabel} • Sorted by ${sortLabel}`;
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
    editingFilePath = note.filePath || "";
    if (attachmentInput) {
        attachmentInput.value = "";
    }

    submitButton.textContent = "Update Note";
    if (composerTitle) {
        composerTitle.textContent = "Edit Note";
    }
    cancelEditButton?.classList.remove("hidden");
    setStatus("Editing note.");
    closeModal();
    openComposerModal();
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

function resetFormState() {
    noteForm.reset();
    if (descriptionEditor) {
        descriptionEditor.innerHTML = "";
    }

    editingNoteId = null;
    editingFilePath = "";
    submitButton.textContent = "Add Note";
    if (composerTitle) {
        composerTitle.textContent = "Add Note";
    }
    cancelEditButton?.classList.add("hidden");
}

function isComposerModalOpen() {
    return composerModal && !composerModal.hidden;
}

function openComposerModal() {
    if (!composerModal) {
        return;
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
    if (!noteModal || !modalTitle || !modalDescription || !modalType || !modalTags || !modalCreated || !modalAttachment) {
        return;
    }

    const title = note.title || "Untitled";
    const type = note.type || "N/A";
    const tags = Array.isArray(note.tags) && note.tags.length > 0 ? note.tags.join(", ") : "N/A";
    const createdAt = note.createdAt ? new Date(note.createdAt).toLocaleString() : "N/A";

    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalTitle.textContent = title;
    modalDescription.innerHTML = sanitizeDescriptionHtml(note.description) || "<p>No description.</p>";
    modalAttachment.innerHTML = getAttachmentMarkup(note, "modal");
    if (modalAttachmentsSection) {
        modalAttachmentsSection.classList.toggle("hidden", !String(note.filePath || "").trim());
    }
    modalType.textContent = `Type: ${type}`;
    modalTags.textContent = `Tags: ${tags}`;
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
    closeImageZoom();
    syncBodyScrollLock();
    lastFocusedElement?.focus();
}

function getAttachmentMarkup(note, view) {
    const filePath = typeof note?.filePath === "string" ? note.filePath.trim() : "";
    if (!filePath) {
        return "";
    }

    if (isImageFile(filePath)) {
        const imageClass = view === "modal" ? "modal-attachment-image" : "note-attachment-image";
        return `
            <div class="attachment-block attachment-block--image">
                <img src="${escapeHtml(filePath)}" alt="Uploaded note image" class="${imageClass}" loading="lazy" />
            </div>
        `;
    }

    return `
        <div class="attachment-block attachment-block--file">
            <a href="${escapeHtml(filePath)}" data-attachment-link target="_blank" rel="noopener noreferrer">Download attachment</a>
        </div>
    `;
}

function isImageFile(path) {
    const cleanPath = String(path || "").toLowerCase().split("?")[0].split("#")[0];
    return cleanPath.endsWith(".png") || cleanPath.endsWith(".jpg") || cleanPath.endsWith(".jpeg");
}

function openImageZoom(imageUrl) {
    if (!imageUrl) {
        return;
    }

    closeImageZoom();
    imageZoomOverlay = document.createElement("div");
    imageZoomOverlay.className = "image-zoom-overlay";
    imageZoomOverlay.setAttribute("role", "dialog");
    imageZoomOverlay.setAttribute("aria-label", "Image preview");

    const zoomedImage = document.createElement("img");
    zoomedImage.src = imageUrl;
    zoomedImage.alt = "Zoomed note attachment";
    zoomedImage.className = "image-zoom-content";

    imageZoomOverlay.append(zoomedImage);
    imageZoomOverlay.addEventListener("click", closeImageZoom);
    document.body.append(imageZoomOverlay);
}

function closeImageZoom() {
    if (!imageZoomOverlay) {
        return;
    }

    imageZoomOverlay.remove();
    imageZoomOverlay = null;
    syncBodyScrollLock();
}

function syncBodyScrollLock() {
    const shouldLock = isNoteModalOpen() || isComposerModalOpen() || imageZoomOverlay;
    document.body.style.overflow = shouldLock ? "hidden" : "";
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
loadNotes();
