// WYSIWYG Editor - Pure JavaScript Implementation

class WYSIWYGEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.documents = this.loadDocuments();
        this.currentDocId = null;

        // Theme mode: 'light', 'theme', or 'dark'
        this.themeMode = this.loadThemeMode();

        // Spellcheck & Autocorrect settings
        this.spellcheckEnabled = true;
        this.autocorrectEnabled = true;
        this.autocapitalizeEnabled = true;
        this.customDictionary = this.loadCustomDictionary();
        this.autocorrectRules = this.loadAutocorrectRules();
        this.lastWord = '';
        this.pendingCorrection = null;

        // Sidebar state
        this.sidebarCollapsed = false;
        this.sidebarWidth = 260;
        this.sidebarPosition = 'left'; // 'left' or 'right'
        this.isResizing = false;
        this.floatingBtnPos = { x: 20, y: 100 };
        this.isDraggingBtn = false;
        this.bubbleHidden = false;
        this.wasDockedBeforeHide = true; // Track state before hiding

        // Theme state
        this.currentTheme = this.loadCurrentTheme();
        this.previewTheme = null;
        this.originalTheme = null;

        // Auto-save state
        this.autoSaveEnabled = false;
        this.autoSaveValue = 5;
        this.autoSaveUnit = 'minutes';
        this.autoSaveLimit = 3;
        this.autoDeleteDays = 7;
        this.autoSaveTimer = null;
        this.autoSaveWordCount = 0;
        this.autoSaveCharCount = 0;
        this.autoSaveChangeCount = 0;
        this.autoSaveDocuments = this.loadAutoSaveDocuments();
        this.loadAutoSaveSettings();

        // Toast settings state
        this.toastSettings = this.loadToastSettings();

        // Folder state
        this.folders = this.loadFolders();
        this.currentFolderId = null;
        this.contextDocId = null;
        this.contextDocType = null; // 'saved' or 'autosave'
        this.contextFolderId = null;

        // Accordion state
        this.accordionState = this.loadAccordionState();

        // Flag state
        this.currentFlag = 'none';
        this.flagBorderWidth = this.loadFlagBorderWidth();

        // Auto-save session tracking
        this.currentAutoSaveId = null;
        this.sessionDocId = this.generateSessionId();

        // Modal state management
        this.previousModal = null;
        this.modalClickOutside = this.loadModalClickOutside();

        // Default load action and editor state
        this.defaultLoadAction = this.loadDefaultLoadAction();
        this.editorClosed = false;

        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadModalClickOutside() {
        return localStorage.getItem('wysiwyg_modal_click_outside') || 'nothing';
    }

    saveModalClickOutside() {
        localStorage.setItem('wysiwyg_modal_click_outside', this.modalClickOutside);
    }

    loadDefaultLoadAction() {
        return localStorage.getItem('wysiwyg_default_load_action') || 'newDocument';
    }

    saveDefaultLoadAction() {
        localStorage.setItem('wysiwyg_default_load_action', this.defaultLoadAction);
    }

    // Handle modal click-outside based on user preference
    handleModalClickOutside(modalId, saveCallback, cancelCallback) {
        if (this.modalClickOutside === 'nothing') {
            // Do nothing - modal stays open
            return;
        } else if (this.modalClickOutside === 'save' && saveCallback) {
            saveCallback();
        } else if (this.modalClickOutside === 'cancel' && cancelCallback) {
            cancelCallback();
        }
    }

    init() {
        try {
            this.initThemes();
            this.initSidebar();
            this.initSpellcheckAutocorrect();
            this.initResetModal();
            this.initSettingsMenu();
            this.initAutoSave();
            this.initAutoSaveWarningModal();
            this.initToastSettingsModal();
            this.initFolders();
            this.initAccordion();
            this.initEditMenu();
            this.initFileMenu();
            this.initDocumentContextMenu();
            this.bindToolbarButtons();
            this.bindSelects();
            this.bindColorPickers();
            this.bindSpecialButtons();
            this.bindModals();
            this.bindHeaderActions();
            this.bindEditorEvents();
            this.renderDocumentList();
            this.renderAutoSaveDocumentList();
            this.renderFolderList();
            this.updateCounts();
            this.updateFlagStatusBar();
        } catch (error) {
            console.error('Error during initialization:', error);
        }

        // Handle default load action - MUST run even if there were errors above
        try {
            this.handleDefaultLoadAction();
        } catch (error) {
            console.error('Error in handleDefaultLoadAction:', error);
        }
    }

    // ==================== Themes ====================

    getThemes() {
        return [
            {
                id: 'default',
                name: 'Default Blue',
                colors: {
                    primary: '#3b82f6',
                    primaryHover: '#2563eb',
                    bg: '#f3f4f6',
                    white: '#ffffff',
                    border: '#e5e7eb',
                    text: '#1f2937',
                    textLight: '#6b7280',
                    toolbar: '#fafafa',
                    activeItem: '#dbeafe'
                }
            },
            {
                id: 'emerald',
                name: 'Emerald Green',
                colors: {
                    primary: '#10b981',
                    primaryHover: '#059669',
                    bg: '#f0fdf4',
                    white: '#ffffff',
                    border: '#d1fae5',
                    text: '#064e3b',
                    textLight: '#6b7280',
                    toolbar: '#f0fdf4',
                    activeItem: '#d1fae5'
                }
            },
            {
                id: 'purple',
                name: 'Royal Purple',
                colors: {
                    primary: '#8b5cf6',
                    primaryHover: '#7c3aed',
                    bg: '#faf5ff',
                    white: '#ffffff',
                    border: '#e9d5ff',
                    text: '#3b0764',
                    textLight: '#7c3aed',
                    toolbar: '#faf5ff',
                    activeItem: '#e9d5ff'
                }
            },
            {
                id: 'rose',
                name: 'Rose Pink',
                colors: {
                    primary: '#f43f5e',
                    primaryHover: '#e11d48',
                    bg: '#fff1f2',
                    white: '#ffffff',
                    border: '#fecdd3',
                    text: '#881337',
                    textLight: '#be123c',
                    toolbar: '#fff1f2',
                    activeItem: '#fecdd3'
                }
            },
            {
                id: 'amber',
                name: 'Amber Gold',
                colors: {
                    primary: '#f59e0b',
                    primaryHover: '#d97706',
                    bg: '#fffbeb',
                    white: '#ffffff',
                    border: '#fde68a',
                    text: '#78350f',
                    textLight: '#b45309',
                    toolbar: '#fffbeb',
                    activeItem: '#fef3c7'
                }
            },
            {
                id: 'cyan',
                name: 'Ocean Cyan',
                colors: {
                    primary: '#06b6d4',
                    primaryHover: '#0891b2',
                    bg: '#ecfeff',
                    white: '#ffffff',
                    border: '#a5f3fc',
                    text: '#164e63',
                    textLight: '#0e7490',
                    toolbar: '#ecfeff',
                    activeItem: '#cffafe'
                }
            },
            {
                id: 'slate',
                name: 'Slate Gray',
                colors: {
                    primary: '#64748b',
                    primaryHover: '#475569',
                    bg: '#f8fafc',
                    white: '#ffffff',
                    border: '#e2e8f0',
                    text: '#1e293b',
                    textLight: '#64748b',
                    toolbar: '#f1f5f9',
                    activeItem: '#e2e8f0'
                }
            },
            {
                id: 'midnight',
                name: 'Midnight Dark',
                colors: {
                    primary: '#6366f1',
                    primaryHover: '#4f46e5',
                    bg: '#0f172a',
                    white: '#1e293b',
                    border: '#334155',
                    text: '#f1f5f9',
                    textLight: '#94a3b8',
                    toolbar: '#1e293b',
                    activeItem: '#312e81'
                }
            },
            {
                id: 'forest',
                name: 'Forest Night',
                colors: {
                    primary: '#22c55e',
                    primaryHover: '#16a34a',
                    bg: '#0a1f0a',
                    white: '#14291a',
                    border: '#1f3d2a',
                    text: '#dcfce7',
                    textLight: '#86efac',
                    toolbar: '#14291a',
                    activeItem: '#166534'
                }
            },
            {
                id: 'sunset',
                name: 'Sunset Orange',
                colors: {
                    primary: '#ea580c',
                    primaryHover: '#c2410c',
                    bg: '#fff7ed',
                    white: '#ffffff',
                    border: '#fed7aa',
                    text: '#7c2d12',
                    textLight: '#c2410c',
                    toolbar: '#fff7ed',
                    activeItem: '#ffedd5'
                }
            },
            // 2 New standard themes
            {
                id: 'indigo',
                name: 'Indigo Dream',
                colors: {
                    primary: '#4f46e5',
                    primaryHover: '#4338ca',
                    bg: '#eef2ff',
                    white: '#ffffff',
                    border: '#c7d2fe',
                    text: '#312e81',
                    textLight: '#6366f1',
                    toolbar: '#eef2ff',
                    activeItem: '#e0e7ff'
                }
            },
            {
                id: 'teal',
                name: 'Teal Fresh',
                colors: {
                    primary: '#14b8a6',
                    primaryHover: '#0d9488',
                    bg: '#f0fdfa',
                    white: '#ffffff',
                    border: '#99f6e4',
                    text: '#134e4a',
                    textLight: '#0f766e',
                    toolbar: '#f0fdfa',
                    activeItem: '#ccfbf1'
                }
            },
            // 3 Creative/funky themes
            {
                id: 'synthwave',
                name: 'Synthwave',
                colors: {
                    primary: '#f472b6',
                    primaryHover: '#ec4899',
                    bg: '#0c0a1d',
                    white: '#1a1333',
                    border: '#7c3aed',
                    text: '#f0abfc',
                    textLight: '#c084fc',
                    toolbar: '#1a1333',
                    activeItem: '#4c1d95'
                }
            },
            {
                id: 'bubblegum',
                name: 'Bubblegum Pop',
                colors: {
                    primary: '#e879f9',
                    primaryHover: '#d946ef',
                    bg: '#fdf4ff',
                    white: '#ffffff',
                    border: '#f0abfc',
                    text: '#701a75',
                    textLight: '#a21caf',
                    toolbar: '#fae8ff',
                    activeItem: '#f5d0fe'
                }
            },
            {
                id: 'retrowave',
                name: 'Retro Neon',
                colors: {
                    primary: '#22d3ee',
                    primaryHover: '#06b6d4',
                    bg: '#18181b',
                    white: '#27272a',
                    border: '#f97316',
                    text: '#fef08a',
                    textLight: '#22d3ee',
                    toolbar: '#27272a',
                    activeItem: '#365314'
                }
            }
        ];
    }

    initThemes() {
        // Apply initial state based on themeMode
        this.applyThemeMode();

        // Bind 3-way toggle
        this.initThemeModeToggle();

        // Bind theme button in View menu
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                document.getElementById('viewMenu').classList.remove('show');
                this.openThemeModal();
            });
        }

        // Bind theme modal buttons
        const themeModalClose = document.getElementById('themeModalClose');
        const themeCancelBtn = document.getElementById('themeCancelBtn');
        const themeSaveBtn = document.getElementById('themeSaveBtn');

        if (themeModalClose) {
            themeModalClose.addEventListener('click', () => this.cancelThemeSelection());
        }
        if (themeCancelBtn) {
            themeCancelBtn.addEventListener('click', () => this.cancelThemeSelection());
        }
        if (themeSaveBtn) {
            themeSaveBtn.addEventListener('click', () => this.saveThemeSelection());
        }

        // Close modal on backdrop click
        const themeModal = document.getElementById('themeModal');
        if (themeModal) {
            themeModal.addEventListener('click', (e) => {
                if (e.target === themeModal) {
                    this.handleModalClickOutside(
                        'themeModal',
                        () => this.saveThemeSelection(),
                        () => this.cancelThemeSelection()
                    );
                }
            });
        }
    }

    initThemeModeToggle() {
        const toggle = document.getElementById('themeModeToggle');
        if (!toggle) return;

        // Set initial state
        toggle.setAttribute('data-mode', this.themeMode);
        this.updateToggleActiveState();

        // Bind click events on icons
        toggle.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const mode = icon.dataset.mode;
                this.setThemeMode(mode);
            });
        });
    }

    updateToggleActiveState() {
        const toggle = document.getElementById('themeModeToggle');
        if (!toggle) return;

        toggle.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.classList.toggle('active', icon.dataset.mode === this.themeMode);
        });
    }

    loadThemeMode() {
        const saved = localStorage.getItem('wysiwyg_theme_mode');
        return saved || 'theme'; // Default to 'theme' mode (use selected theme)
    }

    saveThemeMode(mode) {
        localStorage.setItem('wysiwyg_theme_mode', mode);
        this.themeMode = mode;
    }

    setThemeMode(mode) {
        this.saveThemeMode(mode);

        const toggle = document.getElementById('themeModeToggle');
        if (toggle) {
            toggle.setAttribute('data-mode', mode);
        }

        this.updateToggleActiveState();
        this.applyThemeMode();
    }

    applyThemeMode() {
        if (this.themeMode === 'dark') {
            // Dark mode overrides everything
            this.applyDarkModeOverride();
        } else if (this.themeMode === 'light') {
            // Light mode - use default light colors
            this.applyLightMode();
        } else {
            // Theme mode - use selected theme
            this.applyTheme(this.currentTheme, false);
        }
    }

    applyDarkModeOverride() {
        const root = document.documentElement;
        root.setAttribute('data-theme', 'dark');

        // Apply dark mode CSS variables
        root.style.setProperty('--primary-color', '#60a5fa');
        root.style.setProperty('--primary-hover', '#3b82f6');
        root.style.setProperty('--bg-color', '#111827');
        root.style.setProperty('--white', '#1f2937');
        root.style.setProperty('--border-color', '#374151');
        root.style.setProperty('--text-color', '#f9fafb');
        root.style.setProperty('--text-light', '#9ca3af');
        root.style.setProperty('--toolbar-bg', '#1f2937');
        root.style.setProperty('--active-item-bg', '#1e3a5f');
    }

    applyLightMode() {
        const root = document.documentElement;
        root.removeAttribute('data-theme');

        // Apply default light mode CSS variables
        root.style.setProperty('--primary-color', '#3b82f6');
        root.style.setProperty('--primary-hover', '#2563eb');
        root.style.setProperty('--bg-color', '#f3f4f6');
        root.style.setProperty('--white', '#ffffff');
        root.style.setProperty('--border-color', '#e5e7eb');
        root.style.setProperty('--text-color', '#1f2937');
        root.style.setProperty('--text-light', '#6b7280');
        root.style.setProperty('--toolbar-bg', '#fafafa');
        root.style.setProperty('--active-item-bg', '#dbeafe');
    }

    loadCurrentTheme() {
        const saved = localStorage.getItem('wysiwyg_color_theme');
        return saved || 'sunset'; // Default to Sunset Orange
    }

    saveCurrentTheme(themeId) {
        localStorage.setItem('wysiwyg_color_theme', themeId);
        this.currentTheme = themeId;
    }

    openThemeModal() {
        // Store original theme for cancel
        this.originalTheme = this.currentTheme;
        this.previewTheme = this.currentTheme;

        // Render theme cards
        this.renderThemeCards();

        // Show modal
        document.getElementById('themeModal').classList.add('show');
    }

    renderThemeCards() {
        const grid = document.getElementById('themeGrid');
        if (!grid) return;

        const themes = this.getThemes();
        grid.innerHTML = themes.map(theme => `
            <div class="theme-card ${theme.id === this.previewTheme ? 'selected' : ''}" data-theme-id="${theme.id}">
                <div class="theme-card-check"><i class="fas fa-check"></i></div>
                <div class="theme-card-preview" style="background: ${theme.colors.bg}">
                    <div class="theme-preview-header" style="background: ${theme.colors.white}; border-bottom: 1px solid ${theme.colors.border}">
                        <span class="theme-preview-dot" style="background: #ef4444"></span>
                        <span class="theme-preview-dot" style="background: #f59e0b"></span>
                        <span class="theme-preview-dot" style="background: #22c55e"></span>
                    </div>
                    <div class="theme-preview-body">
                        <div class="theme-preview-sidebar" style="background: ${theme.colors.white}; border: 1px solid ${theme.colors.border}"></div>
                        <div class="theme-preview-content" style="background: ${theme.colors.white}; border: 1px solid ${theme.colors.border}">
                            <div class="theme-preview-toolbar" style="background: ${theme.colors.toolbar}; border-bottom: 1px solid ${theme.colors.border}"></div>
                            <div class="theme-preview-text" style="background: ${theme.colors.primary}; opacity: 0.2"></div>
                        </div>
                    </div>
                </div>
                <div class="theme-card-name">${theme.name}</div>
            </div>
        `).join('');

        // Bind click events
        grid.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.dataset.themeId;
                this.previewThemeById(themeId);

                // Update selected state
                grid.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    }

    previewThemeById(themeId) {
        this.previewTheme = themeId;
        this.applyTheme(themeId, true);
    }

    applyTheme(themeId, isPreview = false) {
        const themes = this.getThemes();
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        const root = document.documentElement;
        const colors = theme.colors;

        // Check if this is a dark theme based on background color brightness
        const darkThemes = ['midnight', 'forest', 'synthwave', 'retrowave'];
        const isDarkTheme = darkThemes.includes(themeId);

        // Apply CSS variables
        root.style.setProperty('--primary-color', colors.primary);
        root.style.setProperty('--primary-hover', colors.primaryHover);
        root.style.setProperty('--bg-color', colors.bg);
        root.style.setProperty('--white', colors.white);
        root.style.setProperty('--border-color', colors.border);
        root.style.setProperty('--text-color', colors.text);
        root.style.setProperty('--text-light', colors.textLight);
        root.style.setProperty('--toolbar-bg', colors.toolbar);
        root.style.setProperty('--active-item-bg', colors.activeItem);

        // Handle dark theme attribute for proper styling
        if (isDarkTheme) {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }
    }

    cancelThemeSelection() {
        // Restore original theme and re-apply current theme mode
        this.previewTheme = null;
        this.originalTheme = null;

        // Re-apply the current theme mode (which will use the saved theme)
        this.applyThemeMode();

        // Close modal
        document.getElementById('themeModal').classList.remove('show');
    }

    saveThemeSelection() {
        // Save the previewed theme
        if (this.previewTheme) {
            this.saveCurrentTheme(this.previewTheme);
            this.currentTheme = this.previewTheme;
        }
        this.previewTheme = null;
        this.originalTheme = null;

        // Switch to theme mode so the newly selected theme is visible
        this.setThemeMode('theme');

        // Close modal
        document.getElementById('themeModal').classList.remove('show');
        this.showNotification('Theme saved!', 'theme');
    }

    // ==================== Sidebar ====================

    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const resizeHandle = document.getElementById('resizeHandle');

        if (!sidebar || !hamburgerBtn || !resizeHandle) return;

        // Load saved sidebar state
        this.loadSidebarState();

        // Apply initial state
        this.applySidebarState();

        // Hamburger button click (only toggle if not dragging)
        hamburgerBtn.addEventListener('click', (e) => {
            if (!this.isDraggingBtn) {
                this.toggleSidebar();
            }
        });

        // Initialize floating button drag functionality
        this.initFloatingButtonDrag(hamburgerBtn);

        // Initialize bubble context menu
        this.initBubbleContextMenu(hamburgerBtn);

        // Initialize view menu
        this.initViewMenu();

        // Resize handle functionality
        this.initResizeHandle(sidebar, resizeHandle);
    }

    initBubbleContextMenu(hamburgerBtn) {
        const contextMenu = document.getElementById('bubbleContextMenu');
        const hideBubbleBtn = document.getElementById('hideBubbleBtn');

        if (!contextMenu || !hideBubbleBtn) return;

        // Right-click on hamburger button (both floating and docked states)
        hamburgerBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            // Position context menu at cursor
            const x = e.clientX;
            const y = e.clientY;

            // Make sure menu doesn't go off screen
            contextMenu.style.left = `${Math.min(x, window.innerWidth - 180)}px`;
            contextMenu.style.top = `${Math.min(y, window.innerHeight - 60)}px`;

            contextMenu.classList.add('show');
        });

        // Hide option - collapses sidebar and hides bubble
        hideBubbleBtn.addEventListener('click', () => {
            this.hideDocumentBar();
            contextMenu.classList.remove('show');
        });

        // Close context menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target)) {
                contextMenu.classList.remove('show');
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                contextMenu.classList.remove('show');
            }
        });
    }

    initViewMenu() {
        const viewBtn = document.getElementById('viewBtn');
        const viewMenu = document.getElementById('viewMenu');
        const showDocBarBtn = document.getElementById('showDocBarBtn');

        if (!viewBtn || !viewMenu) return;

        // Toggle view menu
        viewBtn.addEventListener('click', () => {
            // Update highlight state before showing menu
            this.updateDocBarHighlight();
            viewMenu.classList.toggle('show');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!viewBtn.contains(e.target) && !viewMenu.contains(e.target)) {
                viewMenu.classList.remove('show');
            }
        });

        // Toggle document bar option
        if (showDocBarBtn) {
            showDocBarBtn.addEventListener('click', () => {
                this.toggleDocumentBarVisibility();
                viewMenu.classList.remove('show');
            });
        }

        // Edit View Settings option
        const editViewSettingsBtn = document.getElementById('editViewSettingsBtn');
        if (editViewSettingsBtn) {
            editViewSettingsBtn.addEventListener('click', () => {
                this.openViewSettings();
                viewMenu.classList.remove('show');
            });
        }

        // Initialize highlight state
        this.updateDocBarHighlight();
    }

    updateDocBarHighlight() {
        const showDocBarBtn = document.getElementById('showDocBarBtn');
        if (!showDocBarBtn) return;

        // Document bar is visible when bubble is not hidden
        // (either docked sidebar OR floating bubble mode)
        const isVisible = !this.bubbleHidden;

        if (isVisible) {
            showDocBarBtn.classList.add('enabled');
            showDocBarBtn.innerHTML = '<i class="fas fa-columns"></i> Hide Document Bar';
        } else {
            showDocBarBtn.classList.remove('enabled');
            showDocBarBtn.innerHTML = '<i class="fas fa-columns"></i> Show Document Bar';
        }
    }

    toggleDocumentBarVisibility() {
        // If document bar is visible (not hidden), hide it
        // If hidden, show it
        if (!this.bubbleHidden) {
            this.hideDocumentBar();
        } else {
            this.showDocumentBar();
        }
    }

    openViewSettings() {
        // Placeholder for view settings modal
        this.showNotification('View Settings coming soon!');
    }

    hideDocumentBar() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        if (!hamburgerBtn || !sidebar) return;

        // Remember the state before hiding (was it docked or bubble?)
        this.wasDockedBeforeHide = !this.sidebarCollapsed;

        // If sidebar is expanded, collapse it visually (but remember it was docked)
        if (!this.sidebarCollapsed) {
            // Clear inline width so CSS collapsed class takes over
            sidebar.style.width = '';
            sidebar.classList.add('collapsed');
            // Note: we don't set this.sidebarCollapsed = true here anymore
            // We keep the original state so we can restore properly

            // Make button floating then hide it
            this.makeButtonFloating(hamburgerBtn);
        }

        // Hide the bubble
        this.bubbleHidden = true;
        hamburgerBtn.classList.add('hidden');
        this.saveSidebarState();
        this.updateDocBarHighlight();
        this.showNotification('Document bar hidden.', 'docBar');
    }

    showDocumentBar() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mainContent = document.querySelector('.main-content');

        if (!hamburgerBtn || !sidebar) return;

        // Unhide
        this.bubbleHidden = false;
        hamburgerBtn.classList.remove('hidden');

        // Restore to the state it was in before hiding
        if (this.wasDockedBeforeHide) {
            // It was docked before, so expand the sidebar
            this.updateSidebarPosition(sidebar, mainContent);
            this.makeButtonDocked(hamburgerBtn);
            this.sidebarCollapsed = false;
            sidebar.classList.remove('collapsed');

            requestAnimationFrame(() => {
                sidebar.style.width = `${this.sidebarWidth}px`;
            });

            this.updateSidebarWideClass();
        }
        // If it was in bubble mode before hiding, it's already in the right state
        // (collapsed with floating button visible)

        this.saveSidebarState();
        this.updateDocBarHighlight();
        this.showNotification('Document bar restored.', 'docBar');
    }

    loadSidebarState() {
        const saved = localStorage.getItem('wysiwyg_sidebar');
        if (saved) {
            const state = JSON.parse(saved);
            this.sidebarCollapsed = state.collapsed ?? false;
            this.sidebarWidth = state.width ?? 260;
            this.sidebarPosition = state.position ?? 'left';
            this.floatingBtnPos = state.floatingBtnPos ?? { x: 20, y: 100 };
            this.bubbleHidden = state.bubbleHidden ?? false;
            this.wasDockedBeforeHide = state.wasDockedBeforeHide ?? true;
        }
    }

    saveSidebarState() {
        localStorage.setItem('wysiwyg_sidebar', JSON.stringify({
            collapsed: this.sidebarCollapsed,
            width: this.sidebarWidth,
            position: this.sidebarPosition,
            floatingBtnPos: this.floatingBtnPos,
            bubbleHidden: this.bubbleHidden,
            wasDockedBeforeHide: this.wasDockedBeforeHide
        }));
    }

    applySidebarState() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mainContent = document.querySelector('.main-content');
        if (!sidebar || !hamburgerBtn) return;

        // Apply sidebar position
        this.updateSidebarPosition(sidebar, mainContent);

        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            this.makeButtonFloating(hamburgerBtn);

            // Apply bubble hidden state if applicable
            if (this.bubbleHidden) {
                hamburgerBtn.classList.add('hidden');
            }
        } else {
            sidebar.classList.remove('collapsed');
            sidebar.style.width = `${this.sidebarWidth}px`;
            this.makeButtonDocked(hamburgerBtn);
        }

        this.updateSidebarWideClass();
    }

    makeButtonFloating(btn) {
        btn.classList.add('floating');
        btn.style.left = `${this.floatingBtnPos.x}px`;
        btn.style.top = `${this.floatingBtnPos.y}px`;

        // Move button out of sidebar to body
        if (btn.parentElement !== document.body) {
            document.body.appendChild(btn);
        }
    }

    makeButtonDocked(btn) {
        btn.classList.remove('floating');
        btn.style.left = '';
        btn.style.top = '';
        btn.style.position = '';

        // Move button back to sidebar header
        const sidebarHeader = document.querySelector('.sidebar-header');
        if (sidebarHeader && btn.parentElement !== sidebarHeader) {
            sidebarHeader.insertBefore(btn, sidebarHeader.firstChild);
        }
    }

    initFloatingButtonDrag(btn) {
        let startX, startY, startLeft, startTop;
        let hasMoved = false;

        const onMouseDown = (e) => {
            if (!btn.classList.contains('floating')) return;

            e.preventDefault();
            startX = e.clientX || e.touches?.[0]?.clientX;
            startY = e.clientY || e.touches?.[0]?.clientY;
            startLeft = btn.offsetLeft;
            startTop = btn.offsetTop;
            hasMoved = false;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
        };

        const onMouseMove = (e) => {
            e.preventDefault();
            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const clientY = e.clientY || e.touches?.[0]?.clientY;

            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            // Only consider it a drag if moved more than 5px
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                hasMoved = true;
                this.isDraggingBtn = true;
            }

            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;

            // Keep button within viewport
            const btnWidth = btn.offsetWidth;
            const btnHeight = btn.offsetHeight;
            newLeft = Math.max(0, Math.min(window.innerWidth - btnWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - btnHeight, newTop));

            btn.style.left = `${newLeft}px`;
            btn.style.top = `${newTop}px`;

            this.floatingBtnPos = { x: newLeft, y: newTop };
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);

            // Save position
            this.saveSidebarState();

            // Reset dragging flag after a short delay to allow click to be ignored
            setTimeout(() => {
                this.isDraggingBtn = false;
            }, 100);
        };

        btn.addEventListener('mousedown', onMouseDown);
        btn.addEventListener('touchstart', onMouseDown, { passive: false });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mainContent = document.querySelector('.main-content');
        if (!sidebar || !hamburgerBtn) return;

        this.sidebarCollapsed = !this.sidebarCollapsed;

        if (this.sidebarCollapsed) {
            // Clear inline width so CSS collapsed class takes over
            sidebar.style.width = '';
            sidebar.classList.add('collapsed');
            // Small delay to ensure transition starts before moving button
            setTimeout(() => {
                this.makeButtonFloating(hamburgerBtn);
            }, 50);
        } else {
            // Determine which side to open based on button position
            const screenMiddle = window.innerWidth / 2;
            const buttonCenter = this.floatingBtnPos.x + (hamburgerBtn.offsetWidth / 2);
            const openOnRight = buttonCenter > screenMiddle;

            // Update sidebar position
            this.sidebarPosition = openOnRight ? 'right' : 'left';
            this.updateSidebarPosition(sidebar, mainContent);

            // First dock the button, then expand sidebar
            this.makeButtonDocked(hamburgerBtn);
            sidebar.classList.remove('collapsed');
            // Small delay then set width for smooth expansion
            requestAnimationFrame(() => {
                sidebar.style.width = `${this.sidebarWidth}px`;
            });
        }

        this.saveSidebarState();
        this.updateSidebarWideClass();
    }

    updateSidebarPosition(sidebar, mainContent) {
        if (!sidebar || !mainContent) return;

        if (this.sidebarPosition === 'right') {
            sidebar.classList.add('sidebar-right');
            mainContent.classList.add('sidebar-right');
        } else {
            sidebar.classList.remove('sidebar-right');
            mainContent.classList.remove('sidebar-right');
        }
    }

    initResizeHandle(sidebar, resizeHandle) {
        let startX, startWidth;

        const onMouseDown = (e) => {
            if (this.sidebarCollapsed) return;

            e.preventDefault();
            startX = e.clientX || e.touches?.[0]?.clientX;
            startWidth = sidebar.offsetWidth;

            this.isResizing = true;
            sidebar.classList.add('resizing');
            resizeHandle.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove, { passive: false });
            document.addEventListener('touchend', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!this.isResizing) return;

            e.preventDefault();
            const clientX = e.clientX || e.touches?.[0]?.clientX;
            const delta = clientX - startX;

            // If sidebar is on right, dragging left increases width
            let newWidth;
            if (this.sidebarPosition === 'right') {
                newWidth = startWidth - delta;
            } else {
                newWidth = startWidth + delta;
            }

            // Minimum width is 140px, maximum is 50% of viewport
            const minWidth = 140;
            const maxWidth = window.innerWidth * 0.5;

            // Clamp the width - never collapse via resize, only via hamburger button
            newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

            sidebar.style.width = `${newWidth}px`;
            this.sidebarWidth = newWidth;

            this.updateSidebarWideClass();
        };

        const onMouseUp = () => {
            if (!this.isResizing) return;

            this.isResizing = false;
            sidebar.classList.remove('resizing');
            resizeHandle.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);

            this.saveSidebarState();
        };

        resizeHandle.addEventListener('mousedown', onMouseDown);
        resizeHandle.addEventListener('touchstart', onMouseDown, { passive: false });

        // Double-click to reset width
        resizeHandle.addEventListener('dblclick', () => {
            this.sidebarWidth = 260;
            this.sidebarCollapsed = false;
            sidebar.classList.remove('collapsed');
            sidebar.style.width = '260px';
            this.saveSidebarState();
            this.updateSidebarWideClass();
        });
    }

    updateSidebarWideClass() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Add 'wide' class when sidebar is wider than 350px for grid layout
        const isWide = !this.sidebarCollapsed && this.sidebarWidth > 350;
        sidebar.classList.toggle('wide', isWide);
    }

    // ==================== Spellcheck & Autocorrect ====================

    initSpellcheckAutocorrect() {
        // Load saved settings
        this.loadSpellcheckSettings();

        // Default autocorrect rules
        this.defaultAutocorrectRules = {
            'teh': 'the',
            'adn': 'and',
            'dont': "don't",
            'doesnt': "doesn't",
            'didnt': "didn't",
            'cant': "can't",
            'wont': "won't",
            'youre': "you're",
            'theyre': "they're",
            'were': "we're",
            'hes': "he's",
            'shes': "she's",
            'its': "it's",
            'lets': "let's",
            'thats': "that's",
            'whats': "what's",
            'heres': "here's",
            'theres': "there's",
            'wheres': "where's",
            'wouldnt': "wouldn't",
            'couldnt': "couldn't",
            'shouldnt': "shouldn't",
            'hasnt': "hasn't",
            'hadnt': "hadn't",
            'isnt': "isn't",
            'arent': "aren't",
            'wasnt': "wasn't",
            'werent': "weren't",
            'im': "I'm",
            'ive': "I've",
            'ill': "I'll",
            'id': "I'd",
            'recieve': 'receive',
            'occured': 'occurred',
            'seperate': 'separate',
            'definately': 'definitely',
            'accomodate': 'accommodate',
            'occassion': 'occasion',
            'untill': 'until',
            'begining': 'beginning',
            'beleive': 'believe',
            'calender': 'calendar',
            'collegue': 'colleague',
            'commitee': 'committee',
            'concious': 'conscious',
            'enviroment': 'environment',
            'existance': 'existence',
            'fourty': 'forty',
            'goverment': 'government',
            'happend': 'happened',
            'harrass': 'harass',
            'immediatly': 'immediately',
            'independant': 'independent',
            'knowlege': 'knowledge',
            'liason': 'liaison',
            'mispell': 'misspell',
            'neccessary': 'necessary',
            'noticable': 'noticeable',
            'occurence': 'occurrence',
            'persistant': 'persistent',
            'posession': 'possession',
            'prefered': 'preferred',
            'priviledge': 'privilege',
            'publically': 'publicly',
            'recomend': 'recommend',
            'refered': 'referred',
            'relevent': 'relevant',
            'restauraunt': 'restaurant',
            'rythm': 'rhythm',
            'succesful': 'successful',
            'suprise': 'surprise',
            'tommorow': 'tomorrow',
            'truely': 'truly',
            'wierd': 'weird',
            '(c)': '©',
            '(r)': '®',
            '(tm)': '™',
            '->': '→',
            '<-': '←',
            '...': '…',
            '--': '—'
        };

        // Bind spellcheck menu toggle
        this.bindSpellcheckMenu();

        // Bind toggle switches
        this.bindSpellcheckToggles();

        // Bind dictionary modals
        this.bindDictionaryModals();

        // Bind editor input for autocorrect
        this.bindAutocorrectInput();
    }

    loadSpellcheckSettings() {
        const settings = localStorage.getItem('wysiwyg_spellcheck_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.spellcheckEnabled = parsed.spellcheck ?? true;
            this.autocorrectEnabled = parsed.autocorrect ?? true;
            this.autocapitalizeEnabled = parsed.autocapitalize ?? true;
        }

        // Apply initial spellcheck state
        this.editor.setAttribute('spellcheck', this.spellcheckEnabled);

        // Update toggle states
        const spellcheckToggle = document.getElementById('spellcheckToggle');
        const autocorrectToggle = document.getElementById('autocorrectToggle');
        const autocapitalizeToggle = document.getElementById('autocapitalizeToggle');

        if (spellcheckToggle) spellcheckToggle.checked = this.spellcheckEnabled;
        if (autocorrectToggle) autocorrectToggle.checked = this.autocorrectEnabled;
        if (autocapitalizeToggle) autocapitalizeToggle.checked = this.autocapitalizeEnabled;
    }

    saveSpellcheckSettings() {
        localStorage.setItem('wysiwyg_spellcheck_settings', JSON.stringify({
            spellcheck: this.spellcheckEnabled,
            autocorrect: this.autocorrectEnabled,
            autocapitalize: this.autocapitalizeEnabled
        }));
    }

    loadCustomDictionary() {
        const saved = localStorage.getItem('wysiwyg_custom_dictionary');
        return saved ? JSON.parse(saved) : [];
    }

    saveCustomDictionary() {
        localStorage.setItem('wysiwyg_custom_dictionary', JSON.stringify(this.customDictionary));
    }

    loadAutocorrectRules() {
        const saved = localStorage.getItem('wysiwyg_autocorrect_rules');
        return saved ? JSON.parse(saved) : {};
    }

    saveAutocorrectRules() {
        localStorage.setItem('wysiwyg_autocorrect_rules', JSON.stringify(this.autocorrectRules));
    }

    bindSpellcheckMenu() {
        const spellcheckBtn = document.getElementById('spellcheckBtn');
        const spellcheckMenu = document.getElementById('spellcheckMenu');

        if (!spellcheckBtn || !spellcheckMenu) return;

        spellcheckBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            spellcheckMenu.classList.toggle('show');
            spellcheckBtn.classList.toggle('active', spellcheckMenu.classList.contains('show'));
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!spellcheckBtn.contains(e.target) && !spellcheckMenu.contains(e.target)) {
                spellcheckMenu.classList.remove('show');
                spellcheckBtn.classList.remove('active');
            }
        });
    }

    bindSpellcheckToggles() {
        const spellcheckToggle = document.getElementById('spellcheckToggle');
        const autocorrectToggle = document.getElementById('autocorrectToggle');
        const autocapitalizeToggle = document.getElementById('autocapitalizeToggle');

        if (spellcheckToggle) {
            spellcheckToggle.addEventListener('change', (e) => {
                this.spellcheckEnabled = e.target.checked;
                this.editor.setAttribute('spellcheck', this.spellcheckEnabled);
                this.saveSpellcheckSettings();
                this.showNotification(`Spell check ${this.spellcheckEnabled ? 'enabled' : 'disabled'}`, 'spellcheck');
            });
        }

        if (autocorrectToggle) {
            autocorrectToggle.addEventListener('change', (e) => {
                this.autocorrectEnabled = e.target.checked;
                this.saveSpellcheckSettings();
                this.showNotification(`Autocorrect ${this.autocorrectEnabled ? 'enabled' : 'disabled'}`, 'spellcheck');
            });
        }

        if (autocapitalizeToggle) {
            autocapitalizeToggle.addEventListener('change', (e) => {
                this.autocapitalizeEnabled = e.target.checked;
                this.saveSpellcheckSettings();
                this.showNotification(`Auto-capitalize ${this.autocapitalizeEnabled ? 'enabled' : 'disabled'}`, 'spellcheck');
            });
        }
    }

    bindDictionaryModals() {
        const addWordBtn = document.getElementById('addWordBtn');
        const manageWordsBtn = document.getElementById('manageWordsBtn');
        const saveWordBtn = document.getElementById('saveWordBtn');
        const addAutocorrectBtn = document.getElementById('addAutocorrectBtn');

        if (addWordBtn) {
            addWordBtn.addEventListener('click', () => {
                document.getElementById('spellcheckMenu').classList.remove('show');
                document.getElementById('spellcheckBtn').classList.remove('active');
                this.openModal('addWordModal');
            });
        }

        if (manageWordsBtn) {
            manageWordsBtn.addEventListener('click', () => {
                document.getElementById('spellcheckMenu').classList.remove('show');
                document.getElementById('spellcheckBtn').classList.remove('active');
                this.renderDictionaryLists();
                this.openModal('dictionaryModal');
            });
        }

        if (saveWordBtn) {
            saveWordBtn.addEventListener('click', () => {
                const newWord = document.getElementById('newWord').value.trim().toLowerCase();
                if (newWord && !this.customDictionary.includes(newWord)) {
                    this.customDictionary.push(newWord);
                    this.saveCustomDictionary();
                    this.showNotification(`"${newWord}" added to dictionary`, 'spellcheck');
                }
                document.getElementById('newWord').value = '';
                this.closeModal('addWordModal');
            });
        }

        if (addAutocorrectBtn) {
            addAutocorrectBtn.addEventListener('click', () => {
                this.addAutocorrectRule();
            });
        }

        // Enter key in autocorrect inputs
        const autocorrectFrom = document.getElementById('autocorrectFrom');
        const autocorrectTo = document.getElementById('autocorrectTo');

        if (autocorrectFrom) {
            autocorrectFrom.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    autocorrectTo.focus();
                }
            });
        }

        if (autocorrectTo) {
            autocorrectTo.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.addAutocorrectRule();
                }
            });
        }
    }

    addAutocorrectRule() {
        const fromInput = document.getElementById('autocorrectFrom');
        const toInput = document.getElementById('autocorrectTo');
        const from = fromInput.value.trim().toLowerCase();
        const to = toInput.value.trim();

        if (from && to) {
            this.autocorrectRules[from] = to;
            this.saveAutocorrectRules();
            this.renderDictionaryLists();
            fromInput.value = '';
            toInput.value = '';
            this.showNotification(`Autocorrect rule added: "${from}" → "${to}"`, 'spellcheck');
        }
    }

    renderDictionaryLists() {
        // Render custom words
        const customWordsList = document.getElementById('customWordsList');
        if (customWordsList) {
            if (this.customDictionary.length === 0) {
                customWordsList.innerHTML = '<p class="empty-message">No custom words added yet.</p>';
            } else {
                customWordsList.innerHTML = this.customDictionary.map(word => `
                    <div class="dictionary-item">
                        <span class="word">${word}</span>
                        <button class="delete-word-btn" data-word="${word}" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');

                // Bind delete buttons
                customWordsList.querySelectorAll('.delete-word-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const word = btn.dataset.word;
                        this.customDictionary = this.customDictionary.filter(w => w !== word);
                        this.saveCustomDictionary();
                        this.renderDictionaryLists();
                        this.showNotification(`"${word}" removed from dictionary`, 'spellcheck');
                    });
                });
            }
        }

        // Render autocorrect rules
        const autocorrectRulesList = document.getElementById('autocorrectRulesList');
        if (autocorrectRulesList) {
            const rules = Object.entries(this.autocorrectRules);
            if (rules.length === 0) {
                autocorrectRulesList.innerHTML = '<p class="empty-message">No custom autocorrect rules.</p>';
            } else {
                autocorrectRulesList.innerHTML = rules.map(([from, to]) => `
                    <div class="dictionary-item">
                        <span class="word">${from}</span>
                        <span class="arrow"><i class="fas fa-arrow-right"></i></span>
                        <span class="replacement">${to}</span>
                        <button class="delete-word-btn" data-from="${from}" title="Remove">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');

                // Bind delete buttons
                autocorrectRulesList.querySelectorAll('.delete-word-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const from = btn.dataset.from;
                        delete this.autocorrectRules[from];
                        this.saveAutocorrectRules();
                        this.renderDictionaryLists();
                        this.showNotification(`Autocorrect rule removed`, 'spellcheck');
                    });
                });
            }
        }
    }

    bindAutocorrectInput() {
        const popup = document.getElementById('autocorrectPopup');
        const suggestion = document.getElementById('autocorrectSuggestion');
        const acceptBtn = document.getElementById('acceptCorrection');
        const dismissBtn = document.getElementById('dismissCorrection');

        if (!popup || !acceptBtn || !dismissBtn) return;

        // Listen for input events
        this.editor.addEventListener('input', (e) => {
            if (!this.autocorrectEnabled && !this.autocapitalizeEnabled) return;

            // Get the current word being typed
            this.checkForAutocorrect();
        });

        // Accept correction
        acceptBtn.addEventListener('click', () => {
            this.applyCorrection();
        });

        // Dismiss correction
        dismissBtn.addEventListener('click', () => {
            this.hideAutocorrectPopup();
        });

        // Keyboard shortcuts for popup
        this.editor.addEventListener('keydown', (e) => {
            if (this.pendingCorrection) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    this.applyCorrection();
                } else if (e.key === 'Escape') {
                    this.hideAutocorrectPopup();
                }
            }

            // Auto-apply correction on space or punctuation
            if (this.autocorrectEnabled && (e.key === ' ' || e.key === '.' || e.key === ',' || e.key === '!' || e.key === '?')) {
                this.autoApplyCorrection();
            }
        });
    }

    checkForAutocorrect() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent;
        const cursorPos = range.startOffset;

        // Find the word before cursor
        let wordStart = cursorPos - 1;
        while (wordStart >= 0 && /\S/.test(text[wordStart])) {
            wordStart--;
        }
        wordStart++;

        const word = text.substring(wordStart, cursorPos).toLowerCase();

        if (word.length < 2) {
            this.hideAutocorrectPopup();
            return;
        }

        // Check for autocorrect match
        const allRules = { ...this.defaultAutocorrectRules, ...this.autocorrectRules };
        const correction = allRules[word];

        if (correction && !this.customDictionary.includes(word)) {
            this.showAutocorrectPopup(word, correction, textNode, wordStart, cursorPos);
        } else {
            this.hideAutocorrectPopup();
        }
    }

    showAutocorrectPopup(word, correction, textNode, wordStart, wordEnd) {
        const popup = document.getElementById('autocorrectPopup');
        const suggestion = document.getElementById('autocorrectSuggestion');

        if (!popup || !suggestion) return;

        this.pendingCorrection = {
            word,
            correction,
            textNode,
            wordStart,
            wordEnd
        };

        suggestion.innerHTML = `<strong>${correction}</strong>`;

        // Position popup near the word
        const selection = window.getSelection();
        if (selection.rangeCount) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            const editorRect = this.editor.getBoundingClientRect();

            popup.style.top = `${rect.bottom - editorRect.top + 10}px`;
            popup.style.left = `${rect.left - editorRect.left}px`;
        }

        popup.classList.add('show');
    }

    hideAutocorrectPopup() {
        const popup = document.getElementById('autocorrectPopup');
        if (popup) {
            popup.classList.remove('show');
        }
        this.pendingCorrection = null;
    }

    applyCorrection() {
        if (!this.pendingCorrection) return;

        const { correction, textNode, wordStart, wordEnd } = this.pendingCorrection;

        // Replace the word
        const text = textNode.textContent;
        const newText = text.substring(0, wordStart) + correction + text.substring(wordEnd);
        textNode.textContent = newText;

        // Move cursor to end of corrected word
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(textNode, wordStart + correction.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        this.hideAutocorrectPopup();
    }

    autoApplyCorrection() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;

        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent;
        const cursorPos = range.startOffset;

        // Find the last word before cursor
        let wordEnd = cursorPos;
        let wordStart = cursorPos - 1;

        while (wordStart >= 0 && /\S/.test(text[wordStart])) {
            wordStart--;
        }
        wordStart++;

        const word = text.substring(wordStart, wordEnd).toLowerCase();

        if (word.length < 2) return;

        // Check for autocorrect match
        const allRules = { ...this.defaultAutocorrectRules, ...this.autocorrectRules };
        let correction = allRules[word];

        // Apply auto-capitalize if enabled
        if (!correction && this.autocapitalizeEnabled) {
            // Capitalize first letter after sentence-ending punctuation
            if (wordStart > 0) {
                const beforeWord = text.substring(0, wordStart).trimEnd();
                if (beforeWord.length === 0 || /[.!?]$/.test(beforeWord)) {
                    if (word.length > 0 && word[0] === word[0].toLowerCase()) {
                        correction = word.charAt(0).toUpperCase() + word.slice(1);
                    }
                }
            } else if (wordStart === 0 && word.length > 0) {
                // Capitalize first word of content
                correction = word.charAt(0).toUpperCase() + word.slice(1);
            }
        }

        if (correction && !this.customDictionary.includes(word)) {
            // Apply the correction
            const newText = text.substring(0, wordStart) + correction + text.substring(wordEnd);
            textNode.textContent = newText;

            // Restore cursor position
            const newCursorPos = wordStart + correction.length;
            range.setStart(textNode, newCursorPos);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.hideAutocorrectPopup();
    }

    // ==================== Toolbar Commands ====================

    bindToolbarButtons() {
        const buttons = document.querySelectorAll('.toolbar-btn[data-command]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                this.editor.focus();
                this.updateActiveStates();
            });
        });
    }

    bindSelects() {
        // Format Block (headings, paragraph, etc.)
        const formatBlock = document.getElementById('formatBlock');
        formatBlock.addEventListener('change', (e) => {
            document.execCommand('formatBlock', false, e.target.value);
            this.editor.focus();
        });

        // Font Name
        const fontName = document.getElementById('fontName');
        fontName.addEventListener('change', (e) => {
            document.execCommand('fontName', false, e.target.value);
            this.editor.focus();
        });

        // Font Size
        const fontSize = document.getElementById('fontSize');
        fontSize.addEventListener('change', (e) => {
            document.execCommand('fontSize', false, e.target.value);
            this.editor.focus();
        });
    }

    bindColorPickers() {
        // Text Color
        const foreColor = document.getElementById('foreColor');
        foreColor.addEventListener('input', (e) => {
            document.execCommand('foreColor', false, e.target.value);
            this.editor.focus();
        });

        // Background/Highlight Color
        const backColor = document.getElementById('backColor');
        backColor.addEventListener('input', (e) => {
            document.execCommand('hiliteColor', false, e.target.value);
            this.editor.focus();
        });
    }

    bindSpecialButtons() {
        // Link Button
        document.getElementById('linkBtn').addEventListener('click', () => {
            this.saveSelection();
            this.openModal('linkModal');
        });

        // Unlink Button
        document.getElementById('unlinkBtn').addEventListener('click', () => {
            document.execCommand('unlink', false, null);
            this.editor.focus();
        });

        // Image Button
        document.getElementById('imageBtn').addEventListener('click', () => {
            this.saveSelection();
            this.openModal('imageModal');
        });

        // Table Button
        document.getElementById('tableBtn').addEventListener('click', () => {
            this.saveSelection();
            this.openModal('tableModal');
        });
    }

    // ==================== Modals ====================

    bindModals() {
        // Close buttons
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(btn.dataset.modal);
            });
        });

        // Close on backdrop click - for generic modals (link, image, table)
        // These don't have save/cancel, so we treat them specially
        document.querySelectorAll('.modal').forEach(modal => {
            // Skip modals that are handled elsewhere (theme, advanced settings, etc.)
            const handledModals = [
                'themeModal', 'advancedSettingsModal', 'toastSettingsModal',
                'resetModal', 'createFolderModal', 'renameFolderModal', 'autoSaveWarningModal',
                'deleteDocModal'
            ];

            if (handledModals.includes(modal.id)) return;

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    // For insert modals, always just close (cancel behavior)
                    if (this.modalClickOutside !== 'nothing') {
                        this.closeModal(modal.id);
                    }
                }
            });
        });

        // Insert Link
        document.getElementById('insertLinkBtn').addEventListener('click', () => {
            const url = document.getElementById('linkUrl').value;
            const text = document.getElementById('linkText').value;

            if (url) {
                this.restoreSelection();
                if (text) {
                    document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`);
                } else {
                    document.execCommand('createLink', false, url);
                }
                this.closeModal('linkModal');
                document.getElementById('linkUrl').value = '';
                document.getElementById('linkText').value = '';
            }
        });

        // Insert Image
        document.getElementById('insertImageBtn').addEventListener('click', () => {
            const url = document.getElementById('imageUrl').value;
            const alt = document.getElementById('imageAlt').value;

            if (url) {
                this.restoreSelection();
                const img = `<img src="${url}" alt="${alt || 'Image'}" />`;
                document.execCommand('insertHTML', false, img);
                this.closeModal('imageModal');
                document.getElementById('imageUrl').value = '';
                document.getElementById('imageAlt').value = '';
            }
        });

        // Insert Table
        document.getElementById('insertTableBtn').addEventListener('click', () => {
            const rows = parseInt(document.getElementById('tableRows').value) || 3;
            const cols = parseInt(document.getElementById('tableCols').value) || 3;
            const hasHeader = document.getElementById('tableHeader').checked;

            const table = this.createTable(rows, cols, hasHeader);
            this.restoreSelection();
            document.execCommand('insertHTML', false, table);
            this.closeModal('tableModal');
        });

        // Enter key in modals
        document.querySelectorAll('.modal input').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const modal = input.closest('.modal');
                    const insertBtn = modal.querySelector('.btn-primary');
                    insertBtn.click();
                }
            });
        });
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        const firstInput = document.querySelector(`#${modalId} input`);
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        this.editor.focus();
    }

    createTable(rows, cols, hasHeader) {
        let html = '<table>';

        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                if (i === 0 && hasHeader) {
                    html += `<th>Header ${j + 1}</th>`;
                } else {
                    html += `<td>Cell</td>`;
                }
            }
            html += '</tr>';
        }

        html += '</table>';
        return html;
    }

    // ==================== Selection Management ====================

    saveSelection() {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            this.savedRange = sel.getRangeAt(0);
        }
    }

    restoreSelection() {
        if (this.savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this.savedRange);
        }
        this.editor.focus();
    }

    // ==================== Header Actions ====================

    bindHeaderActions() {
        // Reset Button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.showResetConfirmation();
        });

        // New Document
        document.getElementById('newDocBtn').addEventListener('click', () => {
            this.openEditor();
            this.newDocument();
        });

        // Save Document
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveDocument();
        });

        // Export Dropdown
        const exportBtn = document.getElementById('exportBtn');
        const exportMenu = document.getElementById('exportMenu');

        exportBtn.addEventListener('click', () => {
            exportMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!exportBtn.contains(e.target) && !exportMenu.contains(e.target)) {
                exportMenu.classList.remove('show');
            }
        });

        // Export HTML
        document.getElementById('exportHtml').addEventListener('click', () => {
            this.exportAsHTML();
            exportMenu.classList.remove('show');
        });

        // Export Text
        document.getElementById('exportText').addEventListener('click', () => {
            this.exportAsText();
            exportMenu.classList.remove('show');
        });

        // Print/PDF
        document.getElementById('exportPdf').addEventListener('click', () => {
            window.print();
            exportMenu.classList.remove('show');
        });
    }

    // ==================== Reset Functionality ====================

    showResetConfirmation() {
        document.getElementById('resetModal').classList.add('show');
    }

    closeResetModal() {
        document.getElementById('resetModal').classList.remove('show');
    }

    initResetModal() {
        const resetModal = document.getElementById('resetModal');
        const resetModalClose = document.getElementById('resetModalClose');
        const resetCancelBtn = document.getElementById('resetCancelBtn');
        const resetConfirmBtn = document.getElementById('resetConfirmBtn');

        if (resetModalClose) {
            resetModalClose.addEventListener('click', () => this.closeResetModal());
        }
        if (resetCancelBtn) {
            resetCancelBtn.addEventListener('click', () => this.closeResetModal());
        }
        if (resetConfirmBtn) {
            resetConfirmBtn.addEventListener('click', () => this.resetAllData());
        }

        // Close on backdrop click - Reset modal only allows cancel (no save option for safety)
        if (resetModal) {
            resetModal.addEventListener('click', (e) => {
                if (e.target === resetModal) {
                    this.handleModalClickOutside(
                        'resetModal',
                        null, // No save action for reset modal
                        () => this.closeResetModal()
                    );
                }
            });
        }
    }

    resetAllData() {
        // Clear all localStorage data for this app
        const keysToRemove = [
            'wysiwyg_documents',
            'wysiwyg_theme_mode',
            'wysiwyg_color_theme',
            'wysiwyg_sidebar',
            'wysiwyg_spellcheck_settings',
            'wysiwyg_custom_dictionary',
            'wysiwyg_autocorrect_rules',
            'wysiwyg_autosave_settings',
            'wysiwyg_autosave_documents',
            'wysiwyg_toast_settings',
            'wysiwyg_folders',
            'wysiwyg_accordion_state',
            'wysiwyg_flag_border_width',
            'wysiwyg_modal_click_outside',
            'wysiwyg_default_load_action',
            'wysiwyg_theme' // Legacy key
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        // Also clear any other wysiwyg_ prefixed keys that might exist
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('wysiwyg_')) {
                localStorage.removeItem(key);
            }
        });

        // Clear sessionStorage as well
        sessionStorage.clear();

        // Force a hard refresh
        window.location.reload(true);
    }

    // ==================== Settings Menu ====================

    initSettingsMenu() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsMenu = document.getElementById('settingsMenu');
        const autoSaveToggleBtn = document.getElementById('autoSaveToggleBtn');
        const advancedSettingsBtn = document.getElementById('advancedSettingsBtn');

        if (!settingsBtn || !settingsMenu) return;

        // Toggle settings menu
        settingsBtn.addEventListener('click', () => {
            settingsMenu.classList.toggle('show');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
                settingsMenu.classList.remove('show');
            }
        });

        // Auto-save toggle
        if (autoSaveToggleBtn) {
            this.updateAutoSaveIndicator();
            autoSaveToggleBtn.addEventListener('click', () => {
                this.toggleAutoSave();
            });
        }

        // Advanced settings
        if (advancedSettingsBtn) {
            advancedSettingsBtn.addEventListener('click', () => {
                settingsMenu.classList.remove('show');
                this.openAdvancedSettings();
            });
        }

        // Initialize advanced settings modal
        this.initAdvancedSettingsModal();
    }

    initAdvancedSettingsModal() {
        const modal = document.getElementById('advancedSettingsModal');
        const closeBtn = document.getElementById('advancedSettingsModalClose');
        const cancelBtn = document.getElementById('advancedSettingsCancelBtn');
        const saveBtn = document.getElementById('advancedSettingsSaveBtn');
        const valueInput = document.getElementById('autoSaveValue');
        const unitSelect = document.getElementById('autoSaveUnit');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAdvancedSettings());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeAdvancedSettings());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAdvancedSettings());
        }

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.handleModalClickOutside(
                        'advancedSettingsModal',
                        () => this.saveAdvancedSettings(),
                        () => this.closeAdvancedSettings()
                    );
                }
            });
        }

        // Update hint when values change
        if (valueInput) {
            valueInput.addEventListener('input', () => this.updateAutoSaveHint());
        }
        if (unitSelect) {
            unitSelect.addEventListener('change', () => this.updateAutoSaveHint());
        }

        // Custom number input controls
        this.initNumberInputControls();
    }

    initNumberInputControls() {
        document.querySelectorAll('.num-up').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById(btn.dataset.target);
                if (input) {
                    const max = parseInt(input.max) || 999;
                    const current = parseInt(input.value) || 0;
                    if (current < max) {
                        input.value = current + 1;
                        input.dispatchEvent(new Event('input'));
                    }
                }
            });
        });

        document.querySelectorAll('.num-down').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById(btn.dataset.target);
                if (input) {
                    const min = parseInt(input.min) || 1;
                    const current = parseInt(input.value) || 0;
                    if (current > min) {
                        input.value = current - 1;
                        input.dispatchEvent(new Event('input'));
                    }
                }
            });
        });
    }

    openAdvancedSettings() {
        const modal = document.getElementById('advancedSettingsModal');
        const valueInput = document.getElementById('autoSaveValue');
        const unitSelect = document.getElementById('autoSaveUnit');
        const limitInput = document.getElementById('autoSaveLimit');
        const deleteInput = document.getElementById('autoDeleteDays');
        const flagBorderInput = document.getElementById('flagBorderWidth');
        const modalClickOutsideSelect = document.getElementById('modalClickOutside');
        const defaultLoadActionSelect = document.getElementById('defaultLoadAction');

        // Populate current values
        if (valueInput) valueInput.value = this.autoSaveValue;
        if (unitSelect) unitSelect.value = this.autoSaveUnit;
        if (limitInput) limitInput.value = this.autoSaveLimit;
        if (deleteInput) deleteInput.value = this.autoDeleteDays;
        if (flagBorderInput) flagBorderInput.value = this.flagBorderWidth;
        if (modalClickOutsideSelect) modalClickOutsideSelect.value = this.modalClickOutside;
        if (defaultLoadActionSelect) defaultLoadActionSelect.value = this.defaultLoadAction;

        this.updateAutoSaveHint();
        modal.classList.add('show');
    }

    closeAdvancedSettings() {
        document.getElementById('advancedSettingsModal').classList.remove('show');
    }

    saveAdvancedSettings() {
        const valueInput = document.getElementById('autoSaveValue');
        const unitSelect = document.getElementById('autoSaveUnit');
        const limitInput = document.getElementById('autoSaveLimit');
        const deleteInput = document.getElementById('autoDeleteDays');
        const flagBorderInput = document.getElementById('flagBorderWidth');
        const modalClickOutsideSelect = document.getElementById('modalClickOutside');
        const defaultLoadActionSelect = document.getElementById('defaultLoadAction');

        const newValue = parseInt(valueInput.value) || 5;
        const newUnit = unitSelect.value;
        const newLimit = parseInt(limitInput.value) || 3;
        const newDeleteDays = parseInt(deleteInput.value) || 7;
        const newFlagBorderWidth = parseInt(flagBorderInput.value) || 3;
        const newModalClickOutside = modalClickOutsideSelect.value;
        const newDefaultLoadAction = defaultLoadActionSelect.value;

        // Validate
        if (newValue < 1) {
            valueInput.value = 1;
            return;
        }
        if (newLimit < 1) {
            limitInput.value = 1;
            return;
        }
        if (newDeleteDays < 1) {
            deleteInput.value = 1;
            return;
        }
        if (newFlagBorderWidth < 1 || newFlagBorderWidth > 10) {
            flagBorderInput.value = 3;
            return;
        }

        this.autoSaveValue = newValue;
        this.autoSaveUnit = newUnit;
        this.autoSaveLimit = newLimit;
        this.autoDeleteDays = newDeleteDays;
        this.flagBorderWidth = newFlagBorderWidth;
        this.modalClickOutside = newModalClickOutside;
        this.defaultLoadAction = newDefaultLoadAction;
        this.saveAutoSaveSettings();
        this.saveFlagBorderWidth();
        this.saveModalClickOutside();
        this.saveDefaultLoadAction();

        // Apply flag border width immediately
        this.applyFlagToEditor();

        // Apply new limit - remove excess auto-saves
        while (this.autoSaveDocuments.length > this.autoSaveLimit) {
            this.autoSaveDocuments.pop();
        }
        this.saveAutoSaveDocuments();
        this.renderAutoSaveDocumentList();

        // Restart auto-save if enabled
        if (this.autoSaveEnabled) {
            this.stopAutoSave();
            this.startAutoSave();
        }

        this.closeAdvancedSettings();
        this.showNotification('Settings saved!', 'settings');
    }

    updateAutoSaveHint() {
        const hint = document.getElementById('autoSaveHint');
        const valueInput = document.getElementById('autoSaveValue');
        const unitSelect = document.getElementById('autoSaveUnit');

        if (!hint || !valueInput || !unitSelect) return;

        const value = valueInput.value || 5;
        const unit = unitSelect.value;

        const unitLabels = {
            'minutes': value == 1 ? 'minute' : 'minutes',
            'seconds': value == 1 ? 'second' : 'seconds',
            'words': value == 1 ? 'word typed' : 'words typed',
            'characters': value == 1 ? 'character typed' : 'characters typed',
            'changes': value == 1 ? 'change made' : 'changes made'
        };

        hint.textContent = `Document will be saved every ${value} ${unitLabels[unit]}.`;
    }

    // ==================== Toast Settings ====================

    loadToastSettings() {
        const saved = localStorage.getItem('wysiwyg_toast_settings');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default settings - all enabled
        return {
            enabled: true,
            autoSave: true,
            docSave: true,
            docDelete: true,
            theme: true,
            settings: true,
            spellcheck: true,
            docBar: true
        };
    }

    saveToastSettings() {
        localStorage.setItem('wysiwyg_toast_settings', JSON.stringify(this.toastSettings));
    }

    initToastSettingsModal() {
        const toastSettingsBtn = document.getElementById('toastSettingsBtn');
        const modal = document.getElementById('toastSettingsModal');
        const closeBtn = document.getElementById('toastSettingsModalClose');
        const cancelBtn = document.getElementById('toastSettingsCancelBtn');
        const saveBtn = document.getElementById('toastSettingsSaveBtn');
        const masterToggle = document.getElementById('toastMasterToggle');

        // Open toast settings from advanced settings
        if (toastSettingsBtn) {
            toastSettingsBtn.addEventListener('click', () => {
                this.openToastSettings();
            });
        }

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeToastSettings(false));
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeToastSettings(false));
        }

        // Save button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveToastSettingsAndClose());
        }

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.handleModalClickOutside(
                        'toastSettingsModal',
                        () => this.saveToastSettingsAndClose(),
                        () => this.closeToastSettings(false)
                    );
                }
            });
        }

        // Master toggle functionality
        if (masterToggle) {
            masterToggle.addEventListener('change', () => {
                this.updateIndividualToastOptions();
            });
        }
    }

    openToastSettings() {
        // Store that we came from advanced settings
        this.previousModal = 'advancedSettingsModal';

        // Close advanced settings modal
        document.getElementById('advancedSettingsModal').classList.remove('show');

        // Populate current values
        document.getElementById('toastMasterToggle').checked = this.toastSettings.enabled;
        document.getElementById('toastAutoSave').checked = this.toastSettings.autoSave;
        document.getElementById('toastDocSave').checked = this.toastSettings.docSave;
        document.getElementById('toastDocDelete').checked = this.toastSettings.docDelete;
        document.getElementById('toastTheme').checked = this.toastSettings.theme;
        document.getElementById('toastSettings').checked = this.toastSettings.settings;
        document.getElementById('toastSpellcheck').checked = this.toastSettings.spellcheck;
        document.getElementById('toastDocBar').checked = this.toastSettings.docBar;

        // Update individual options state
        this.updateIndividualToastOptions();

        // Open toast settings modal
        document.getElementById('toastSettingsModal').classList.add('show');
    }

    updateIndividualToastOptions() {
        const masterEnabled = document.getElementById('toastMasterToggle').checked;
        const individualSettings = document.getElementById('toastIndividualSettings');

        if (masterEnabled) {
            individualSettings.classList.remove('disabled');
        } else {
            individualSettings.classList.add('disabled');
        }
    }

    closeToastSettings(saveChanges = false) {
        // Close toast settings modal
        document.getElementById('toastSettingsModal').classList.remove('show');

        // Re-open the previous modal if there was one
        if (this.previousModal) {
            setTimeout(() => {
                document.getElementById(this.previousModal).classList.add('show');
                this.previousModal = null;
            }, 150); // Small delay for smooth transition
        }
    }

    saveToastSettingsAndClose() {
        // Save all toast settings
        this.toastSettings = {
            enabled: document.getElementById('toastMasterToggle').checked,
            autoSave: document.getElementById('toastAutoSave').checked,
            docSave: document.getElementById('toastDocSave').checked,
            docDelete: document.getElementById('toastDocDelete').checked,
            theme: document.getElementById('toastTheme').checked,
            settings: document.getElementById('toastSettings').checked,
            spellcheck: document.getElementById('toastSpellcheck').checked,
            docBar: document.getElementById('toastDocBar').checked
        };

        this.saveToastSettings();

        // Close and return to previous modal
        document.getElementById('toastSettingsModal').classList.remove('show');

        if (this.previousModal) {
            setTimeout(() => {
                document.getElementById(this.previousModal).classList.add('show');
                this.previousModal = null;
            }, 150);
        }

        // Show confirmation if notifications are enabled
        if (this.toastSettings.enabled && this.toastSettings.settings) {
            this.showNotification('Toast settings saved!', 'settings');
        }
    }

    // ==================== Folders ====================

    loadFolders() {
        const saved = localStorage.getItem('wysiwyg_folders');
        return saved ? JSON.parse(saved) : [];
    }

    saveFolders() {
        localStorage.setItem('wysiwyg_folders', JSON.stringify(this.folders));
    }

    loadAccordionState() {
        const saved = localStorage.getItem('wysiwyg_accordion_state');
        return saved ? JSON.parse(saved) : { saved: false, folders: false, autosave: false };
    }

    saveAccordionState() {
        localStorage.setItem('wysiwyg_accordion_state', JSON.stringify(this.accordionState));
    }

    initAccordion() {
        // Apply saved accordion state
        Object.keys(this.accordionState).forEach(section => {
            if (this.accordionState[section]) {
                const sectionEl = document.querySelector(`.accordion-section[data-section="${section}"]`);
                if (sectionEl) {
                    sectionEl.classList.add('collapsed');
                }
            }
        });

        // Bind accordion toggle clicks
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const section = header.dataset.toggle;
                const sectionEl = header.closest('.accordion-section');

                sectionEl.classList.toggle('collapsed');
                this.accordionState[section] = sectionEl.classList.contains('collapsed');
                this.saveAccordionState();
            });
        });
    }

    initFolders() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const addBtn = document.getElementById('addBtn');
        const hamburgerContextMenu = document.getElementById('hamburgerContextMenu');
        const addContextMenu = document.getElementById('addContextMenu');
        const docContextMenu = document.getElementById('docContextMenu');
        const folderContextMenu = document.getElementById('folderContextMenu');

        // Right-click on hamburger button - show hide document bar option
        hamburgerBtn.addEventListener('contextmenu', (e) => {
            if (!this.sidebarCollapsed) {
                e.preventDefault();
                e.stopPropagation();
                this.hideAllContextMenus();
                this.showContextMenu(hamburgerContextMenu, e.clientX, e.clientY);
            }
        });

        // Hide document bar from hamburger context menu
        document.getElementById('hideHamburgerBtn').addEventListener('click', () => {
            this.hideAllContextMenus();
            this.toggleSidebar();
        });

        // Click on plus button - show add menu
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideAllContextMenus();
            const rect = addBtn.getBoundingClientRect();
            this.showContextMenu(addContextMenu, rect.left, rect.bottom + 4);
        });

        // New folder button from add menu
        document.getElementById('newFolderBtn').addEventListener('click', () => {
            this.hideAllContextMenus();
            this.openCreateFolderModal();
        });

        // Create folder modal
        document.getElementById('createFolderModalClose').addEventListener('click', () => {
            this.closeCreateFolderModal();
        });
        document.getElementById('createFolderCancelBtn').addEventListener('click', () => {
            this.closeCreateFolderModal();
        });
        document.getElementById('createFolderConfirmBtn').addEventListener('click', () => {
            this.createFolder();
        });
        document.getElementById('createFolderModal').addEventListener('click', (e) => {
            if (e.target.id === 'createFolderModal') {
                this.handleModalClickOutside(
                    'createFolderModal',
                    () => this.createFolder(),
                    () => this.closeCreateFolderModal()
                );
            }
        });
        document.getElementById('folderNameInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.createFolder();
        });

        // Rename folder modal
        document.getElementById('renameFolderModalClose').addEventListener('click', () => {
            this.closeRenameFolderModal();
        });
        document.getElementById('renameFolderCancelBtn').addEventListener('click', () => {
            this.closeRenameFolderModal();
        });
        document.getElementById('renameFolderConfirmBtn').addEventListener('click', () => {
            this.renameFolder();
        });
        document.getElementById('renameFolderModal').addEventListener('click', (e) => {
            if (e.target.id === 'renameFolderModal') {
                this.handleModalClickOutside(
                    'renameFolderModal',
                    () => this.renameFolder(),
                    () => this.closeRenameFolderModal()
                );
            }
        });
        document.getElementById('renameFolderInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.renameFolder();
        });

        // Folder context menu actions
        document.getElementById('openFolderBtn').addEventListener('click', () => {
            this.hideAllContextMenus();
            this.openFolder(this.contextFolderId);
        });
        document.getElementById('renameFolderBtn').addEventListener('click', () => {
            this.hideAllContextMenus();
            this.openRenameFolderModal();
        });
        document.getElementById('deleteFolderBtn').addEventListener('click', () => {
            this.hideAllContextMenus();
            this.deleteFolder(this.contextFolderId);
        });

        // Back button
        document.getElementById('folderBackBtn').addEventListener('click', () => {
            this.exitFolderView();
        });

        // Close context menus on click outside
        document.addEventListener('click', () => {
            this.hideAllContextMenus();
        });

        // Close context menus on scroll
        document.addEventListener('scroll', () => {
            this.hideAllContextMenus();
        }, true);
    }

    hideAllContextMenus() {
        document.querySelectorAll('.bubble-context-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    showContextMenu(menu, x, y) {
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('show');

        // Adjust if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${y - rect.height}px`;
        }
    }

    showFolderContextMenu(e, folderId) {
        e.preventDefault();
        e.stopPropagation();

        this.contextFolderId = folderId;

        this.hideAllContextMenus();

        const menu = document.getElementById('folderContextMenu');
        this.showContextMenu(menu, e.clientX, e.clientY);
    }

    // ==================== Document Context Menu ====================

    showDocumentContextMenu(e, docId, docType) {
        e.preventDefault();
        e.stopPropagation();

        this.contextDocId = docId;
        this.contextDocType = docType;

        this.hideAllContextMenus();

        const menu = document.getElementById('docContextMenu');
        this.showContextMenu(menu, e.clientX, e.clientY);
    }

    showMoveToSubmenu(triggerEl) {
        const submenu = document.getElementById('moveToSubmenu');
        const folderList = document.getElementById('moveToFolderList');
        const noFoldersMsg = document.getElementById('noFoldersMsg');
        const divider = document.getElementById('moveToSubmenuDivider');

        // Get current folder of the document (if any)
        const currentFolderId = this.getDocumentFolderId(this.contextDocId, this.contextDocType);

        // Populate folder list
        if (this.folders.length === 0) {
            folderList.innerHTML = '';
            noFoldersMsg.style.display = 'block';
            divider.style.display = 'none';
        } else {
            noFoldersMsg.style.display = 'none';
            divider.style.display = 'block';
            folderList.innerHTML = this.folders.map(folder => `
                <button class="context-menu-item ${folder.id === currentFolderId ? 'active' : ''}" data-folder-id="${folder.id}">
                    <i class="fas fa-folder"></i> ${folder.name}
                </button>
            `).join('');

            // Bind click events for folders
            folderList.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.moveDocToFolder(this.contextDocId, this.contextDocType, item.dataset.folderId);
                    this.hideAllContextMenus();
                });
            });
        }

        // Position submenu
        const triggerRect = triggerEl.getBoundingClientRect();
        const menu = document.getElementById('docContextMenu');
        const menuRect = menu.getBoundingClientRect();

        submenu.style.left = `${menuRect.right - 5}px`;
        submenu.style.top = `${triggerRect.top}px`;
        submenu.classList.add('show');

        // Adjust if goes off screen
        const submenuRect = submenu.getBoundingClientRect();
        if (submenuRect.right > window.innerWidth) {
            submenu.style.left = `${menuRect.left - submenuRect.width + 5}px`;
        }
        if (submenuRect.bottom > window.innerHeight) {
            submenu.style.top = `${window.innerHeight - submenuRect.height - 10}px`;
        }
    }

    getDocumentFolderId(docId, docType) {
        for (const folder of this.folders) {
            const found = folder.documents.find(d => d.id === docId && d.type === docType);
            if (found) return folder.id;
        }
        return null;
    }

    copyDocument(docId, docType) {
        let originalDoc;

        if (docType === 'saved') {
            originalDoc = this.documents.find(d => d.id === docId);
            if (!originalDoc) return;

            // Create a copy
            const copiedDoc = {
                id: Date.now().toString(),
                title: `${originalDoc.title} (Copy)`,
                content: originalDoc.content,
                flag: originalDoc.flag || 'none',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.documents.push(copiedDoc);
            this.saveDocuments();
            this.renderDocumentList();
            this.showNotification('Document copied!', 'docSave');
        } else if (docType === 'autosave') {
            originalDoc = this.autoSaveDocuments.find(d => d.id === docId);
            if (!originalDoc) return;

            // Create a copy as a new autosave
            const copiedDoc = {
                id: 'autosave_' + Date.now().toString(),
                title: `${originalDoc.title} (Copy)`,
                content: originalDoc.content,
                flag: originalDoc.flag || 'none',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (this.autoDeleteDays * 24 * 60 * 60 * 1000)).toISOString(),
                linkedDocId: null,
                sessionId: null
            };

            this.autoSaveDocuments.unshift(copiedDoc);

            // Remove oldest if over limit
            while (this.autoSaveDocuments.length > this.autoSaveLimit) {
                this.autoSaveDocuments.pop();
            }

            this.saveAutoSaveDocuments();
            this.renderAutoSaveDocumentList();
            this.showNotification('Auto-save copied!', 'autoSave');
        }
    }

    openDeleteDocModal(docId, docType) {
        let doc;
        if (docType === 'saved') {
            doc = this.documents.find(d => d.id === docId);
        } else {
            doc = this.autoSaveDocuments.find(d => d.id === docId);
        }

        if (!doc) return;

        document.getElementById('deleteDocTitle').textContent = doc.title;
        this.deleteDocId = docId;
        this.deleteDocType = docType;
        document.getElementById('deleteDocModal').classList.add('show');
    }

    closeDeleteDocModal() {
        document.getElementById('deleteDocModal').classList.remove('show');
        this.deleteDocId = null;
        this.deleteDocType = null;
    }

    confirmDeleteDocument() {
        if (!this.deleteDocId || !this.deleteDocType) return;

        if (this.deleteDocType === 'saved') {
            this.documents = this.documents.filter(doc => doc.id !== this.deleteDocId);
            this.saveDocuments();
            this.removeDocFromFolder(this.deleteDocId, 'saved');

            if (this.currentDocId === this.deleteDocId) {
                this.newDocument();
            }

            this.renderDocumentList();
            this.showNotification('Document deleted!', 'docDelete');
        } else {
            this.autoSaveDocuments = this.autoSaveDocuments.filter(d => d.id !== this.deleteDocId);
            this.saveAutoSaveDocuments();
            this.removeDocFromFolder(this.deleteDocId, 'autosave');
            this.renderAutoSaveDocumentList();
            this.showNotification('Auto-save deleted!', 'docDelete');
        }

        this.renderFolderList();
        if (this.currentFolderId) {
            this.renderFolderContents();
        }

        this.closeDeleteDocModal();
    }

    initDocumentContextMenu() {
        const docContextMenu = document.getElementById('docContextMenu');
        const moveToBtn = document.getElementById('moveToFolderBtn');
        const copyBtn = document.getElementById('copyDocBtn');
        const deleteBtn = document.getElementById('deleteDocContextBtn');
        const moveToRootBtn = document.getElementById('moveToRootBtn');

        // Show submenu on hover/click
        moveToBtn.addEventListener('mouseenter', () => {
            this.showMoveToSubmenu(moveToBtn);
        });

        moveToBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMoveToSubmenu(moveToBtn);
        });

        // Copy document
        copyBtn.addEventListener('click', () => {
            this.copyDocument(this.contextDocId, this.contextDocType);
            this.hideAllContextMenus();
        });

        // Delete document
        deleteBtn.addEventListener('click', () => {
            this.hideAllContextMenus();
            this.openDeleteDocModal(this.contextDocId, this.contextDocType);
        });

        // Move to root (remove from folder)
        moveToRootBtn.addEventListener('click', () => {
            this.removeDocFromFolder(this.contextDocId, this.contextDocType);
            this.renderDocumentList();
            this.renderAutoSaveDocumentList();
            this.renderFolderList();
            if (this.currentFolderId) {
                this.renderFolderContents();
            }
            this.hideAllContextMenus();
            this.showNotification('Moved to root', 'settings');
        });

        // Delete modal events
        document.getElementById('deleteDocModalClose').addEventListener('click', () => {
            this.closeDeleteDocModal();
        });
        document.getElementById('deleteDocCancelBtn').addEventListener('click', () => {
            this.closeDeleteDocModal();
        });
        document.getElementById('deleteDocConfirmBtn').addEventListener('click', () => {
            this.confirmDeleteDocument();
        });
        document.getElementById('deleteDocModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteDocModal') {
                this.handleModalClickOutside(
                    'deleteDocModal',
                    null,
                    () => this.closeDeleteDocModal()
                );
            }
        });

        // Hide submenu when leaving the menu area
        docContextMenu.addEventListener('mouseleave', (e) => {
            const submenu = document.getElementById('moveToSubmenu');
            const submenuRect = submenu.getBoundingClientRect();

            // Check if mouse is moving to submenu
            if (e.clientX >= submenuRect.left && e.clientX <= submenuRect.right &&
                e.clientY >= submenuRect.top && e.clientY <= submenuRect.bottom) {
                return;
            }

            submenu.classList.remove('show');
        });
    }

    openCreateFolderModal() {
        document.getElementById('folderNameInput').value = '';
        document.getElementById('createFolderModal').classList.add('show');
        setTimeout(() => document.getElementById('folderNameInput').focus(), 100);
    }

    closeCreateFolderModal() {
        document.getElementById('createFolderModal').classList.remove('show');
    }

    createFolder() {
        const name = document.getElementById('folderNameInput').value.trim();
        if (!name) return;

        const folder = {
            id: 'folder_' + Date.now().toString(),
            name: name,
            createdAt: new Date().toISOString(),
            documents: [] // Array of { id, type: 'saved' | 'autosave' }
        };

        this.folders.push(folder);
        this.saveFolders();
        this.renderFolderList();
        this.closeCreateFolderModal();
        this.showNotification('Folder created!', 'settings');
    }

    openRenameFolderModal() {
        const folder = this.folders.find(f => f.id === this.contextFolderId);
        if (!folder) return;

        document.getElementById('renameFolderInput').value = folder.name;
        document.getElementById('renameFolderModal').classList.add('show');
        setTimeout(() => {
            const input = document.getElementById('renameFolderInput');
            input.focus();
            input.select();
        }, 100);
    }

    closeRenameFolderModal() {
        document.getElementById('renameFolderModal').classList.remove('show');
    }

    renameFolder() {
        const name = document.getElementById('renameFolderInput').value.trim();
        if (!name) return;

        const folder = this.folders.find(f => f.id === this.contextFolderId);
        if (folder) {
            folder.name = name;
            this.saveFolders();
            this.renderFolderList();

            // Update title if in folder view
            if (this.currentFolderId === this.contextFolderId) {
                document.getElementById('sidebarTitle').innerHTML = `<i class="fas fa-folder-open"></i> ${name}`;
            }
        }

        this.closeRenameFolderModal();
        this.showNotification('Folder renamed!', 'settings');
    }

    deleteFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        if (!confirm(`Delete folder "${folder.name}"? Documents inside will be moved back to their original sections.`)) {
            return;
        }

        // Move all documents back out of folder
        folder.documents.forEach(docRef => {
            // Documents are just references, they go back to normal view
        });

        this.folders = this.folders.filter(f => f.id !== folderId);
        this.saveFolders();

        // Exit folder view if we're in it
        if (this.currentFolderId === folderId) {
            this.exitFolderView();
        }

        this.renderFolderList();
        this.renderDocumentList();
        this.renderAutoSaveDocumentList();
        this.showNotification('Folder deleted!', 'docDelete');
    }

    moveDocToFolder(docId, docType, folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        // Check if already in a folder and remove
        this.folders.forEach(f => {
            f.documents = f.documents.filter(d => !(d.id === docId && d.type === docType));
        });

        // Add to new folder
        folder.documents.push({ id: docId, type: docType });
        this.saveFolders();

        this.renderDocumentList();
        this.renderAutoSaveDocumentList();
        this.renderFolderList();
        this.showNotification(`Moved to "${folder.name}"`, 'settings');
    }

    isDocInFolder(docId, docType) {
        return this.folders.some(f => f.documents.some(d => d.id === docId && d.type === docType));
    }

    getDocFolder(docId, docType) {
        return this.folders.find(f => f.documents.some(d => d.id === docId && d.type === docType));
    }

    removeDocFromFolder(docId, docType) {
        this.folders.forEach(f => {
            f.documents = f.documents.filter(d => !(d.id === docId && d.type === docType));
        });
        this.saveFolders();
    }

    renderFolderList() {
        const list = document.getElementById('folderList');
        const countEl = document.getElementById('folderCount');

        if (countEl) {
            countEl.textContent = this.folders.length;
        }

        if (this.folders.length === 0) {
            list.innerHTML = '<li class="no-docs">No folders created yet</li>';
            return;
        }

        list.innerHTML = this.folders.map(folder => `
            <li data-folder-id="${folder.id}">
                <span class="doc-name">${folder.name}</span>
                <span class="folder-doc-count">${folder.documents.length}</span>
            </li>
        `).join('');

        // Bind events
        list.querySelectorAll('li:not(.no-docs)').forEach(item => {
            const folderId = item.dataset.folderId;

            // Double-click to open
            item.addEventListener('dblclick', () => {
                this.openFolder(folderId);
            });

            // Right-click for context menu
            item.addEventListener('contextmenu', (e) => {
                this.showFolderContextMenu(e, folderId);
            });

            // Single click just selects
            item.addEventListener('click', () => {
                list.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    openFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;

        this.currentFolderId = folderId;

        // Update UI
        document.getElementById('normalDocView').style.display = 'none';
        document.getElementById('folderDocView').style.display = 'block';
        document.getElementById('folderBackBtn').style.display = 'block';
        document.getElementById('sidebarTitle').innerHTML = `<i class="fas fa-folder-open"></i> ${folder.name}`;

        this.renderFolderContents();
    }

    exitFolderView() {
        this.currentFolderId = null;

        // Update UI
        document.getElementById('normalDocView').style.display = 'block';
        document.getElementById('folderDocView').style.display = 'none';
        document.getElementById('folderBackBtn').style.display = 'none';
        document.getElementById('sidebarTitle').innerHTML = '<i class="fas fa-folder"></i> Documents';

        // Refresh lists
        this.renderDocumentList();
        this.renderAutoSaveDocumentList();
        this.renderFolderList();
    }

    renderFolderContents() {
        const folder = this.folders.find(f => f.id === this.currentFolderId);
        if (!folder) return;

        const list = document.getElementById('folderContentsList');

        if (folder.documents.length === 0) {
            list.innerHTML = '<li class="no-docs">This folder is empty</li>';
            return;
        }

        const docsHtml = folder.documents.map(docRef => {
            let doc;
            let isAutoSave = false;

            if (docRef.type === 'saved') {
                doc = this.documents.find(d => d.id === docRef.id);
            } else {
                doc = this.autoSaveDocuments.find(d => d.id === docRef.id);
                isAutoSave = true;
            }

            if (!doc) return ''; // Document was deleted

            return `
                <li class="${isAutoSave ? 'autosave-doc' : ''}" data-id="${doc.id}" data-type="${docRef.type}">
                    <span class="doc-name">${doc.title}</span>
                    <button class="delete-btn" title="Remove from folder">
                        <i class="fas fa-times"></i>
                    </button>
                </li>
            `;
        }).filter(html => html).join('');

        if (!docsHtml) {
            list.innerHTML = '<li class="no-docs">This folder is empty</li>';
            return;
        }

        list.innerHTML = docsHtml;

        // Bind events
        list.querySelectorAll('li:not(.no-docs)').forEach(item => {
            const docId = item.dataset.id;
            const docType = item.dataset.type;

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    if (docType === 'saved') {
                        this.loadDocument(docId);
                    } else {
                        this.loadAutoSaveDocument(docId);
                    }
                }
            });

            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeDocFromFolder(docId, docType);
                this.renderFolderContents();
                this.showNotification('Removed from folder', 'settings');
            });

            // Right-click context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDocumentContextMenu(e, docId, docType);
            });
        });
    }

    // ==================== Edit Menu & Flags ====================

    initEditMenu() {
        const editMenuBtn = document.getElementById('editMenuBtn');
        const editMenu = document.getElementById('editMenu');

        // Toggle menu
        editMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeAllDropdowns();
            editMenu.classList.toggle('show');
        });

        // Undo button
        document.getElementById('undoMenuBtn').addEventListener('click', () => {
            document.execCommand('undo');
            editMenu.classList.remove('show');
        });

        // Redo button
        document.getElementById('redoMenuBtn').addEventListener('click', () => {
            document.execCommand('redo');
            editMenu.classList.remove('show');
        });

        // Flag buttons
        document.querySelectorAll('.flag-item').forEach(item => {
            item.addEventListener('click', () => {
                const flag = item.dataset.flag;
                this.setDocumentFlag(flag);
                editMenu.classList.remove('show');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!editMenuBtn.contains(e.target) && !editMenu.contains(e.target)) {
                editMenu.classList.remove('show');
            }
        });
    }

    // ==================== File Menu ====================

    initFileMenu() {
        const fileMenuBtn = document.getElementById('fileMenuBtn');
        const fileMenu = document.getElementById('fileMenu');

        // Toggle menu
        fileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeAllDropdowns();
            fileMenu.classList.toggle('show');
        });

        // New Document button in menu
        document.getElementById('newDocMenuBtn').addEventListener('click', () => {
            fileMenu.classList.remove('show');
            this.openEditor();
            this.newDocument();
        });

        // Save button in menu
        document.getElementById('saveDocMenuBtn').addEventListener('click', () => {
            fileMenu.classList.remove('show');
            this.saveDocument();
        });

        // Close Editor button
        document.getElementById('closeEditorBtn').addEventListener('click', () => {
            fileMenu.classList.remove('show');
            this.closeEditor();
        });

        // Open new doc button in closed message
        document.getElementById('openNewDocBtn').addEventListener('click', () => {
            this.openEditor();
            this.newDocument();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!fileMenuBtn.contains(e.target) && !fileMenu.contains(e.target)) {
                fileMenu.classList.remove('show');
            }
        });
    }

    closeEditor() {
        if (this.editorClosed) return;

        const mainContent = document.getElementById('mainContent');
        const editorContainer = document.querySelector('.editor-container');
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');

        // Store sidebar state before closing
        this.sidebarStateBeforeClose = {
            collapsed: sidebar.classList.contains('collapsed'),
            width: sidebar.style.width || getComputedStyle(sidebar).width
        };

        // Animate editor roll-up
        editorContainer.classList.add('rolling-up');

        // Collapse sidebar
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
        }

        // Hide floating hamburger button
        if (hamburgerBtn) {
            hamburgerBtn.classList.remove('floating');
            hamburgerBtn.classList.add('editor-hidden');
            hamburgerBtn.style.display = 'none';
        }

        // After animation, hide everything
        setTimeout(() => {
            editorContainer.classList.remove('rolling-up');
            mainContent.classList.add('editor-closed');
            document.body.classList.add('editor-closed-state');
            this.editorClosed = true;
        }, 400);
    }

    openEditor() {
        if (!this.editorClosed) return;

        const mainContent = document.getElementById('mainContent');
        const editorContainer = document.querySelector('.editor-container');
        const sidebar = document.getElementById('sidebar');

        // Show elements first
        mainContent.classList.remove('editor-closed');
        document.body.classList.remove('editor-closed-state');

        // Restore hamburger button
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        if (hamburgerBtn) {
            hamburgerBtn.classList.remove('editor-hidden');
            hamburgerBtn.style.display = '';
        }

        // Restore sidebar state - use saved state or localStorage state
        const shouldRestore = this.sidebarStateBeforeClose
            ? !this.sidebarStateBeforeClose.collapsed
            : !this.sidebarCollapsed;

        const widthToRestore = this.sidebarStateBeforeClose
            ? this.sidebarStateBeforeClose.width
            : this.sidebarWidth + 'px';

        if (shouldRestore) {
            sidebar.classList.remove('collapsed');
            sidebar.style.width = typeof widthToRestore === 'number' ? widthToRestore + 'px' : widthToRestore;
        }

        // Animate editor roll-down
        editorContainer.classList.add('rolling-down');

        setTimeout(() => {
            editorContainer.classList.remove('rolling-down');
            this.editorClosed = false;
        }, 400);
    }

    handleDefaultLoadAction() {
        const action = this.defaultLoadAction || 'newDocument';

        switch (action) {
            case 'newDocument': {
                // Default behavior - new document already loaded
                break;
            }

            case 'lastSaved': {
                // Load the most recent saved document (excluding those in folders)
                const visibleDocs = this.documents.filter(doc => !this.isDocInFolder(doc.id, 'saved'));
                if (visibleDocs.length > 0) {
                    const sortedDocs = [...visibleDocs].sort((a, b) =>
                        new Date(b.updatedAt) - new Date(a.updatedAt)
                    );
                    this.loadDocument(sortedDocs[0].id);
                }
                break;
            }

            case 'lastAutosave': {
                // Load the most recent autosave (excluding those in folders)
                const visibleAutoSaves = this.autoSaveDocuments.filter(doc => !this.isDocInFolder(doc.id, 'autosave'));
                if (visibleAutoSaves.length > 0) {
                    // Auto-saves are already sorted by most recent first
                    this.loadAutoSaveDocument(visibleAutoSaves[0].id);
                }
                break;
            }

            case 'showWarnings': {
                // Check for expiring auto-saves
                this.checkExpiringAutoSaves();
                break;
            }

            case 'doNothing': {
                // Close the editor immediately without animation on page load
                this.closeEditorImmediate();
                break;
            }

            default: {
                // Fallback to new document
                break;
            }
        }
    }

    // Close editor immediately without animation (for page load)
    closeEditorImmediate() {
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');

        // Store sidebar state before closing (use loaded state from localStorage)
        this.sidebarStateBeforeClose = {
            collapsed: this.sidebarCollapsed,
            width: this.sidebarWidth
        };

        // Hide everything immediately
        mainContent.classList.add('editor-closed');
        document.body.classList.add('editor-closed-state');
        sidebar.classList.add('collapsed');

        // Also hide the floating hamburger button if it exists
        if (hamburgerBtn) {
            hamburgerBtn.classList.remove('floating');
            hamburgerBtn.classList.add('editor-hidden');
            hamburgerBtn.style.display = 'none';
        }

        this.editorClosed = true;
    }

    loadFlagBorderWidth() {
        const saved = localStorage.getItem('wysiwyg_flag_border_width');
        return saved ? parseInt(saved) : 3;
    }

    saveFlagBorderWidth() {
        localStorage.setItem('wysiwyg_flag_border_width', this.flagBorderWidth.toString());
    }

    setDocumentFlag(flag) {
        this.currentFlag = flag;
        this.applyFlagToEditor();
        this.updateFlagMenuState();

        // Save flag with current document if saved
        if (this.currentDocId) {
            const doc = this.documents.find(d => d.id === this.currentDocId);
            if (doc) {
                doc.flag = flag;
                this.saveDocuments();
                this.renderDocumentList();
            }
        }

        const flagNames = {
            'none': 'No flag',
            'red': 'Red - Urgent',
            'orange': 'Orange - Important',
            'yellow': 'Yellow - Review',
            'green': 'Green - Complete',
            'blue': 'Blue - In Progress',
            'purple': 'Purple - Ideas'
        };

        this.showNotification(`Flag set: ${flagNames[flag]}`, 'settings');
    }

    applyFlagToEditor() {
        const editorWrapper = document.querySelector('.editor-wrapper');

        // Remove all flag classes
        editorWrapper.classList.remove('flagged', 'flag-red', 'flag-orange', 'flag-yellow', 'flag-green', 'flag-blue', 'flag-purple');

        if (this.currentFlag !== 'none') {
            editorWrapper.classList.add('flagged', `flag-${this.currentFlag}`);
            editorWrapper.style.borderWidth = `${this.flagBorderWidth}px`;
        } else {
            editorWrapper.style.borderWidth = '';
        }
    }

    updateFlagMenuState() {
        document.querySelectorAll('.flag-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.flag === this.currentFlag) {
                item.classList.add('active');
            }
        });
    }

    updateFlagStatusBar() {
        const flagStatus = document.getElementById('flagStatus');
        if (!flagStatus) return;

        // Remove all flag classes
        flagStatus.classList.remove('flag-red', 'flag-orange', 'flag-yellow', 'flag-green', 'flag-blue', 'flag-purple');

        if (this.currentFlag && this.currentFlag !== 'none') {
            const flagNames = {
                'red': 'Urgent',
                'orange': 'Important',
                'yellow': 'Review',
                'green': 'Complete',
                'blue': 'In Progress',
                'purple': 'Ideas'
            };
            flagStatus.textContent = flagNames[this.currentFlag] || '';
            flagStatus.classList.add(`flag-${this.currentFlag}`);
        } else {
            flagStatus.textContent = '';
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    // ==================== Auto-Save ====================

    loadAutoSaveSettings() {
        const saved = localStorage.getItem('wysiwyg_autosave_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.autoSaveEnabled = settings.enabled ?? true;
            this.autoSaveValue = settings.value ?? 5;
            this.autoSaveUnit = settings.unit ?? 'minutes';
            this.autoSaveLimit = settings.limit ?? 3;
            this.autoDeleteDays = settings.autoDeleteDays ?? 7;
        } else {
            // Default settings - auto-save enabled by default
            this.autoSaveEnabled = true;
            this.autoSaveValue = 5;
            this.autoSaveUnit = 'minutes';
            this.autoSaveLimit = 3;
            this.autoDeleteDays = 7;
        }
    }

    saveAutoSaveSettings() {
        localStorage.setItem('wysiwyg_autosave_settings', JSON.stringify({
            enabled: this.autoSaveEnabled,
            value: this.autoSaveValue,
            unit: this.autoSaveUnit,
            limit: this.autoSaveLimit,
            autoDeleteDays: this.autoDeleteDays
        }));
    }

    loadAutoSaveDocuments() {
        const saved = localStorage.getItem('wysiwyg_autosave_documents');
        return saved ? JSON.parse(saved) : [];
    }

    saveAutoSaveDocuments() {
        localStorage.setItem('wysiwyg_autosave_documents', JSON.stringify(this.autoSaveDocuments));
    }

    initAutoSave() {
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }

        // Track changes for word/character/change-based auto-save
        this.editor.addEventListener('input', () => {
            if (!this.autoSaveEnabled) return;

            if (this.autoSaveUnit === 'words') {
                const currentWords = this.getWordCount();
                if (currentWords - this.autoSaveWordCount >= this.autoSaveValue) {
                    this.autoSaveWordCount = currentWords;
                    this.performAutoSave();
                }
            } else if (this.autoSaveUnit === 'characters') {
                const currentChars = this.editor.textContent.length;
                if (currentChars - this.autoSaveCharCount >= this.autoSaveValue) {
                    this.autoSaveCharCount = currentChars;
                    this.performAutoSave();
                }
            } else if (this.autoSaveUnit === 'changes') {
                this.autoSaveChangeCount++;
                if (this.autoSaveChangeCount >= this.autoSaveValue) {
                    this.autoSaveChangeCount = 0;
                    this.performAutoSave();
                }
            }
        });
    }

    toggleAutoSave() {
        this.autoSaveEnabled = !this.autoSaveEnabled;
        this.saveAutoSaveSettings();
        this.updateAutoSaveIndicator();

        if (this.autoSaveEnabled) {
            this.startAutoSave();
            this.showNotification('Auto-save enabled', 'settings');
        } else {
            this.stopAutoSave();
            this.showNotification('Auto-save disabled', 'settings');
        }
    }

    updateAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (indicator) {
            indicator.classList.toggle('active', this.autoSaveEnabled);
        }
    }

    startAutoSave() {
        // Reset counters
        this.autoSaveWordCount = this.getWordCount();
        this.autoSaveCharCount = this.editor.textContent.length;
        this.autoSaveChangeCount = 0;

        // For time-based auto-save
        if (this.autoSaveUnit === 'minutes' || this.autoSaveUnit === 'seconds') {
            const interval = this.autoSaveUnit === 'minutes'
                ? this.autoSaveValue * 60 * 1000
                : this.autoSaveValue * 1000;

            this.autoSaveTimer = setInterval(() => {
                this.performAutoSave();
            }, interval);
        }
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    performAutoSave() {
        // Only auto-save if there's content
        const content = this.editor.innerHTML;
        if (!content || content === '<br>' || content === '<p><br></p>') return;

        const title = document.getElementById('docTitle').value || 'Untitled Document';
        const now = new Date();

        // If we're editing a saved document, update the saved document directly
        if (this.currentDocId) {
            const index = this.documents.findIndex(doc => doc.id === this.currentDocId);
            if (index !== -1) {
                this.documents[index].title = title;
                this.documents[index].content = content;
                this.documents[index].flag = this.currentFlag;
                this.documents[index].updatedAt = now.toISOString();
                this.saveDocuments();
                this.renderDocumentList();
                this.showNotification('Auto-saved', 'autoSave');
            }
            return;
        }

        // For unsaved documents or autosaves, use the autosave system
        let existingIndex = -1;

        if (this.currentAutoSaveId) {
            // Editing from an auto-save - update that specific auto-save
            existingIndex = this.autoSaveDocuments.findIndex(doc => doc.id === this.currentAutoSaveId);
        } else if (this.sessionDocId) {
            // New unsaved document - use session tracking
            existingIndex = this.autoSaveDocuments.findIndex(doc => doc.sessionId === this.sessionDocId);
        }

        if (existingIndex !== -1) {
            // Update existing auto-save
            this.autoSaveDocuments[existingIndex].title = title;
            this.autoSaveDocuments[existingIndex].content = content;
            this.autoSaveDocuments[existingIndex].flag = this.currentFlag;
            this.autoSaveDocuments[existingIndex].updatedAt = now.toISOString();
            this.autoSaveDocuments[existingIndex].expiresAt = new Date(now.getTime() + (this.autoDeleteDays * 24 * 60 * 60 * 1000)).toISOString();

            // Move to top of list (most recent)
            const updated = this.autoSaveDocuments.splice(existingIndex, 1)[0];
            this.autoSaveDocuments.unshift(updated);
        } else {
            // Create new auto-save document
            const autoSaveDoc = {
                id: 'autosave_' + Date.now().toString(),
                title: title,
                content: content,
                flag: this.currentFlag,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                expiresAt: new Date(now.getTime() + (this.autoDeleteDays * 24 * 60 * 60 * 1000)).toISOString(),
                linkedDocId: null,
                sessionId: this.sessionDocId || null
            };

            // Track which auto-save this unsaved doc belongs to
            if (!this.currentAutoSaveId) {
                this.currentAutoSaveId = autoSaveDoc.id;
            }

            // Add to beginning of array
            this.autoSaveDocuments.unshift(autoSaveDoc);

            // Remove oldest if over limit
            while (this.autoSaveDocuments.length > this.autoSaveLimit) {
                this.autoSaveDocuments.pop();
            }
        }

        this.saveAutoSaveDocuments();
        this.renderAutoSaveDocumentList();
        this.showNotification('Auto-saved', 'autoSave');
    }

    renderAutoSaveDocumentList() {
        const list = document.getElementById('autoSaveDocList');
        const countEl = document.getElementById('autoSaveDocCount');

        if (!list) return;

        // Filter out documents that are in folders
        const visibleDocs = this.autoSaveDocuments.filter(doc => !this.isDocInFolder(doc.id, 'autosave'));

        if (countEl) {
            countEl.textContent = visibleDocs.length;
        }

        if (visibleDocs.length === 0) {
            list.innerHTML = '<li class="no-docs">No auto-saved documents</li>';
            return;
        }

        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;

        list.innerHTML = visibleDocs.map(doc => {
            const expiresAt = new Date(doc.expiresAt);
            const timeUntilExpiry = expiresAt - now;
            const isExpiringSoon = timeUntilExpiry <= oneDayMs && timeUntilExpiry > 0;
            // Use updatedAt if available, otherwise createdAt
            const lastSaved = new Date(doc.updatedAt || doc.createdAt);
            const timeAgo = this.getTimeAgo(lastSaved);

            return `
                <li class="${isExpiringSoon ? 'expiring-soon' : ''}" data-id="${doc.id}">
                    <span class="doc-name">${doc.title}</span>
                    <span class="doc-time">${timeAgo}</span>
                    <button class="delete-btn" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </li>
            `;
        }).join('');

        // Bind click events
        list.querySelectorAll('li:not(.no-docs)').forEach(item => {
            const docId = item.dataset.id;

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    this.loadAutoSaveDocument(docId);
                }
            });

            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteAutoSaveDocument(docId);
            });

            // Right-click context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDocumentContextMenu(e, docId, 'autosave');
            });
        });
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    loadAutoSaveDocument(docId) {
        const doc = this.autoSaveDocuments.find(d => d.id === docId);
        if (!doc) return;

        // Open editor if closed
        if (this.editorClosed) {
            this.openEditor();
        }

        // Reset expiration time when loaded
        doc.expiresAt = new Date(Date.now() + (this.autoDeleteDays * 24 * 60 * 60 * 1000)).toISOString();
        this.saveAutoSaveDocuments();

        this.editor.innerHTML = doc.content;
        document.getElementById('docTitle').value = doc.title;
        this.currentDocId = null; // Not a saved document

        // Track that we're editing this auto-save
        this.currentAutoSaveId = docId;
        this.sessionDocId = null;

        // Load flag from autosave
        this.currentFlag = doc.flag || 'none';
        this.applyFlagToEditor();
        this.updateFlagMenuState();
        this.updateFlagStatusBar();

        this.updateCounts();
        this.renderAutoSaveDocumentList();

        // Update active states
        document.querySelectorAll('.doc-list li').forEach(li => li.classList.remove('active'));
        document.querySelector(`#autoSaveDocList li[data-id="${docId}"]`)?.classList.add('active');
    }

    deleteAutoSaveDocument(docId) {
        this.autoSaveDocuments = this.autoSaveDocuments.filter(d => d.id !== docId);
        this.saveAutoSaveDocuments();

        // Also remove from any folders
        this.removeDocFromFolder(docId, 'autosave');

        this.renderAutoSaveDocumentList();
        this.renderFolderList();
        if (this.currentFolderId) {
            this.renderFolderContents();
        }
        this.showNotification('Auto-save deleted', 'docDelete');
    }

    moveAutoSaveToSaved(docId) {
        const doc = this.autoSaveDocuments.find(d => d.id === docId);
        if (!doc) return;

        // Create a new saved document from auto-save
        const savedDoc = {
            id: Date.now().toString(),
            title: doc.title,
            content: doc.content,
            createdAt: doc.createdAt,
            updatedAt: new Date().toISOString()
        };

        this.documents.push(savedDoc);
        this.saveDocuments();

        // Remove from auto-saves
        this.autoSaveDocuments = this.autoSaveDocuments.filter(d => d.id !== docId);
        this.saveAutoSaveDocuments();

        this.renderDocumentList();
        this.renderAutoSaveDocumentList();
        this.showNotification('Document saved!', 'docSave');
    }

    // Auto-save warning modal for expiring documents
    initAutoSaveWarningModal() {
        const modal = document.getElementById('autoSaveWarningModal');
        const closeBtn = document.getElementById('autoSaveWarningClose');
        const closeBtnFooter = document.getElementById('autoSaveWarningCloseBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeAutoSaveWarningModal());
        }
        if (closeBtnFooter) {
            closeBtnFooter.addEventListener('click', () => this.closeAutoSaveWarningModal());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAutoSaveWarningModal();
                }
            });
        }
    }

    closeAutoSaveWarningModal() {
        document.getElementById('autoSaveWarningModal').classList.remove('show');
    }

    checkExpiringAutoSaves() {
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Find auto-saves expiring within 24 hours
        const expiringDocs = this.autoSaveDocuments.filter(doc => {
            const expiresAt = new Date(doc.expiresAt);
            const timeUntilExpiry = expiresAt - now;
            return timeUntilExpiry <= oneDayMs && timeUntilExpiry > 0;
        });

        // Also delete any that have already expired
        const expiredDocs = this.autoSaveDocuments.filter(doc => {
            const expiresAt = new Date(doc.expiresAt);
            return expiresAt <= now;
        });

        if (expiredDocs.length > 0) {
            this.autoSaveDocuments = this.autoSaveDocuments.filter(doc => {
                const expiresAt = new Date(doc.expiresAt);
                return expiresAt > now;
            });
            this.saveAutoSaveDocuments();
            this.renderAutoSaveDocumentList();
        }

        // Show warning modal if there are expiring docs
        if (expiringDocs.length > 0) {
            this.showExpiringDocsWarning(expiringDocs);
        }
    }

    showExpiringDocsWarning(expiringDocs) {
        const list = document.getElementById('expiringDocsList');
        if (!list) return;

        list.innerHTML = expiringDocs.map(doc => {
            const expiresAt = new Date(doc.expiresAt);
            const hoursLeft = Math.max(0, Math.ceil((expiresAt - new Date()) / 3600000));
            const createdAt = new Date(doc.createdAt);

            return `
                <li class="expiring-doc-item" data-id="${doc.id}">
                    <div class="expiring-doc-info">
                        <div class="expiring-doc-title">${doc.title}</div>
                        <div class="expiring-doc-meta">
                            <span><i class="fas fa-clock"></i> Expires in ${hoursLeft}h</span>
                            <span><i class="fas fa-calendar"></i> Created ${createdAt.toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="expiring-doc-actions">
                        <button class="btn btn-keep" data-action="keep" data-id="${doc.id}">
                            <i class="fas fa-save"></i> Keep
                        </button>
                        <button class="btn btn-delete-small" data-action="delete" data-id="${doc.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </li>
            `;
        }).join('');

        // Bind action buttons
        list.querySelectorAll('.btn-keep').forEach(btn => {
            btn.addEventListener('click', () => {
                const docId = btn.dataset.id;
                this.moveAutoSaveToSaved(docId);
                btn.closest('.expiring-doc-item').remove();

                // Close modal if no more items
                if (list.children.length === 0) {
                    this.closeAutoSaveWarningModal();
                }
            });
        });

        list.querySelectorAll('.btn-delete-small').forEach(btn => {
            btn.addEventListener('click', () => {
                const docId = btn.dataset.id;
                this.deleteAutoSaveDocument(docId);
                btn.closest('.expiring-doc-item').remove();

                // Close modal if no more items
                if (list.children.length === 0) {
                    this.closeAutoSaveWarningModal();
                }
            });
        });

        document.getElementById('autoSaveWarningModal').classList.add('show');
    }

    getWordCount() {
        const text = this.editor.textContent || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    // ==================== Document Management ====================

    newDocument() {
        this.editor.innerHTML = '';
        this.currentDocId = null;
        document.getElementById('docTitle').value = 'Untitled Document';
        this.editor.focus();
        this.updateCounts();
        this.renderDocumentList();

        // Reset flag
        this.currentFlag = 'none';
        this.applyFlagToEditor();
        this.updateFlagMenuState();
        this.updateFlagStatusBar();

        // Reset auto-save session tracking for new document
        this.currentAutoSaveId = null;
        this.sessionDocId = this.generateSessionId();

        // Reset auto-save counters
        this.autoSaveWordCount = 0;
        this.autoSaveCharCount = 0;
        this.autoSaveChangeCount = 0;
    }

    saveDocument() {
        const title = document.getElementById('docTitle').value || 'Untitled Document';
        const content = this.editor.innerHTML;

        if (this.currentDocId) {
            // Update existing document
            const index = this.documents.findIndex(doc => doc.id === this.currentDocId);
            if (index !== -1) {
                this.documents[index].title = title;
                this.documents[index].content = content;
                this.documents[index].updatedAt = new Date().toISOString();
            }
        } else {
            // Create new document
            const newDoc = {
                id: Date.now().toString(),
                title: title,
                content: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.documents.push(newDoc);
            this.currentDocId = newDoc.id;
        }

        this.saveDocuments();
        this.renderDocumentList();
        this.showNotification('Document saved!', 'docSave');
    }

    loadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc) {
            // Open editor if closed
            if (this.editorClosed) {
                this.openEditor();
            }

            this.editor.innerHTML = doc.content;
            document.getElementById('docTitle').value = doc.title;
            this.currentDocId = doc.id;

            // Reset auto-save tracking for this saved document
            this.currentAutoSaveId = null;
            this.sessionDocId = null;

            // Load document flag
            this.currentFlag = doc.flag || 'none';
            this.applyFlagToEditor();
            this.updateFlagMenuState();
            this.updateFlagStatusBar();

            this.updateCounts();
            this.renderDocumentList();
        }
    }

    deleteDocument(docId) {
        if (confirm('Are you sure you want to delete this document?')) {
            this.documents = this.documents.filter(doc => doc.id !== docId);
            this.saveDocuments();

            // Also remove from any folders
            this.removeDocFromFolder(docId, 'saved');

            if (this.currentDocId === docId) {
                this.newDocument();
            }

            this.renderDocumentList();
            this.renderFolderList();
            if (this.currentFolderId) {
                this.renderFolderContents();
            }
            this.showNotification('Document deleted!', 'docDelete');
        }
    }

    loadDocuments() {
        const saved = localStorage.getItem('wysiwyg_documents');
        return saved ? JSON.parse(saved) : [];
    }

    saveDocuments() {
        localStorage.setItem('wysiwyg_documents', JSON.stringify(this.documents));
    }

    renderDocumentList() {
        const list = document.getElementById('docList');
        const countEl = document.getElementById('savedDocCount');

        // Filter out documents that are in folders
        const visibleDocs = this.documents.filter(doc => !this.isDocInFolder(doc.id, 'saved'));

        if (countEl) {
            countEl.textContent = visibleDocs.length;
        }

        if (visibleDocs.length === 0) {
            list.innerHTML = '<li class="no-docs">No documents saved yet</li>';
            return;
        }

        // Sort by updated date (newest first)
        const sortedDocs = [...visibleDocs].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        list.innerHTML = sortedDocs.map(doc => {
            const flagClass = doc.flag && doc.flag !== 'none' ? `doc-flag-${doc.flag}` : '';
            return `
                <li class="${doc.id === this.currentDocId ? 'active' : ''} ${flagClass}" data-id="${doc.id}">
                    <span class="doc-name" title="${doc.title}">${doc.title}</span>
                    <button class="delete-btn" data-delete="${doc.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
        }).join('');

        // Bind click events
        list.querySelectorAll('li[data-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    this.loadDocument(item.dataset.id);
                }
            });

            // Right-click context menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDocumentContextMenu(e, item.dataset.id, 'saved');
            });
        });

        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteDocument(btn.dataset.delete);
            });
        });
    }

    // ==================== Export Functions ====================

    exportAsHTML() {
        const title = document.getElementById('docTitle').value || 'document';
        const content = this.editor.innerHTML;

        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 0 20px; }
        h1 { font-size: 2em; margin: 0.67em 0; }
        h2 { font-size: 1.5em; margin: 0.75em 0; }
        h3 { font-size: 1.17em; margin: 0.83em 0; }
        blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin: 1em 0; color: #6b7280; font-style: italic; }
        pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; }
        th { background: #f3f4f6; font-weight: 600; }
        img { max-width: 100%; height: auto; }
        a { color: #3b82f6; }
    </style>
</head>
<body>
${content}
</body>
</html>`;

        this.downloadFile(fullHTML, `${title}.html`, 'text/html');
    }

    exportAsText() {
        const title = document.getElementById('docTitle').value || 'document';
        const text = this.editor.innerText;
        this.downloadFile(text, `${title}.txt`, 'text/plain');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==================== Editor Events ====================

    bindEditorEvents() {
        // Update counts on input
        this.editor.addEventListener('input', () => {
            this.updateCounts();
        });

        // Update active states on selection change
        document.addEventListener('selectionchange', () => {
            this.updateActiveStates();
        });

        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.saveDocument();
                        break;
                    case 'b':
                        e.preventDefault();
                        document.execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        document.execCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        document.execCommand('underline');
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            document.execCommand('redo');
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        document.execCommand('redo');
                        break;
                }
            }
        });

        // Handle paste - clean up HTML
        this.editor.addEventListener('paste', (e) => {
            // Allow default paste behavior but could add custom handling here
        });

        // Ensure editor always has at least a paragraph
        this.editor.addEventListener('blur', () => {
            if (this.editor.innerHTML.trim() === '' || this.editor.innerHTML === '<br>') {
                this.editor.innerHTML = '<p><br></p>';
            }
        });
    }

    updateCounts() {
        const text = this.editor.innerText || '';
        const chars = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

        document.getElementById('charCount').textContent = `${chars} characters`;
        document.getElementById('wordCount').textContent = `${words} words`;
    }

    updateActiveStates() {
        // Update button active states based on current selection
        const commands = ['bold', 'italic', 'underline', 'strikeThrough',
                         'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
                         'insertUnorderedList', 'insertOrderedList'];

        commands.forEach(command => {
            const btn = document.querySelector(`[data-command="${command}"]`);
            if (btn) {
                if (document.queryCommandState(command)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    // ==================== Notifications ====================

    showNotification(message, category = 'general') {
        // Check if toasts are enabled globally
        if (!this.toastSettings.enabled) return;

        // Check individual category settings
        const categoryMap = {
            'autoSave': this.toastSettings.autoSave,
            'docSave': this.toastSettings.docSave,
            'docDelete': this.toastSettings.docDelete,
            'theme': this.toastSettings.theme,
            'settings': this.toastSettings.settings,
            'spellcheck': this.toastSettings.spellcheck,
            'docBar': this.toastSettings.docBar,
            'general': true // General always shows if global is enabled
        };

        if (categoryMap[category] === false) return;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'toast-notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// Initialize the editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new WYSIWYGEditor();
});
