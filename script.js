// Safe Text Editor - Pure JavaScript Implementation

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
        this.initToastService(); // Initialize toast service

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
        this.flagBorderEnabled = this.loadFlagBorderEnabled();
        this.customFlags = this.loadCustomFlags();

        // Auto-save session tracking
        this.currentAutoSaveId = null;
        this.sessionDocId = this.generateSessionId();

        // Modal state management
        this.previousModal = null;
        this.modalClickOutside = this.loadModalClickOutside();
        this.modalSaveBehavior = this.loadModalSaveBehavior();

        // Default load action and editor state
        this.defaultLoadAction = this.loadDefaultLoadAction();
        this.editorClosed = false;

        // Animated theme customization
        this.animatedThemeSettings = this.loadAnimatedThemeSettings();
        this.currentCustomizingTheme = null;

        // Editor customization (status bar visibility)
        this.editorCustomization = this.loadEditorCustomization();

        // Toolbar customization
        this.toolbarCustomization = this.loadToolbarCustomization();

        // Unsaved changes tracking
        this.pendingUnsavedModal = null;
        this.pendingUnsavedCallback = null;

        // Flag creator modal tracking
        this.flagCreatorOriginalState = null;

        // Toolbar customization modal tracking
        this.toolbarCustomizationOriginalState = null;

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

    loadModalSaveBehavior() {
        return localStorage.getItem('wysiwyg_modal_save_behavior') || 'saveAndClose';
    }

    saveModalSaveBehavior() {
        localStorage.setItem('wysiwyg_modal_save_behavior', this.modalSaveBehavior);
    }

    loadDefaultLoadAction() {
        return localStorage.getItem('wysiwyg_default_load_action') || 'newDocument';
    }

    saveDefaultLoadAction() {
        localStorage.setItem('wysiwyg_default_load_action', this.defaultLoadAction);
    }

    loadEditorCustomization() {
        const saved = localStorage.getItem('wysiwyg_editor_customization');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default: all ON
        return {
            showWordCount: true,
            showCharCount: true,
            showFlagStatus: true,
            showReadingTime: true
        };
    }

    saveEditorCustomization() {
        localStorage.setItem('wysiwyg_editor_customization', JSON.stringify(this.editorCustomization));
    }

    applyEditorCustomization() {
        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');
        const flagStatusEl = document.getElementById('flagStatus');
        const readingTimeEl = document.getElementById('readingTime');

        if (wordCountEl) {
            wordCountEl.classList.toggle('hidden', !this.editorCustomization.showWordCount);
        }
        if (charCountEl) {
            charCountEl.classList.toggle('hidden', !this.editorCustomization.showCharCount);
        }
        if (flagStatusEl) {
            flagStatusEl.classList.toggle('hidden', !this.editorCustomization.showFlagStatus);
        }
        if (readingTimeEl) {
            readingTimeEl.classList.toggle('hidden', !this.editorCustomization.showReadingTime);
        }
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
            this.initAnimatedThemeCustomization();
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
            this.initViewMenuFlags();
            this.initCustomFlagCreator();
            this.initFlagTooltips();
            this.initFileMenu();
            this.initDocumentContextMenu();
            this.initCustomizeEditorModal();
            this.initCustomizeToolbarModal();
            this.initUnsavedChangesModal();
            this.initHelpMenu();
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
            this.renderCustomFlags();
            this.updateCounts();
            this.updateFlagStatusBar();
            this.updateReadingTime();
            this.applyAnimatedThemeCustomizations();
            this.applyEditorCustomization();
            this.applyToolbarCustomization();
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
                description: 'A clean, professional blue theme perfect for everyday use. Features calming blue accents on a light gray background.',
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
                description: 'A refreshing nature-inspired theme with lush green tones. Great for reducing eye strain during long writing sessions.',
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
                description: 'An elegant and creative theme featuring rich purple tones. Perfect for artistic and imaginative work.',
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
                description: 'A warm, romantic theme with soft pink hues. Ideal for creative writing and personal journals.',
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
                description: 'A warm, inviting theme with golden amber tones. Perfect for cozy, focused writing sessions.',
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
                description: 'A fresh, aquatic theme inspired by tropical waters. Creates a calm, focused environment.',
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
                description: 'A neutral, professional theme with sophisticated gray tones. Minimal and distraction-free.',
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
                description: 'A sleek dark theme with deep blue undertones. Easy on the eyes for nighttime writing.',
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
                description: 'A dark theme inspired by moonlit forests. Deep greens create a peaceful writing atmosphere.',
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
                description: 'A warm, energizing theme with vibrant orange accents. Perfect for creative and energetic work.',
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
                description: 'A deep, dreamy indigo theme. Rich blue-violet tones inspire creativity and focus.',
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
                description: 'A crisp, modern theme with refreshing teal accents. Clean and contemporary feel.',
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
                description: 'An 80s retro-futuristic dark theme. Neon pinks and purples on deep space backgrounds.',
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
                description: 'A fun, playful theme with sweet pink and purple tones. Light and cheerful vibes.',
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
                description: 'A bold retro theme with electric cyan and orange neon on dark backgrounds. High contrast.',
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

    getAnimatedThemes() {
        return [
            {
                id: 'aurora',
                name: 'Aurora Borealis',
                description: 'Inspired by the northern lights. Deep purples and pinks dance across a midnight sky.',
                animated: true,
                cssClass: 'theme-aurora',
                animationDescription: 'Shifting aurora curtains with glowing sidebar pulses',
                colors: {
                    primary: '#8b5cf6',
                    primaryHover: '#7c3aed',
                    bg: '#0f0c29',
                    white: '#1a1744',
                    border: '#4c1d95',
                    text: '#e9d5ff',
                    textLight: '#c4b5fd',
                    toolbar: '#1a1744',
                    activeItem: '#4c1d95'
                },
                animation: {
                    type: 'gradient-shift',
                    duration: '8s',
                    colors: ['#0f0c29', '#302b63', '#24243e']
                }
            },
            {
                id: 'ocean-wave',
                name: 'Ocean Wave',
                description: 'Dive into calm ocean depths. Soothing blues from deep sea to surface light.',
                animated: true,
                cssClass: 'theme-ocean',
                animationDescription: 'Gentle rolling waves with underwater light effects',
                colors: {
                    primary: '#0ea5e9',
                    primaryHover: '#0284c7',
                    bg: '#0c4a6e',
                    white: '#075985',
                    border: '#0369a1',
                    text: '#e0f2fe',
                    textLight: '#7dd3fc',
                    toolbar: '#075985',
                    activeItem: '#0369a1'
                },
                animation: {
                    type: 'wave',
                    duration: '3s'
                }
            },
            {
                id: 'sunset-glow',
                name: 'Sunset Glow',
                description: 'A warm evening sky with rich oranges and deep shadows. Cozy and atmospheric.',
                animated: true,
                cssClass: 'theme-sunset-glow',
                animationDescription: 'Pulsing sunset glow with horizon light effects',
                colors: {
                    primary: '#f97316',
                    primaryHover: '#ea580c',
                    bg: '#1c1917',
                    white: '#292524',
                    border: '#78350f',
                    text: '#fed7aa',
                    textLight: '#fdba74',
                    toolbar: '#292524',
                    activeItem: '#7c2d12'
                },
                animation: {
                    type: 'glow',
                    duration: '6s',
                    colors: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff']
                }
            },
            {
                id: 'neon-pulse',
                name: 'Neon Pulse',
                description: 'Cyberpunk-inspired with electric neon greens and cyans on pure black.',
                animated: true,
                cssClass: 'theme-neon',
                animationDescription: 'Pulsing neon glow with flowing RGB toolbar',
                colors: {
                    primary: '#00ff88',
                    primaryHover: '#00cc6a',
                    bg: '#0a0a0a',
                    white: '#1a1a2e',
                    border: '#00ff88',
                    text: '#00ff88',
                    textLight: '#00d4ff',
                    toolbar: '#1a1a2e',
                    activeItem: '#002211'
                },
                animation: {
                    type: 'pulse',
                    duration: '2s'
                }
            },
            {
                id: 'enchanted-forest',
                name: 'Enchanted Forest',
                description: 'A magical woodland at twilight. Soft sunbeams filter through emerald leaves.',
                animated: true,
                cssClass: 'theme-forest',
                animationDescription: 'Dappled sunlight and mystical forest mist',
                colors: {
                    primary: '#22c55e',
                    primaryHover: '#16a34a',
                    bg: '#0f1f0f',
                    white: '#1a2e1a',
                    border: '#166534',
                    text: '#bbf7d0',
                    textLight: '#86efac',
                    toolbar: '#1a2e1a',
                    activeItem: '#14532d'
                },
                animation: {
                    type: 'light-filter',
                    duration: '5s'
                }
            },
            {
                id: 'galaxy',
                name: 'Galaxy Spiral',
                description: 'Travel through space with twinkling stars and distant nebulae. Infinite and inspiring.',
                animated: true,
                cssClass: 'theme-galaxy',
                animationDescription: 'Twinkling stars with swirling nebula clouds',
                colors: {
                    primary: '#a855f7',
                    primaryHover: '#9333ea',
                    bg: '#0d0d1a',
                    white: '#1a1a3e',
                    border: '#581c87',
                    text: '#e9d5ff',
                    textLight: '#c084fc',
                    toolbar: '#1a1a3e',
                    activeItem: '#3b0764'
                },
                animation: {
                    type: 'rotate',
                    duration: '20s'
                }
            },
            {
                id: 'candy',
                name: 'Candy Swirl',
                description: 'Sweet and playful with cotton candy pinks. Light, fun, and whimsical.',
                animated: true,
                cssClass: 'theme-candy',
                animationDescription: 'Swirling candy colors with floating bubble effects',
                colors: {
                    primary: '#ec4899',
                    primaryHover: '#db2777',
                    bg: '#fdf2f8',
                    white: '#ffffff',
                    border: '#f9a8d4',
                    text: '#831843',
                    textLight: '#be185d',
                    toolbar: '#fce7f3',
                    activeItem: '#fbcfe8'
                },
                animation: {
                    type: 'swirl',
                    duration: '4s',
                    colors: ['#ff6b9d', '#c44569', '#f8b500']
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

        // Render theme cards for both tabs
        this.renderThemeCards();
        this.renderAnimatedThemeCards();

        // Initialize tab behavior
        this.initThemeTabs();

        // Switch to appropriate tab based on current theme type
        this.selectThemeTabForCurrentTheme();

        // Show modal
        document.getElementById('themeModal').classList.add('show');
    }

    selectThemeTabForCurrentTheme() {
        const isAnimated = this.getAnimatedThemes().some(t => t.id === this.currentTheme);
        const tabs = document.querySelectorAll('.theme-tab');
        const contents = document.querySelectorAll('.theme-tab-content');

        const targetTab = isAnimated ? 'animated' : 'basic';

        // Update active tab
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === targetTab);
        });

        // Update active content
        contents.forEach(c => {
            c.classList.toggle('active', c.id === `${targetTab}Themes`);
        });
    }

    initThemeTabs() {
        const tabs = document.querySelectorAll('.theme-tab');
        const contents = document.querySelectorAll('.theme-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                contents.forEach(c => {
                    c.classList.toggle('active', c.id === `${targetTab}Themes`);
                });
            });
        });
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
        this.bindThemeCardClicks(grid);
    }

    renderAnimatedThemeCards() {
        const grid = document.getElementById('animatedThemeGrid');
        if (!grid) return;

        const themes = this.getAnimatedThemes();
        grid.innerHTML = themes.map(theme => {
            const isEdited = this.isThemeCustomized(theme.id);
            return `
            <div class="theme-card animated ${theme.id === this.previewTheme ? 'selected' : ''} ${isEdited ? 'edited' : ''}" data-theme-id="${theme.id}" data-animated="true">
                <div class="theme-card-check"><i class="fas fa-check"></i></div>
                <div class="theme-card-edited" title="Customized"><i class="fas fa-pen"></i></div>
                <div class="theme-card-preview ${theme.cssClass}" style="background: ${theme.colors.bg}">
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
                <div class="theme-card-name"><i class="fas fa-sparkles"></i> ${theme.name}</div>
            </div>
        `}).join('');

        // Bind click events
        this.bindThemeCardClicks(grid);
    }

    isThemeCustomized(themeId) {
        const defaults = this.getAnimatedThemeDefaults()[themeId];
        const current = this.animatedThemeSettings[themeId];

        if (!defaults || !current) return false;

        // Compare each setting to its default
        for (const key of Object.keys(defaults)) {
            if (current[key] !== defaults[key]) {
                return true;
            }
        }
        return false;
    }

    bindThemeCardClicks(grid) {
        grid.querySelectorAll('.theme-card').forEach(card => {
            let tooltipTimer = null;

            card.addEventListener('click', () => {
                const themeId = card.dataset.themeId;
                this.previewThemeById(themeId);

                // Update selected state across all grids
                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                // Hide tooltip on click
                this.hideThemeTooltip();
            });

            // Show tooltip after 2 seconds of hovering
            card.addEventListener('mouseenter', (e) => {
                tooltipTimer = setTimeout(() => {
                    const themeId = card.dataset.themeId;
                    this.showThemeTooltip(themeId, e);
                }, 2000);
            });

            // Update tooltip position on mouse move
            card.addEventListener('mousemove', (e) => {
                const tooltip = document.getElementById('themeTooltip');
                if (tooltip && tooltip.classList.contains('show')) {
                    this.positionThemeTooltip(e);
                }
            });

            // Hide tooltip and cancel timer on mouse leave
            card.addEventListener('mouseleave', () => {
                if (tooltipTimer) {
                    clearTimeout(tooltipTimer);
                    tooltipTimer = null;
                }
                this.hideThemeTooltip();
            });

            // Right-click to customize animated themes
            card.addEventListener('contextmenu', (e) => {
                const isAnimated = card.dataset.animated === 'true';
                if (isAnimated) {
                    e.preventDefault();
                    const themeId = card.dataset.themeId;
                    this.hideThemeTooltip();
                    if (tooltipTimer) {
                        clearTimeout(tooltipTimer);
                        tooltipTimer = null;
                    }
                    this.openAnimatedThemeCustomization(themeId);
                }
            });
        });
    }

    showThemeTooltip(themeId, event) {
        // Get theme data from either basic or animated themes
        let theme = this.getThemes().find(t => t.id === themeId);
        if (!theme) {
            theme = this.getAnimatedThemes().find(t => t.id === themeId);
        }
        if (!theme) return;

        const tooltip = document.getElementById('themeTooltip');
        const nameEl = document.getElementById('tooltipThemeName');
        const colorsEl = document.getElementById('tooltipColors');
        const descEl = document.getElementById('tooltipDescription');
        const animEl = document.getElementById('tooltipAnimation');
        const animTextEl = document.getElementById('tooltipAnimationText');
        const customizeHint = document.getElementById('tooltipCustomizeHint');

        // Set theme name
        nameEl.textContent = theme.name;

        // Set color swatches
        const colors = theme.colors;
        colorsEl.innerHTML = `
            <div class="theme-tooltip-color" style="background: ${colors.primary}" title="Primary"></div>
            <div class="theme-tooltip-color" style="background: ${colors.bg}" title="Background"></div>
            <div class="theme-tooltip-color" style="background: ${colors.white}" title="Surface"></div>
            <div class="theme-tooltip-color" style="background: ${colors.text}" title="Text"></div>
            <div class="theme-tooltip-color" style="background: ${colors.border}" title="Border"></div>
        `;

        // Set description
        descEl.textContent = theme.description || 'A beautiful theme for your editor.';

        // Set animation info if applicable
        if (theme.animated && theme.animationDescription) {
            animEl.style.display = 'flex';
            animTextEl.textContent = theme.animationDescription;
            // Show customize hint for animated themes
            if (customizeHint) {
                customizeHint.style.display = 'flex';
            }
        } else {
            animEl.style.display = 'none';
            // Hide customize hint for non-animated themes
            if (customizeHint) {
                customizeHint.style.display = 'none';
            }
        }

        // Position and show tooltip
        this.positionThemeTooltip(event);
        tooltip.classList.add('show');
    }

    positionThemeTooltip(event) {
        const tooltip = document.getElementById('themeTooltip');
        const padding = 15;

        let x = event.clientX + padding;
        let y = event.clientY + padding;

        // Get tooltip dimensions
        const tooltipRect = tooltip.getBoundingClientRect();

        // Adjust if tooltip would go off screen
        if (x + tooltipRect.width > window.innerWidth) {
            x = event.clientX - tooltipRect.width - padding;
        }
        if (y + tooltipRect.height > window.innerHeight) {
            y = event.clientY - tooltipRect.height - padding;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    }

    hideThemeTooltip() {
        const tooltip = document.getElementById('themeTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    previewThemeById(themeId) {
        this.previewTheme = themeId;
        this.applyTheme(themeId, true);
    }

    applyTheme(themeId, isPreview = false) {
        // Check basic themes first
        let themes = this.getThemes();
        let theme = themes.find(t => t.id === themeId);

        // If not found, check animated themes
        if (!theme) {
            themes = this.getAnimatedThemes();
            theme = themes.find(t => t.id === themeId);
        }

        if (!theme) return;

        const root = document.documentElement;
        const colors = theme.colors;

        // Check if this is a dark theme based on background color brightness
        const darkBasicThemes = ['midnight', 'forest', 'synthwave', 'retrowave'];
        const darkAnimatedThemes = ['aurora', 'ocean-wave', 'sunset-glow', 'neon-pulse', 'enchanted-forest', 'galaxy'];
        const isDarkTheme = darkBasicThemes.includes(themeId) || darkAnimatedThemes.includes(themeId);

        // Remove any existing animated theme classes
        root.classList.remove('animated-theme', 'theme-aurora', 'theme-ocean', 'theme-sunset-glow', 'theme-neon', 'theme-forest', 'theme-galaxy', 'theme-candy');

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

        // Apply animated theme class if applicable
        if (theme.animated && theme.cssClass) {
            root.classList.add('animated-theme', theme.cssClass);
            // Apply any custom animation settings for this theme
            this.applyAnimatedThemeCustomizations();
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

        // Only close if save behavior is set to close
        if (this.modalSaveBehavior === 'saveAndClose') {
            document.getElementById('themeModal').classList.remove('show');
        }
        this.showNotification('Theme saved!', 'theme');
    }

    // ==================== Animated Theme Customization ====================

    getAnimatedThemeDefaults() {
        return {
            'aurora': {
                animationSpeed: 15,
                glowIntensity: 30,
                colorShiftRange: 100,
                pulseSpeed: 4
            },
            'ocean-wave': {
                waveSpeed: 8,
                waveHeight: 3,
                depthIntensity: 50,
                bubbleAmount: 50
            },
            'sunset-glow': {
                glowSpeed: 8,
                glowIntensity: 60,
                horizonBrightness: 50,
                colorWarmth: 70
            },
            'neon-pulse': {
                pulseSpeed: 2,
                glowIntensity: 80,
                flowSpeed: 3,
                borderGlow: 60
            },
            'enchanted-forest': {
                sunbeamSpeed: 7,
                sunbeamIntensity: 50,
                mistDensity: 40,
                mistSpeed: 5
            },
            'galaxy': {
                starCount: 50,
                twinkleSpeed: 3,
                starBrightness: 70,
                nebulaIntensity: 40,
                coloredStars: true
            },
            'candy': {
                swirlSpeed: 6,
                bubbleCount: 50,
                shimmerSpeed: 3,
                colorIntensity: 70
            }
        };
    }

    getAnimatedThemeCustomizableSettings() {
        return {
            'aurora': {
                title: 'Aurora Borealis',
                icon: 'fa-moon',
                settings: [
                    { id: 'animationSpeed', label: 'Animation Speed', type: 'slider', min: 5, max: 30, unit: 's', description: 'Speed of the aurora color shift', invert: true },
                    { id: 'glowIntensity', label: 'Glow Intensity', type: 'slider', min: 10, max: 60, unit: 'px', description: 'Intensity of the sidebar glow effect' },
                    { id: 'colorShiftRange', label: 'Color Shift Range', type: 'slider', min: 50, max: 200, unit: '%', description: 'How far the gradient shifts' },
                    { id: 'pulseSpeed', label: 'Pulse Speed', type: 'slider', min: 2, max: 10, unit: 's', description: 'Speed of the pulse animation', invert: true }
                ]
            },
            'ocean-wave': {
                title: 'Ocean Wave',
                icon: 'fa-water',
                settings: [
                    { id: 'waveSpeed', label: 'Wave Speed', type: 'slider', min: 4, max: 20, unit: 's', description: 'Speed of the wave animation', invert: true },
                    { id: 'waveHeight', label: 'Wave Height', type: 'slider', min: 1, max: 10, unit: 'px', description: 'Height of the wave effect' },
                    { id: 'depthIntensity', label: 'Depth Effect', type: 'slider', min: 10, max: 100, unit: '%', description: 'Intensity of the underwater depth effect' },
                    { id: 'bubbleAmount', label: 'Bubble Amount', type: 'slider', min: 10, max: 100, unit: '%', description: 'Amount of bubble effects' }
                ]
            },
            'sunset-glow': {
                title: 'Sunset Glow',
                icon: 'fa-sun',
                settings: [
                    { id: 'glowSpeed', label: 'Glow Speed', type: 'slider', min: 4, max: 16, unit: 's', description: 'Speed of the glowing animation', invert: true },
                    { id: 'glowIntensity', label: 'Glow Intensity', type: 'slider', min: 20, max: 100, unit: '%', description: 'Brightness of the sunset glow' },
                    { id: 'horizonBrightness', label: 'Horizon Brightness', type: 'slider', min: 20, max: 100, unit: '%', description: 'Brightness of the horizon glow' },
                    { id: 'colorWarmth', label: 'Color Warmth', type: 'slider', min: 30, max: 100, unit: '%', description: 'Warmth of the sunset colors' }
                ]
            },
            'neon-pulse': {
                title: 'Neon Pulse',
                icon: 'fa-bolt',
                settings: [
                    { id: 'pulseSpeed', label: 'Pulse Speed', type: 'slider', min: 1, max: 5, unit: 's', description: 'Speed of the neon pulse', invert: true },
                    { id: 'glowIntensity', label: 'Glow Intensity', type: 'slider', min: 30, max: 100, unit: '%', description: 'Brightness of the neon glow' },
                    { id: 'flowSpeed', label: 'Flow Speed', type: 'slider', min: 1, max: 8, unit: 's', description: 'Speed of the flowing colors', invert: true },
                    { id: 'borderGlow', label: 'Border Glow', type: 'slider', min: 20, max: 100, unit: '%', description: 'Intensity of border glow effects' }
                ]
            },
            'enchanted-forest': {
                title: 'Enchanted Forest',
                icon: 'fa-tree',
                settings: [
                    { id: 'sunbeamSpeed', label: 'Sunbeam Speed', type: 'slider', min: 3, max: 15, unit: 's', description: 'Speed of sunbeam movement', invert: true },
                    { id: 'sunbeamIntensity', label: 'Sunbeam Intensity', type: 'slider', min: 20, max: 100, unit: '%', description: 'Brightness of sunbeams' },
                    { id: 'mistDensity', label: 'Mist Density', type: 'slider', min: 10, max: 80, unit: '%', description: 'Thickness of the forest mist' },
                    { id: 'mistSpeed', label: 'Mist Speed', type: 'slider', min: 2, max: 12, unit: 's', description: 'Speed of mist animation', invert: true }
                ]
            },
            'galaxy': {
                title: 'Galaxy Spiral',
                icon: 'fa-star',
                settings: [
                    { id: 'starCount', label: 'Star Density', type: 'slider', min: 10, max: 2000, unit: ' stars', description: 'Number of visible stars (per layer)' },
                    { id: 'twinkleSpeed', label: 'Twinkle Speed', type: 'slider', min: 1, max: 8, unit: 's', description: 'Speed of star twinkling', invert: true },
                    { id: 'starBrightness', label: 'Star Brightness', type: 'slider', min: 30, max: 100, unit: '%', description: 'Overall brightness of stars' },
                    { id: 'nebulaIntensity', label: 'Nebula Intensity', type: 'slider', min: 10, max: 80, unit: '%', description: 'Visibility of purple nebula effect' },
                    { id: 'coloredStars', label: 'Colored Stars', type: 'toggle', description: 'Include purple and blue tinted stars' }
                ]
            },
            'candy': {
                title: 'Candy Swirl',
                icon: 'fa-candy-cane',
                settings: [
                    { id: 'swirlSpeed', label: 'Swirl Speed', type: 'slider', min: 3, max: 12, unit: 's', description: 'Speed of the swirling colors', invert: true },
                    { id: 'bubbleCount', label: 'Bubble Amount', type: 'slider', min: 10, max: 100, unit: '%', description: 'Amount of floating bubbles' },
                    { id: 'shimmerSpeed', label: 'Shimmer Speed', type: 'slider', min: 1, max: 6, unit: 's', description: 'Speed of the toolbar shimmer', invert: true },
                    { id: 'colorIntensity', label: 'Color Intensity', type: 'slider', min: 30, max: 100, unit: '%', description: 'Vibrancy of candy colors' }
                ]
            }
        };
    }

    loadAnimatedThemeSettings() {
        const saved = localStorage.getItem('wysiwyg_animated_theme_settings');
        if (saved) {
            return JSON.parse(saved);
        }
        return this.getAnimatedThemeDefaults();
    }

    saveAnimatedThemeSettings() {
        localStorage.setItem('wysiwyg_animated_theme_settings', JSON.stringify(this.animatedThemeSettings));
    }

    initAnimatedThemeCustomization() {
        const modal = document.getElementById('animatedThemeCustomizeModal');
        const closeBtn = document.getElementById('animatedThemeCustomizeClose');
        const cancelBtn = document.getElementById('animatedThemeCustomizeCancelBtn');
        const saveBtn = document.getElementById('animatedThemeCustomizeSaveBtn');
        const resetBtn = document.getElementById('resetThemeDefaultsBtn');

        if (!modal) return;

        closeBtn?.addEventListener('click', () => this.closeAnimatedThemeCustomization(false));
        cancelBtn?.addEventListener('click', () => this.closeAnimatedThemeCustomization(false));
        saveBtn?.addEventListener('click', () => this.closeAnimatedThemeCustomization(true));
        resetBtn?.addEventListener('click', () => this.resetAnimatedThemeDefaults());

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.handleModalClickOutside(
                    'animatedThemeCustomizeModal',
                    () => this.closeAnimatedThemeCustomization(true),
                    () => this.closeAnimatedThemeCustomization(false)
                );
            }
        });
    }

    openAnimatedThemeCustomization(themeId) {
        const settings = this.getAnimatedThemeCustomizableSettings()[themeId];
        if (!settings) return;

        this.currentCustomizingTheme = themeId;

        // Update modal title
        document.getElementById('customizeThemeName').textContent = settings.title;

        // Build the customization UI
        const body = document.getElementById('animatedThemeCustomizeBody');
        const currentSettings = this.animatedThemeSettings[themeId] || this.getAnimatedThemeDefaults()[themeId];
        const defaults = this.getAnimatedThemeDefaults()[themeId];

        body.innerHTML = `
            <div class="theme-customize-section">
                <h4><i class="fas ${settings.icon}"></i> Animation Settings</h4>
                ${settings.settings.map(setting => this.renderCustomizeSetting(setting, currentSettings[setting.id], defaults[setting.id])).join('')}
            </div>
            <div class="customize-preview">
                <div class="customize-preview-label">Live Preview</div>
                <div class="customize-preview-box" id="customizePreviewBox"></div>
            </div>
        `;

        // Bind slider events and reset buttons
        settings.settings.forEach(setting => {
            if (setting.type === 'slider') {
                const slider = document.getElementById(`customize_${setting.id}`);
                const valueDisplay = document.getElementById(`customize_${setting.id}_value`);
                const resetBtn = document.getElementById(`reset_${setting.id}`);

                if (slider && valueDisplay) {
                    slider.addEventListener('input', () => {
                        valueDisplay.textContent = slider.value + setting.unit;
                        this.previewAnimatedThemeSetting(themeId, setting.id, parseFloat(slider.value));
                        this.updateSettingResetButton(setting.id, parseFloat(slider.value), defaults[setting.id]);
                    });
                }

                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        const defaultValue = defaults[setting.id];
                        slider.value = defaultValue;
                        valueDisplay.textContent = defaultValue + setting.unit;
                        this.previewAnimatedThemeSetting(themeId, setting.id, defaultValue);
                        this.updateSettingResetButton(setting.id, defaultValue, defaultValue);
                    });
                }
            } else if (setting.type === 'toggle') {
                const toggle = document.getElementById(`customize_${setting.id}`);
                const resetBtn = document.getElementById(`reset_${setting.id}`);

                if (toggle) {
                    toggle.addEventListener('change', () => {
                        this.previewAnimatedThemeSetting(themeId, setting.id, toggle.checked);
                        this.updateSettingResetButton(setting.id, toggle.checked, defaults[setting.id]);
                    });
                }

                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        const defaultValue = defaults[setting.id];
                        toggle.checked = defaultValue;
                        this.previewAnimatedThemeSetting(themeId, setting.id, defaultValue);
                        this.updateSettingResetButton(setting.id, defaultValue, defaultValue);
                    });
                }
            }
        });

        // Show preview
        this.updateCustomizePreview(themeId);

        // Show modal
        document.getElementById('animatedThemeCustomizeModal').classList.add('show');
    }

    renderCustomizeSetting(setting, value, defaultValue) {
        const isModified = value !== defaultValue;

        if (setting.type === 'slider') {
            return `
                <div class="customize-control">
                    <div class="customize-control-header">
                        <span class="customize-control-label">${setting.label}</span>
                        <div class="customize-control-actions">
                            <button class="customize-reset-btn ${isModified ? 'visible' : ''}" 
                                    id="reset_${setting.id}" 
                                    title="Reset to default (${defaultValue}${setting.unit})">
                                <i class="fas fa-undo"></i>
                            </button>
                            <span class="customize-control-value" id="customize_${setting.id}_value">${value}${setting.unit}</span>
                        </div>
                    </div>
                    <input type="range" class="customize-slider" id="customize_${setting.id}" 
                           min="${setting.min}" max="${setting.max}" value="${value}">
                    <div class="customize-control-description">${setting.description}</div>
                </div>
            `;
        } else if (setting.type === 'toggle') {
            return `
                <div class="customize-toggle-row">
                    <div class="customize-toggle-info">
                        <span class="customize-toggle-label">${setting.label}</span>
                        <span class="customize-toggle-desc">${setting.description}</span>
                    </div>
                    <div class="customize-toggle-actions">
                        <button class="customize-reset-btn ${isModified ? 'visible' : ''}" 
                                id="reset_${setting.id}" 
                                title="Reset to default">
                            <i class="fas fa-undo"></i>
                        </button>
                        <label class="toggle-switch">
                            <input type="checkbox" id="customize_${setting.id}" ${value ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            `;
        }
        return '';
    }

    updateSettingResetButton(settingId, currentValue, defaultValue) {
        const resetBtn = document.getElementById(`reset_${settingId}`);
        if (resetBtn) {
            if (currentValue !== defaultValue) {
                resetBtn.classList.add('visible');
            } else {
                resetBtn.classList.remove('visible');
            }
        }
    }

    previewAnimatedThemeSetting(themeId, settingId, value) {
        // Temporarily apply the setting for live preview
        if (!this.tempThemeSettings) {
            this.tempThemeSettings = JSON.parse(JSON.stringify(this.animatedThemeSettings));
        }
        if (!this.tempThemeSettings[themeId]) {
            this.tempThemeSettings[themeId] = { ...this.getAnimatedThemeDefaults()[themeId] };
        }
        this.tempThemeSettings[themeId][settingId] = value;

        // Apply to current theme if it's the one being edited
        if (this.currentTheme === themeId || this.previewTheme === themeId) {
            this.applyAnimatedThemeCustomizations(this.tempThemeSettings);
        }

        this.updateCustomizePreview(themeId);
    }

    updateCustomizePreview(themeId) {
        const previewBox = document.getElementById('customizePreviewBox');
        if (!previewBox) return;

        const theme = this.getAnimatedThemes().find(t => t.id === themeId);
        if (!theme) return;

        // Set up preview with theme colors
        previewBox.style.background = theme.colors.bg;
        previewBox.className = `customize-preview-box ${theme.cssClass}`;
    }

    closeAnimatedThemeCustomization(save) {
        if (save && this.currentCustomizingTheme && this.tempThemeSettings) {
            // Save the new settings
            this.animatedThemeSettings = this.tempThemeSettings;
            this.saveAnimatedThemeSettings();

            // Refresh animated theme cards to update edited indicators
            this.renderAnimatedThemeCards();
            this.showNotification('Theme customization saved!', 'theme');
        } else {
            // Revert to original settings
            this.applyAnimatedThemeCustomizations();
        }

        this.tempThemeSettings = null;
        this.currentCustomizingTheme = null;
        document.getElementById('animatedThemeCustomizeModal').classList.remove('show');
    }

    resetAnimatedThemeDefaults() {
        if (!this.currentCustomizingTheme) return;

        const defaults = this.getAnimatedThemeDefaults()[this.currentCustomizingTheme];
        const settings = this.getAnimatedThemeCustomizableSettings()[this.currentCustomizingTheme];

        if (!defaults || !settings) return;

        // Reset slider and toggle values
        settings.settings.forEach(setting => {
            const defaultValue = defaults[setting.id];
            if (setting.type === 'slider') {
                const slider = document.getElementById(`customize_${setting.id}`);
                const valueDisplay = document.getElementById(`customize_${setting.id}_value`);
                if (slider && valueDisplay) {
                    slider.value = defaultValue;
                    valueDisplay.textContent = defaultValue + setting.unit;
                }
            } else if (setting.type === 'toggle') {
                const toggle = document.getElementById(`customize_${setting.id}`);
                if (toggle) {
                    toggle.checked = defaultValue;
                }
            }
            // Hide reset button since we're at default
            this.updateSettingResetButton(setting.id, defaultValue, defaultValue);
            this.previewAnimatedThemeSetting(this.currentCustomizingTheme, setting.id, defaultValue);
        });

        this.showNotification('Reset to defaults', 'settings');
    }

    applyAnimatedThemeCustomizations(settings = null) {
        const themeSettings = settings || this.animatedThemeSettings;
        const root = document.documentElement;

        // Apply Galaxy settings
        if (themeSettings.galaxy) {
            const g = themeSettings.galaxy;
            root.style.setProperty('--galaxy-twinkle-speed-1', `${g.twinkleSpeed}s`);
            root.style.setProperty('--galaxy-twinkle-speed-2', `${g.twinkleSpeed * 1.5}s`);
            root.style.setProperty('--galaxy-twinkle-speed-3', `${g.twinkleSpeed * 2.5}s`);
            root.style.setProperty('--galaxy-star-brightness', `${g.starBrightness / 100}`);
            root.style.setProperty('--galaxy-nebula-intensity', `${g.nebulaIntensity / 100}`);

            // Generate dynamic star backgrounds
            this.generateGalaxyStars(g);
        }

        // Apply Aurora settings
        if (themeSettings.aurora) {
            const a = themeSettings.aurora;
            root.style.setProperty('--aurora-animation-speed', `${a.animationSpeed}s`);
            root.style.setProperty('--aurora-glow-intensity', `${a.glowIntensity}px`);
            root.style.setProperty('--aurora-pulse-speed', `${a.pulseSpeed}s`);
        }

        // Apply Ocean settings
        if (themeSettings['ocean-wave']) {
            const o = themeSettings['ocean-wave'];
            root.style.setProperty('--ocean-wave-speed', `${o.waveSpeed}s`);
            root.style.setProperty('--ocean-wave-height', `${o.waveHeight}px`);
            root.style.setProperty('--ocean-depth-intensity', `${o.depthIntensity / 100}`);
        }

        // Apply Sunset settings
        if (themeSettings['sunset-glow']) {
            const s = themeSettings['sunset-glow'];
            root.style.setProperty('--sunset-glow-speed', `${s.glowSpeed}s`);
            root.style.setProperty('--sunset-glow-intensity', `${s.glowIntensity / 100}`);
            root.style.setProperty('--sunset-horizon-brightness', `${s.horizonBrightness / 100}`);
        }

        // Apply Neon settings
        if (themeSettings['neon-pulse']) {
            const n = themeSettings['neon-pulse'];
            root.style.setProperty('--neon-pulse-speed', `${n.pulseSpeed}s`);
            root.style.setProperty('--neon-glow-intensity', `${n.glowIntensity / 100}`);
            root.style.setProperty('--neon-flow-speed', `${n.flowSpeed}s`);
            root.style.setProperty('--neon-border-glow', `${n.borderGlow / 100}`);
        }

        // Apply Forest settings
        if (themeSettings['enchanted-forest']) {
            const f = themeSettings['enchanted-forest'];
            root.style.setProperty('--forest-sunbeam-speed', `${f.sunbeamSpeed}s`);
            root.style.setProperty('--forest-sunbeam-intensity', `${f.sunbeamIntensity / 100}`);
            root.style.setProperty('--forest-mist-density', `${f.mistDensity / 100}`);
            root.style.setProperty('--forest-mist-speed', `${f.mistSpeed}s`);
        }

        // Apply Candy settings
        if (themeSettings.candy) {
            const c = themeSettings.candy;
            root.style.setProperty('--candy-swirl-speed', `${c.swirlSpeed}s`);
            root.style.setProperty('--candy-shimmer-speed', `${c.shimmerSpeed}s`);
            root.style.setProperty('--candy-color-intensity', `${c.colorIntensity / 100}`);
        }
    }

    generateGalaxyStars(settings) {
        const starCount = settings.starCount || 50;
        const brightness = settings.starBrightness / 100 || 0.7;
        const coloredStars = settings.coloredStars !== false;
        const nebulaIntensity = settings.nebulaIntensity / 100 || 0.4;

        // Generate stars for layer 1 (small distant stars)
        const layer1Stars = [];
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = 1;
            layer1Stars.push(`radial-gradient(${size}px ${size}px at ${x.toFixed(1)}% ${y.toFixed(1)}%, white, transparent)`);
        }

        // Generate stars for layer 2 (medium stars with some colored)
        const layer2Stars = [];
        const layer2Count = Math.floor(starCount * 0.7);
        for (let i = 0; i < layer2Count; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = 1.5;
            const opacity = 0.7 + Math.random() * 0.3;

            let color = `rgba(255,255,255,${opacity})`;
            if (coloredStars && Math.random() < 0.2) {
                const colors = [
                    `rgba(200,180,255,${opacity})`,
                    `rgba(180,200,255,${opacity})`,
                    `rgba(255,200,220,${opacity})`
                ];
                color = colors[Math.floor(Math.random() * colors.length)];
            }
            layer2Stars.push(`radial-gradient(${size}px ${size}px at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${color}, transparent)`);
        }

        // Generate stars for layer 3 (bright accent stars)
        const layer3Stars = [];
        const layer3Count = Math.floor(starCount * 0.3);
        for (let i = 0; i < layer3Count; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = 2 + Math.random();

            let color = 'rgba(255,255,255,1)';
            if (coloredStars && Math.random() < 0.5) {
                const colors = [
                    `rgba(168,85,247,${nebulaIntensity + 0.3})`,
                    `rgba(139,92,246,${nebulaIntensity + 0.2})`,
                    `rgba(196,181,253,${nebulaIntensity + 0.3})`
                ];
                color = colors[Math.floor(Math.random() * colors.length)];
            }
            layer3Stars.push(`radial-gradient(${size.toFixed(1)}px ${size.toFixed(1)}px at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${color}, transparent)`);
        }

        // Apply the generated backgrounds via CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--galaxy-stars-layer1', layer1Stars.join(','));
        root.style.setProperty('--galaxy-stars-layer2', layer2Stars.join(','));
        root.style.setProperty('--galaxy-stars-layer3', layer3Stars.join(','));
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
        // Tier 1 - Simple Reset Modal
        const resetModal = document.getElementById('resetModal');
        const resetModalClose = document.getElementById('resetModalClose');
        const resetCancelBtn = document.getElementById('resetCancelBtn');
        const resetConfirmBtn = document.getElementById('resetConfirmBtn');
        const learnMoreBtn = document.getElementById('resetLearnMoreBtn');

        // Tier 2 - Detailed Reset Modal
        const resetDetailsModal = document.getElementById('resetDetailsModal');
        const resetDetailsClose = document.getElementById('resetDetailsClose');
        const resetDetailsBackBtn = document.getElementById('resetDetailsBackBtn');
        const resetDetailsConfirmBtn = document.getElementById('resetDetailsConfirmBtn');

        // Tier 1 handlers
        if (resetModalClose) {
            resetModalClose.addEventListener('click', () => this.closeResetModal());
        }
        if (resetCancelBtn) {
            resetCancelBtn.addEventListener('click', () => this.closeResetModal());
        }
        if (resetConfirmBtn) {
            resetConfirmBtn.addEventListener('click', () => this.resetAllData());
        }
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.openResetDetailsModal());
        }

        // Tier 2 handlers
        if (resetDetailsClose) {
            resetDetailsClose.addEventListener('click', () => this.closeResetDetailsModal());
        }
        if (resetDetailsBackBtn) {
            resetDetailsBackBtn.addEventListener('click', () => this.closeResetDetailsModal());
        }
        if (resetDetailsConfirmBtn) {
            resetDetailsConfirmBtn.addEventListener('click', () => this.resetAllData());
        }

        // Close on backdrop click for both modals
        if (resetModal) {
            resetModal.addEventListener('click', (e) => {
                if (e.target === resetModal) {
                    this.handleModalClickOutside(
                        'resetModal',
                        null,
                        () => this.closeResetModal()
                    );
                }
            });
        }
        if (resetDetailsModal) {
            resetDetailsModal.addEventListener('click', (e) => {
                if (e.target === resetDetailsModal) {
                    this.closeResetDetailsModal();
                }
            });
        }
    }

    openResetDetailsModal() {
        // Show Tier 2 modal on top of Tier 1 (don't close Tier 1)
        document.getElementById('resetDetailsModal').classList.add('show');
    }

    closeResetDetailsModal() {
        document.getElementById('resetDetailsModal').classList.remove('show');
        // Tier 1 modal stays open
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
            'wysiwyg_flag_border_enabled',
            'wysiwyg_flag_border_width',
            'wysiwyg_modal_click_outside',
            'wysiwyg_modal_save_behavior',
            'wysiwyg_default_load_action',
            'wysiwyg_custom_flags',
            'wysiwyg_editor_customization',
            'wysiwyg_toolbar_customization',
            'wysiwyg_animated_theme_settings',
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

        // Flag border enabled toggle - update border width config visibility
        const flagBorderEnabledToggle = document.getElementById('flagBorderEnabled');
        const flagBorderWidthConfig = document.getElementById('flagBorderWidthConfig');
        if (flagBorderEnabledToggle && flagBorderWidthConfig) {
            flagBorderEnabledToggle.addEventListener('change', () => {
                flagBorderWidthConfig.classList.toggle('disabled', !flagBorderEnabledToggle.checked);
            });
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
        const flagBorderEnabledToggle = document.getElementById('flagBorderEnabled');
        const flagBorderInput = document.getElementById('flagBorderWidth');
        const flagBorderWidthConfig = document.getElementById('flagBorderWidthConfig');
        const modalClickOutsideSelect = document.getElementById('modalClickOutside');
        const modalSaveBehaviorSelect = document.getElementById('modalSaveBehavior');
        const defaultLoadActionSelect = document.getElementById('defaultLoadAction');

        // Populate current values
        if (valueInput) valueInput.value = this.autoSaveValue;
        if (unitSelect) unitSelect.value = this.autoSaveUnit;
        if (limitInput) limitInput.value = this.autoSaveLimit;
        if (deleteInput) deleteInput.value = this.autoDeleteDays;
        if (flagBorderEnabledToggle) flagBorderEnabledToggle.checked = this.flagBorderEnabled;
        if (flagBorderInput) flagBorderInput.value = this.flagBorderWidth;
        if (modalClickOutsideSelect) modalClickOutsideSelect.value = this.modalClickOutside;
        if (modalSaveBehaviorSelect) modalSaveBehaviorSelect.value = this.modalSaveBehavior;
        if (defaultLoadActionSelect) defaultLoadActionSelect.value = this.defaultLoadAction;

        // Update border width config visibility based on enabled state
        if (flagBorderWidthConfig) {
            flagBorderWidthConfig.classList.toggle('disabled', !this.flagBorderEnabled);
        }

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
        const flagBorderEnabledToggle = document.getElementById('flagBorderEnabled');
        const flagBorderInput = document.getElementById('flagBorderWidth');
        const modalClickOutsideSelect = document.getElementById('modalClickOutside');
        const modalSaveBehaviorSelect = document.getElementById('modalSaveBehavior');
        const defaultLoadActionSelect = document.getElementById('defaultLoadAction');

        const newValue = parseInt(valueInput.value) || 5;
        const newUnit = unitSelect.value;
        const newLimit = parseInt(limitInput.value) || 3;
        const newDeleteDays = parseInt(deleteInput.value) || 7;
        const newFlagBorderEnabled = flagBorderEnabledToggle.checked;
        const newFlagBorderWidth = parseInt(flagBorderInput.value) || 3;
        const newModalClickOutside = modalClickOutsideSelect.value;
        const newModalSaveBehavior = modalSaveBehaviorSelect.value;
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
        this.flagBorderEnabled = newFlagBorderEnabled;
        this.flagBorderWidth = newFlagBorderWidth;
        this.modalClickOutside = newModalClickOutside;
        this.modalSaveBehavior = newModalSaveBehavior;
        this.defaultLoadAction = newDefaultLoadAction;
        this.saveAutoSaveSettings();
        this.saveFlagBorderEnabled();
        this.saveFlagBorderWidth();
        this.saveModalClickOutside();
        this.saveModalSaveBehavior();
        this.saveDefaultLoadAction();

        // Apply flag border immediately
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

        // Only close if save behavior is set to close
        if (this.modalSaveBehavior === 'saveAndClose') {
            this.closeAdvancedSettings();
        }
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
        const defaults = {
            enabled: true,
            autoSave: true,
            docSave: true,
            docDelete: true,
            theme: true,
            settings: true,
            spellcheck: true,
            docBar: true,
            duration: 2,
            position: 'bottom-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
            deliveryMode: 'stack' // 'stack', 'clear', 'queue'
        };

        if (saved) {
            const settings = JSON.parse(saved);
            // Merge with defaults for backwards compatibility
            return { ...defaults, ...settings };
        }
        return defaults;
    }

    saveToastSettings() {
        localStorage.setItem('wysiwyg_toast_settings', JSON.stringify(this.toastSettings));
    }

    // ==================== Toast Service ====================

    initToastService() {
        this.activeToasts = [];
        this.toastQueue = [];
        this.toastIdCounter = 0;
        this.toastGap = 12; // Gap between stacked toasts in pixels
    }

    createToastElement(message, toastId) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.dataset.toastId = toastId;

        // Add position class
        toast.classList.add(`toast-${this.toastSettings.position}`);

        // Create content wrapper
        const content = document.createElement('span');
        content.className = 'toast-content';
        content.textContent = message;

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dismissToast(toastId);
        });

        toast.appendChild(content);
        toast.appendChild(closeBtn);

        return toast;
    }

    calculateToastPosition(index) {
        const position = this.toastSettings.position;
        const baseOffset = 20;
        let offset = baseOffset;

        // Calculate offset based on existing toasts
        for (let i = 0; i < index; i++) {
            const existingToast = this.activeToasts[i]?.element;
            if (existingToast) {
                offset += existingToast.offsetHeight + this.toastGap;
            }
        }

        return offset;
    }

    positionToast(toast, index) {
        const position = this.toastSettings.position;
        const offset = this.calculateToastPosition(index);

        // Reset all positions
        toast.style.top = '';
        toast.style.bottom = '';
        toast.style.left = '';
        toast.style.right = '';

        // Apply position based on setting
        if (position.includes('top')) {
            toast.style.top = `${offset}px`;
        } else {
            toast.style.bottom = `${offset}px`;
        }

        if (position.includes('left')) {
            toast.style.left = '20px';
            toast.style.right = 'auto';
        } else {
            toast.style.right = '20px';
            toast.style.left = 'auto';
        }
    }

    repositionAllToasts() {
        this.activeToasts.forEach((toastData, index) => {
            if (toastData.element) {
                this.positionToast(toastData.element, index);
            }
        });
    }

    dismissToast(toastId, skipQueue = false) {
        const toastIndex = this.activeToasts.findIndex(t => t.id === toastId);
        if (toastIndex === -1) return;

        const toastData = this.activeToasts[toastIndex];
        const toast = toastData.element;

        // Clear the auto-hide timer
        if (toastData.timer) {
            clearTimeout(toastData.timer);
        }

        // Animate out
        toast.classList.remove('show');
        toast.classList.add('hiding');

        setTimeout(() => {
            toast.remove();
            this.activeToasts.splice(toastIndex, 1);

            // Reposition remaining toasts with animation
            this.repositionAllToasts();

            // Process queue if in queue mode and not skipping
            if (!skipQueue && this.toastSettings.deliveryMode === 'queue' && this.toastQueue.length > 0) {
                const nextToast = this.toastQueue.shift();
                this.displayToast(nextToast.message, nextToast.category);
            }
        }, 300);
    }

    clearAllToasts() {
        this.activeToasts.forEach(toastData => {
            if (toastData.timer) {
                clearTimeout(toastData.timer);
            }
            if (toastData.element) {
                toastData.element.remove();
            }
        });
        this.activeToasts = [];
    }

    displayToast(message, category) {
        const toastId = ++this.toastIdCounter;
        const toast = this.createToastElement(message, toastId);

        document.body.appendChild(toast);

        // Calculate position based on current active toasts
        const index = this.activeToasts.length;
        this.positionToast(toast, index);

        // Store toast data
        const toastData = {
            id: toastId,
            element: toast,
            message: message,
            category: category,
            timer: null
        };

        this.activeToasts.push(toastData);

        // Trigger show animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Set up auto-dismiss timer
        const duration = (this.toastSettings.duration || 2) * 1000;
        toastData.timer = setTimeout(() => {
            this.dismissToast(toastId);
        }, duration);

        return toastId;
    }

    initToastSettingsModal() {
        const toastSettingsBtn = document.getElementById('toastSettingsBtn');
        const modal = document.getElementById('toastSettingsModal');
        const closeBtn = document.getElementById('toastSettingsModalClose');
        const cancelBtn = document.getElementById('toastSettingsCancelBtn');
        const saveBtn = document.getElementById('toastSettingsSaveBtn');
        const masterToggle = document.getElementById('toastMasterToggle');
        const durationSlider = document.getElementById('toastDuration');
        const durationValue = document.getElementById('toastDurationValue');

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

        // Duration slider functionality
        if (durationSlider && durationValue) {
            durationSlider.addEventListener('input', () => {
                const value = parseFloat(durationSlider.value);
                durationValue.textContent = value;
                this.updateDurationPresetButtons(value);
            });
        }

        // Duration preset buttons
        document.querySelectorAll('.duration-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const duration = parseFloat(btn.dataset.duration);
                if (durationSlider && durationValue) {
                    durationSlider.value = duration;
                    durationValue.textContent = duration;
                    this.updateDurationPresetButtons(duration);
                }
            });
        });

        // Position buttons
        document.querySelectorAll('.toast-position-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toast-position-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Test toast button
        const testToastBtn = document.getElementById('testToastBtn');
        if (testToastBtn) {
            testToastBtn.addEventListener('click', () => {
                // Temporarily apply current modal settings for testing
                const tempSettings = { ...this.toastSettings };

                // Get current modal values
                const durationSlider = document.getElementById('toastDuration');
                const activePositionBtn = document.querySelector('.toast-position-btn.active');
                const activeBehaviorRadio = document.querySelector('input[name="toastBehavior"]:checked');

                this.toastSettings.duration = durationSlider ? parseFloat(durationSlider.value) : 2;
                this.toastSettings.position = activePositionBtn ? activePositionBtn.dataset.position : 'bottom-right';
                this.toastSettings.deliveryMode = activeBehaviorRadio ? activeBehaviorRadio.value : 'stack';

                // Show test notification
                this.showNotification('This is a test notification!', 'general');

                // Restore original settings (they'll be saved when user clicks Save)
                // Note: We don't restore because user might want to see the effect
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

        // Initialize duration slider
        const durationSlider = document.getElementById('toastDuration');
        const durationValue = document.getElementById('toastDurationValue');
        if (durationSlider && durationValue) {
            durationSlider.value = this.toastSettings.duration;
            durationValue.textContent = this.toastSettings.duration;
            this.updateDurationPresetButtons(this.toastSettings.duration);
        }

        // Initialize position buttons
        const position = this.toastSettings.position || 'bottom-right';
        document.querySelectorAll('.toast-position-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.position === position);
        });

        // Initialize behavior radio buttons
        const deliveryMode = this.toastSettings.deliveryMode || 'stack';
        const behaviorRadio = document.querySelector(`input[name="toastBehavior"][value="${deliveryMode}"]`);
        if (behaviorRadio) {
            behaviorRadio.checked = true;
        }

        // Update individual options state
        this.updateIndividualToastOptions();

        // Open toast settings modal
        document.getElementById('toastSettingsModal').classList.add('show');
    }

    updateDurationPresetButtons(duration) {
        const presetBtns = document.querySelectorAll('.duration-preset-btn');
        presetBtns.forEach(btn => {
            const btnDuration = parseFloat(btn.dataset.duration);
            if (btnDuration === duration) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
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
        // Get duration value from slider
        const durationSlider = document.getElementById('toastDuration');
        const duration = durationSlider ? parseFloat(durationSlider.value) : 2;

        // Get position from active button
        const activePositionBtn = document.querySelector('.toast-position-btn.active');
        const position = activePositionBtn ? activePositionBtn.dataset.position : 'bottom-right';

        // Get delivery mode from radio buttons
        const activeBehaviorRadio = document.querySelector('input[name="toastBehavior"]:checked');
        const deliveryMode = activeBehaviorRadio ? activeBehaviorRadio.value : 'stack';

        // Save all toast settings
        this.toastSettings = {
            enabled: document.getElementById('toastMasterToggle').checked,
            autoSave: document.getElementById('toastAutoSave').checked,
            docSave: document.getElementById('toastDocSave').checked,
            docDelete: document.getElementById('toastDocDelete').checked,
            theme: document.getElementById('toastTheme').checked,
            settings: document.getElementById('toastSettings').checked,
            spellcheck: document.getElementById('toastSpellcheck').checked,
            docBar: document.getElementById('toastDocBar').checked,
            duration: duration,
            position: position,
            deliveryMode: deliveryMode
        };

        this.saveToastSettings();

        // Only close if save behavior is set to close
        if (this.modalSaveBehavior === 'saveAndClose') {
            // Close and return to previous modal
            document.getElementById('toastSettingsModal').classList.remove('show');

            if (this.previousModal) {
                setTimeout(() => {
                    document.getElementById(this.previousModal).classList.add('show');
                    this.previousModal = null;
                }, 150);
            }
        }

        // Show confirmation if notifications are enabled
        if (this.toastSettings.enabled && this.toastSettings.settings) {
            this.showNotification('Toast settings saved!', 'settings');
        }
    }

    // ==================== Customize Editor Modal ====================

    initCustomizeEditorModal() {
        const modal = document.getElementById('customizeEditorModal');
        const closeBtn = document.getElementById('customizeEditorClose');
        const cancelBtn = document.getElementById('customizeEditorCancelBtn');
        const saveBtn = document.getElementById('customizeEditorSaveBtn');
        const resetBtn = document.getElementById('customizeEditorResetBtn');
        const customizeBtn = document.getElementById('customizeEditorBtn');

        // Store original state for change detection
        this.customizeEditorOriginalState = null;

        // Open modal from View menu
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.openCustomizeEditorModal();
                document.getElementById('viewMenu').classList.remove('show');
            });
        }

        // Close button (X)
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.handleCustomizeEditorClose());
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCustomizeEditorClose());
        }

        // Save button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCustomizeEditor());
        }

        // Reset to defaults button
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCustomizeEditorDefaults());
        }

        // Toggle All switch
        const toggleAllSwitch = document.getElementById('customizeEditorToggleAll');
        if (toggleAllSwitch) {
            toggleAllSwitch.addEventListener('change', () => {
                const isChecked = toggleAllSwitch.checked;
                document.getElementById('showWordCount').checked = isChecked;
                document.getElementById('showCharCount').checked = isChecked;
                document.getElementById('showFlagStatus').checked = isChecked;
                document.getElementById('showReadingTime').checked = isChecked;
            });
        }

        // Update Toggle All state when individual options change
        const editorOptions = ['showWordCount', 'showCharCount', 'showFlagStatus', 'showReadingTime'];
        editorOptions.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.updateCustomizeEditorToggleAll());
            }
        });

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.handleModalClickOutside(
                        'customizeEditorModal',
                        () => this.saveCustomizeEditor(),
                        () => this.handleCustomizeEditorClose()
                    );
                }
            });
        }
    }

    updateCustomizeEditorToggleAll() {
        const toggleAll = document.getElementById('customizeEditorToggleAll');
        const allChecked =
            document.getElementById('showWordCount').checked &&
            document.getElementById('showCharCount').checked &&
            document.getElementById('showFlagStatus').checked &&
            document.getElementById('showReadingTime').checked;

        toggleAll.checked = allChecked;
    }

    openCustomizeEditorModal() {
        // Store original state for change detection
        this.customizeEditorOriginalState = JSON.stringify(this.editorCustomization);

        // Populate current values
        document.getElementById('showWordCount').checked = this.editorCustomization.showWordCount;
        document.getElementById('showCharCount').checked = this.editorCustomization.showCharCount;
        document.getElementById('showFlagStatus').checked = this.editorCustomization.showFlagStatus;
        document.getElementById('showReadingTime').checked = this.editorCustomization.showReadingTime;

        // Update Toggle All state
        this.updateCustomizeEditorToggleAll();

        // Show modal
        document.getElementById('customizeEditorModal').classList.add('show');
    }

    hasCustomizeEditorChanges() {
        const currentState = JSON.stringify({
            showWordCount: document.getElementById('showWordCount').checked,
            showCharCount: document.getElementById('showCharCount').checked,
            showFlagStatus: document.getElementById('showFlagStatus').checked,
            showReadingTime: document.getElementById('showReadingTime').checked
        });
        return currentState !== this.customizeEditorOriginalState;
    }

    handleCustomizeEditorClose() {
        if (this.hasCustomizeEditorChanges()) {
            this.showUnsavedChangesWarning(
                'customizeEditorModal',
                () => this.saveCustomizeEditor(),
                () => this.closeCustomizeEditorModal()
            );
        } else {
            this.closeCustomizeEditorModal();
        }
    }

    closeCustomizeEditorModal() {
        document.getElementById('customizeEditorModal').classList.remove('show');
        this.customizeEditorOriginalState = null;
    }

    saveCustomizeEditor() {
        // Get values from UI
        this.editorCustomization = {
            showWordCount: document.getElementById('showWordCount').checked,
            showCharCount: document.getElementById('showCharCount').checked,
            showFlagStatus: document.getElementById('showFlagStatus').checked,
            showReadingTime: document.getElementById('showReadingTime').checked
        };

        // Save to localStorage
        this.saveEditorCustomization();

        // Apply changes
        this.applyEditorCustomization();

        // Update original state (so subsequent saves don't trigger unsaved warning)
        this.customizeEditorOriginalState = JSON.stringify(this.editorCustomization);

        // Handle modal closing based on save behavior
        if (this.modalSaveBehavior === 'saveAndClose') {
            this.closeCustomizeEditorModal();
        }

        this.showNotification('Editor settings saved!', 'settings');
    }

    resetCustomizeEditorDefaults() {
        // Reset all toggles to ON
        document.getElementById('showWordCount').checked = true;
        document.getElementById('showCharCount').checked = true;
        document.getElementById('showFlagStatus').checked = true;
        document.getElementById('showReadingTime').checked = true;

        this.showNotification('Reset to defaults', 'settings');
    }

    // ==================== Customize Toolbar Modal ====================

    loadToolbarCustomization() {
        const saved = localStorage.getItem('wysiwyg_toolbar_customization');
        const defaults = this.getDefaultToolbarState();

        if (saved) {
            const savedState = JSON.parse(saved);
            // Merge saved state with defaults - this ensures new tools get their default values
            // and existing saved preferences are preserved
            return { ...defaults, ...savedState };
        }
        return defaults;
    }

    getDefaultToolbarState() {
        return {
            undo: true,
            redo: true,
            bold: true,
            italic: true,
            underline: true,
            strikeThrough: true,
            formatBlock: true,
            fontName: true,
            fontSize: true,
            foreColor: true,
            backColor: true,
            justifyLeft: true,
            justifyCenter: true,
            justifyRight: true,
            justifyFull: true,
            insertUnorderedList: true,
            insertOrderedList: true,
            indent: true,
            outdent: true,
            link: true,
            unlink: true,
            image: true,
            table: true,
            insertHorizontalRule: true,
            removeFormat: true,
            spellcheck: true,
            subscript: false,
            superscript: false
        };
    }

    saveToolbarCustomization() {
        localStorage.setItem('wysiwyg_toolbar_customization', JSON.stringify(this.toolbarCustomization));
    }

    initCustomizeToolbarModal() {
        const modal = document.getElementById('customizeToolbarModal');
        const closeBtn = document.getElementById('customizeToolbarClose');
        const cancelBtn = document.getElementById('customizeToolbarCancelBtn');
        const saveBtn = document.getElementById('customizeToolbarSaveBtn');
        const resetBtn = document.getElementById('customizeToolbarResetBtn');
        const customizeBtn = document.getElementById('customizeToolbarBtn');

        // Open modal from View menu
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.openCustomizeToolbarModal();
                document.getElementById('viewMenu').classList.remove('show');
            });
        }

        // Close button (X)
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.handleCustomizeToolbarClose());
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCustomizeToolbarClose());
        }

        // Save button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveToolbarSettings());
        }

        // Reset to defaults button
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToolbarDefaults());
        }

        // Toggle All switch
        const toggleAllSwitch = document.getElementById('customizeToolbarToggleAll');
        if (toggleAllSwitch) {
            toggleAllSwitch.addEventListener('change', () => {
                const isChecked = toggleAllSwitch.checked;
                document.querySelectorAll('#customizeToolbarModal [data-tool]').forEach(checkbox => {
                    checkbox.checked = isChecked;
                });
            });
        }

        // Update Toggle All state when individual options change
        document.querySelectorAll('#customizeToolbarModal [data-tool]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateCustomizeToolbarToggleAll());
        });

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.handleModalClickOutside(
                        'customizeToolbarModal',
                        () => this.saveToolbarSettings(),
                        () => this.handleCustomizeToolbarClose()
                    );
                }
            });
        }
    }

    updateCustomizeToolbarToggleAll() {
        const toggleAll = document.getElementById('customizeToolbarToggleAll');
        const checkboxes = document.querySelectorAll('#customizeToolbarModal [data-tool]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        toggleAll.checked = allChecked;
    }

    openCustomizeToolbarModal() {
        // Store original state for change detection
        this.toolbarCustomizationOriginalState = JSON.stringify(this.toolbarCustomization);

        // Populate current values
        document.querySelectorAll('#customizeToolbarModal [data-tool]').forEach(checkbox => {
            const tool = checkbox.dataset.tool;
            // Use strict equality - if the value is true, check it; otherwise uncheck
            checkbox.checked = this.toolbarCustomization[tool] === true;
        });

        // Update Toggle All state
        this.updateCustomizeToolbarToggleAll();

        // Show modal
        document.getElementById('customizeToolbarModal').classList.add('show');
    }

    hasToolbarCustomizationChanges() {
        const currentState = {};
        document.querySelectorAll('#customizeToolbarModal [data-tool]').forEach(checkbox => {
            currentState[checkbox.dataset.tool] = checkbox.checked;
        });
        return JSON.stringify(currentState) !== this.toolbarCustomizationOriginalState;
    }

    handleCustomizeToolbarClose() {
        if (this.hasToolbarCustomizationChanges()) {
            this.showUnsavedChangesWarning(
                'customizeToolbarModal',
                () => this.saveToolbarSettings(),
                () => this.closeCustomizeToolbarModal()
            );
        } else {
            this.closeCustomizeToolbarModal();
        }
    }

    closeCustomizeToolbarModal() {
        document.getElementById('customizeToolbarModal').classList.remove('show');
        this.toolbarCustomizationOriginalState = null;
    }

    saveToolbarSettings() {
        // Get values from UI
        const newSettings = {};
        document.querySelectorAll('#customizeToolbarModal [data-tool]').forEach(checkbox => {
            newSettings[checkbox.dataset.tool] = checkbox.checked;
        });

        this.toolbarCustomization = newSettings;

        // Save to localStorage
        this.saveToolbarCustomization();

        // Apply changes
        this.applyToolbarCustomization();

        // Update original state
        this.toolbarCustomizationOriginalState = JSON.stringify(this.toolbarCustomization);

        // Handle modal closing based on save behavior
        if (this.modalSaveBehavior === 'saveAndClose') {
            this.closeCustomizeToolbarModal();
        }

        this.showNotification('Toolbar settings saved!', 'settings');
    }

    resetToolbarDefaults() {
        // Reset all toggles to their default states
        const defaults = this.getDefaultToolbarState();
        document.querySelectorAll('#customizeToolbarModal [data-tool]').forEach(checkbox => {
            const tool = checkbox.dataset.tool;
            checkbox.checked = defaults[tool] !== false;
        });

        this.showNotification('Reset to defaults', 'settings');
    }

    applyToolbarCustomization() {
        const toolbar = document.querySelector('.toolbar');
        if (!toolbar) return;

        // Map tool names to their button selectors
        const toolButtonMap = {
            undo: '[data-command="undo"]',
            redo: '[data-command="redo"]',
            bold: '[data-command="bold"]',
            italic: '[data-command="italic"]',
            underline: '[data-command="underline"]',
            strikeThrough: '[data-command="strikeThrough"]',
            subscript: '[data-command="subscript"]',
            superscript: '[data-command="superscript"]',
            formatBlock: '#formatSelect',
            fontName: '#fontSelect',
            fontSize: '#sizeSelect',
            foreColor: '#textColorPicker',
            backColor: '#highlightColorPicker',
            justifyLeft: '[data-command="justifyLeft"]',
            justifyCenter: '[data-command="justifyCenter"]',
            justifyRight: '[data-command="justifyRight"]',
            justifyFull: '[data-command="justifyFull"]',
            insertUnorderedList: '[data-command="insertUnorderedList"]',
            insertOrderedList: '[data-command="insertOrderedList"]',
            indent: '[data-command="indent"]',
            outdent: '[data-command="outdent"]',
            link: '#linkBtn',
            unlink: '[data-command="unlink"]',
            image: '#imageBtn',
            table: '#tableBtn',
            insertHorizontalRule: '[data-command="insertHorizontalRule"]',
            removeFormat: '[data-command="removeFormat"]',
            spellcheck: '#spellcheckToggle'
        };

        // Apply visibility to each tool
        Object.entries(toolButtonMap).forEach(([tool, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                // Find the parent toolbar-btn or the element itself
                const btn = element.closest('.toolbar-btn') || element.closest('.toolbar-select') || element;
                if (btn) {
                    // Use strict equality - only show if explicitly true
                    btn.style.display = this.toolbarCustomization[tool] === true ? '' : 'none';
                }
            }
        });

        // Handle color picker parents (they're inside toolbar-btn)
        const textColorBtn = document.querySelector('.toolbar-btn:has(#textColorPicker)');
        const highlightColorBtn = document.querySelector('.toolbar-btn:has(#highlightColorPicker)');

        if (textColorBtn) {
            textColorBtn.style.display = this.toolbarCustomization.foreColor === true ? '' : 'none';
        }
        if (highlightColorBtn) {
            highlightColorBtn.style.display = this.toolbarCustomization.backColor === true ? '' : 'none';
        }
    }

    // ==================== Unsaved Changes Modal ====================

    initUnsavedChangesModal() {
        const modal = document.getElementById('unsavedChangesModal');
        const closeBtn = document.getElementById('unsavedChangesClose');
        const cancelBtn = document.getElementById('unsavedCancelBtn');
        const discardBtn = document.getElementById('unsavedDiscardBtn');
        const saveBtn = document.getElementById('unsavedSaveBtn');

        // Close button (X) - same as Cancel
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeUnsavedChangesModal());
        }

        // Cancel button - return to original modal
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeUnsavedChangesModal());
        }

        // Discard Changes button
        if (discardBtn) {
            discardBtn.addEventListener('click', () => {
                this.closeUnsavedChangesModal();
                // Close the original modal without saving
                if (this.pendingUnsavedCallback && this.pendingUnsavedCallback.discard) {
                    this.pendingUnsavedCallback.discard();
                }
                this.pendingUnsavedModal = null;
                this.pendingUnsavedCallback = null;
            });
        }

        // Save & Close button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Save changes
                if (this.pendingUnsavedCallback && this.pendingUnsavedCallback.save) {
                    this.pendingUnsavedCallback.save();
                }
                this.closeUnsavedChangesModal();
                // Close original modal (save callback may already close it)
                this.pendingUnsavedModal = null;
                this.pendingUnsavedCallback = null;
            });
        }
    }

    showUnsavedChangesWarning(modalId, saveCallback, discardCallback) {
        this.pendingUnsavedModal = modalId;
        this.pendingUnsavedCallback = {
            save: saveCallback,
            discard: discardCallback
        };

        // Show warning modal
        document.getElementById('unsavedChangesModal').classList.add('show');
    }

    closeUnsavedChangesModal() {
        document.getElementById('unsavedChangesModal').classList.remove('show');
    }

    // ==================== Help Menu ====================

    initHelpMenu() {
        const helpBtn = document.getElementById('helpBtn');
        const helpMenu = document.getElementById('helpMenu');
        const showDocsBtn = document.getElementById('showDocsBtn');
        const aboutBtn = document.getElementById('aboutBtn');
        const docsModal = document.getElementById('docsModal');
        const docsModalClose = document.getElementById('docsModalClose');
        const aboutModal = document.getElementById('aboutModal');
        const aboutModalClose = document.getElementById('aboutModalClose');
        const aboutCloseBtn = document.getElementById('aboutCloseBtn');
        const docsSearchInput = document.getElementById('docsSearchInput');

        // Toggle help menu
        if (helpBtn && helpMenu) {
            helpBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                // Close other menus first (but not the help menu)
                const isCurrentlyOpen = helpMenu.classList.contains('show');
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    if (menu.id !== 'helpMenu') {
                        menu.classList.remove('show');
                    }
                });

                // Toggle the help menu
                if (isCurrentlyOpen) {
                    helpMenu.classList.remove('show');
                } else {
                    helpMenu.classList.add('show');
                }
            });
        }

        // Show Documentation modal
        if (showDocsBtn) {
            showDocsBtn.addEventListener('click', () => {
                helpMenu.classList.remove('show');
                this.openDocsModal();
            });
        }

        // Show About modal
        if (aboutBtn) {
            aboutBtn.addEventListener('click', () => {
                helpMenu.classList.remove('show');
                aboutModal.classList.add('show');
            });
        }

        // Close docs modal
        if (docsModalClose) {
            docsModalClose.addEventListener('click', () => {
                docsModal.classList.remove('show');
            });
        }

        // Close about modal
        if (aboutModalClose) {
            aboutModalClose.addEventListener('click', () => {
                aboutModal.classList.remove('show');
            });
        }

        if (aboutCloseBtn) {
            aboutCloseBtn.addEventListener('click', () => {
                aboutModal.classList.remove('show');
            });
        }

        // Backdrop click for modals
        if (docsModal) {
            docsModal.addEventListener('click', (e) => {
                if (e.target === docsModal) {
                    docsModal.classList.remove('show');
                }
            });
        }

        if (aboutModal) {
            aboutModal.addEventListener('click', (e) => {
                if (e.target === aboutModal) {
                    aboutModal.classList.remove('show');
                }
            });
        }

        // Documentation navigation
        document.querySelectorAll('.docs-nav-header').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.showDocsSection(section);
            });
        });

        // Search functionality
        if (docsSearchInput) {
            docsSearchInput.addEventListener('input', (e) => {
                this.searchDocs(e.target.value);
            });
        }

        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!helpBtn.contains(e.target) && !helpMenu.contains(e.target)) {
                helpMenu.classList.remove('show');
            }
        });
    }

    openDocsModal() {
        const docsModal = document.getElementById('docsModal');
        this.populateDocsContent();
        this.showDocsSection('getting-started');
        document.getElementById('docsSearchInput').value = '';
        docsModal.classList.add('show');
    }

    showDocsSection(sectionId) {
        // Update nav
        document.querySelectorAll('.docs-nav-header').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        // Update content
        document.querySelectorAll('.docs-section').forEach(section => {
            section.classList.toggle('active', section.id === `docs-${sectionId}`);
        });
    }

    getDocsContent() {
        return {
            'getting-started': {
                title: 'Getting Started',
                icon: 'fa-rocket',
                intro: 'Welcome to the Safe Text Editor! This guide will help you get started with creating and editing documents.',
                subsections: [
                    {
                        title: 'Creating Your First Document',
                        icon: 'fa-file-plus',
                        content: `
                            <p>When you first open the editor, you'll see a blank document ready for editing. Simply click in the editor area and start typing!</p>
                            <div class="docs-steps">
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Start Typing</h4>
                                        <p>Click anywhere in the main editor area and begin typing your content.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Name Your Document</h4>
                                        <p>Click on "Untitled Document" at the top left to give your document a meaningful name.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Save Your Work</h4>
                                        <p>Press <span class="docs-key">Ctrl</span> + <span class="docs-key">S</span> or click the Save button to save your document.</p>
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: 'Interface Overview',
                        icon: 'fa-desktop',
                        content: `
                            <p>The editor interface is divided into several key areas:</p>
                            <div class="docs-feature-grid">
                                <div class="docs-feature-item">
                                    <i class="fas fa-bars"></i>
                                    <span><strong>Header Bar</strong> - Contains menus, document title, and main actions</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-folder-open"></i>
                                    <span><strong>Document Sidebar</strong> - Lists your saved documents, folders, and auto-saves</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-tools"></i>
                                    <span><strong>Toolbar</strong> - Formatting buttons for text styling</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-edit"></i>
                                    <span><strong>Editor Area</strong> - Where you write and edit your content</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-info-circle"></i>
                                    <span><strong>Status Bar</strong> - Shows word count, character count, and reading time</span>
                                </div>
                            </div>
                        `
                    }
                ]
            },
            'editor-basics': {
                title: 'Editor Basics',
                icon: 'fa-edit',
                intro: 'Learn the fundamental features of the editor to boost your productivity.',
                subsections: [
                    {
                        title: 'Selecting Text',
                        icon: 'fa-i-cursor',
                        content: `
                            <p>To format text, you first need to select it:</p>
                            <ul>
                                <li><strong>Click and drag</strong> - Click at the start of the text, hold, and drag to the end</li>
                                <li><strong>Double-click</strong> - Select a single word</li>
                                <li><strong>Triple-click</strong> - Select an entire paragraph</li>
                                <li><strong>Ctrl + A</strong> - Select all text in the document</li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Pro Tip</div>
                                <p>Hold <span class="docs-key">Shift</span> while clicking to extend your selection from the cursor to the click point.</p>
                            </div>
                        `
                    },
                    {
                        title: 'Copy, Cut, and Paste',
                        icon: 'fa-clipboard',
                        content: `
                            <p>Move and duplicate content using these essential shortcuts:</p>
                            <table class="docs-table">
                                <tr>
                                    <th>Action</th>
                                    <th>Shortcut</th>
                                    <th>Description</th>
                                </tr>
                                <tr>
                                    <td>Copy</td>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">C</span></td>
                                    <td>Copy selected text to clipboard</td>
                                </tr>
                                <tr>
                                    <td>Cut</td>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">X</span></td>
                                    <td>Cut selected text to clipboard</td>
                                </tr>
                                <tr>
                                    <td>Paste</td>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">V</span></td>
                                    <td>Paste content from clipboard</td>
                                </tr>
                            </table>
                        `
                    },
                    {
                        title: 'Undo and Redo',
                        icon: 'fa-undo',
                        content: `
                            <p>Made a mistake? No problem! Use undo and redo to navigate through your edit history:</p>
                            <ul>
                                <li><strong>Undo</strong>: <span class="docs-key">Ctrl</span> + <span class="docs-key">Z</span> - Reverses your last action</li>
                                <li><strong>Redo</strong>: <span class="docs-key">Ctrl</span> + <span class="docs-key">Y</span> - Restores what you just undid</li>
                            </ul>
                            <p>You can also use the Undo and Redo buttons in the toolbar, or find them in the <strong>Edit</strong> menu.</p>
                        `
                    }
                ]
            },
            'formatting': {
                title: 'Text Formatting',
                icon: 'fa-font',
                intro: 'Transform your plain text into beautifully formatted documents using these formatting tools.',
                subsections: [
                    {
                        title: 'Basic Text Styles',
                        icon: 'fa-bold',
                        content: `
                            <p>Apply basic formatting to make your text stand out:</p>
                            <table class="docs-table">
                                <tr>
                                    <th>Style</th>
                                    <th>Shortcut</th>
                                    <th>Toolbar Button</th>
                                </tr>
                                <tr>
                                    <td><strong>Bold</strong></td>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">B</span></td>
                                    <td><i class="fas fa-bold"></i></td>
                                </tr>
                                <tr>
                                    <td><em>Italic</em></td>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">I</span></td>
                                    <td><i class="fas fa-italic"></i></td>
                                </tr>
                                <tr>
                                    <td><u>Underline</u></td>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">U</span></td>
                                    <td><i class="fas fa-underline"></i></td>
                                </tr>
                                <tr>
                                    <td><s>Strikethrough</s></td>
                                    <td>—</td>
                                    <td><i class="fas fa-strikethrough"></i></td>
                                </tr>
                                <tr>
                                    <td>Subscript</td>
                                    <td>—</td>
                                    <td><i class="fas fa-subscript"></i></td>
                                </tr>
                                <tr>
                                    <td>Superscript</td>
                                    <td>—</td>
                                    <td><i class="fas fa-superscript"></i></td>
                                </tr>
                            </table>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Note</div>
                                <p>Subscript and Superscript are disabled by default. Enable them in <strong>View → Customize Toolbar</strong>.</p>
                            </div>
                        `
                    },
                    {
                        title: 'Paragraph Formats',
                        icon: 'fa-heading',
                        content: `
                            <p>Use the format dropdown to change paragraph styles:</p>
                            <ul>
                                <li><strong>Headings (H1-H4)</strong> - Create document structure with hierarchical headings</li>
                                <li><strong>Paragraph</strong> - Normal body text</li>
                                <li><strong>Blockquote</strong> - Indented quote with left border</li>
                                <li><strong>Code</strong> - Monospace font for code snippets</li>
                            </ul>
                            <p>Select the text and choose the format from the dropdown, or use the format dropdown before typing.</p>
                        `
                    },
                    {
                        title: 'Font & Size',
                        icon: 'fa-text-height',
                        content: `
                            <p>Customize the appearance of your text:</p>
                            <ul>
                                <li><strong>Font Family</strong> - Choose from Arial, Georgia, Times New Roman, Courier New, Verdana, and more</li>
                                <li><strong>Font Size</strong> - Select sizes from 8pt to 36pt</li>
                            </ul>
                            <p>Select text first, then choose from the dropdowns in the toolbar.</p>
                        `
                    },
                    {
                        title: 'Colors',
                        icon: 'fa-palette',
                        content: `
                            <p>Add color to your documents:</p>
                            <ul>
                                <li><strong>Text Color</strong> - Change the color of selected text using the <i class="fas fa-font"></i> color picker</li>
                                <li><strong>Highlight Color</strong> - Add a background highlight using the <i class="fas fa-highlighter"></i> color picker</li>
                            </ul>
                            <p>Click the color picker button, choose a color, and apply it to your selected text.</p>
                        `
                    },
                    {
                        title: 'Alignment',
                        icon: 'fa-align-left',
                        content: `
                            <p>Control text alignment for better presentation:</p>
                            <div class="docs-feature-grid">
                                <div class="docs-feature-item">
                                    <i class="fas fa-align-left"></i>
                                    <span><strong>Left</strong> - Align to left margin (default)</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-align-center"></i>
                                    <span><strong>Center</strong> - Center text horizontally</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-align-right"></i>
                                    <span><strong>Right</strong> - Align to right margin</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-align-justify"></i>
                                    <span><strong>Justify</strong> - Stretch to fill full width</span>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: 'Lists',
                        icon: 'fa-list',
                        content: `
                            <p>Organize information with lists:</p>
                            <ul>
                                <li><strong>Bullet List</strong> <i class="fas fa-list-ul"></i> - Unordered list with bullet points</li>
                                <li><strong>Numbered List</strong> <i class="fas fa-list-ol"></i> - Ordered list with numbers</li>
                            </ul>
                            <p>You can also use:</p>
                            <ul>
                                <li><strong>Increase Indent</strong> <i class="fas fa-indent"></i> - Nest items deeper</li>
                                <li><strong>Decrease Indent</strong> <i class="fas fa-outdent"></i> - Move items back out</li>
                            </ul>
                        `
                    }
                ]
            },
            'documents': {
                title: 'Documents & Saving',
                icon: 'fa-file-alt',
                intro: 'Learn how to manage your documents effectively.',
                subsections: [
                    {
                        title: 'Saving Documents',
                        icon: 'fa-save',
                        content: `
                            <p>Save your work to avoid losing changes:</p>
                            <ul>
                                <li><strong>Quick Save</strong>: Press <span class="docs-key">Ctrl</span> + <span class="docs-key">S</span></li>
                                <li><strong>Save Button</strong>: Click the Save button in the header</li>
                                <li><strong>File Menu</strong>: Go to File → Save Document</li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Pro Tip</div>
                                <p>Enable Auto-Save in Settings to automatically save your work at regular intervals!</p>
                            </div>
                        `
                    },
                    {
                        title: 'Opening Documents',
                        icon: 'fa-folder-open',
                        content: `
                            <p>Access your saved documents from the sidebar:</p>
                            <div class="docs-steps">
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Find Your Document</h4>
                                        <p>Look in the "Saved Documents" section of the sidebar.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Click to Open</h4>
                                        <p>Click on the document name to load it into the editor.</p>
                                    </div>
                                </div>
                            </div>
                            <p>The current document will be highlighted in the sidebar.</p>
                        `
                    },
                    {
                        title: 'Creating New Documents',
                        icon: 'fa-file-plus',
                        content: `
                            <p>Start fresh with a new document:</p>
                            <ul>
                                <li>Click the <strong>New Document</strong> button in the header</li>
                                <li>Or go to <strong>File → New Document</strong></li>
                            </ul>
                            <div class="docs-warning">
                                <div class="docs-warning-header"><i class="fas fa-exclamation-triangle"></i> Warning</div>
                                <p>Make sure to save your current document before creating a new one!</p>
                            </div>
                        `
                    },
                    {
                        title: 'Deleting Documents',
                        icon: 'fa-trash',
                        content: `
                            <p>Remove documents you no longer need:</p>
                            <ul>
                                <li>Hover over a document in the sidebar</li>
                                <li>Click the <i class="fas fa-times"></i> delete button that appears</li>
                                <li>Or right-click and select "Delete"</li>
                            </ul>
                            <div class="docs-warning">
                                <div class="docs-warning-header"><i class="fas fa-exclamation-triangle"></i> Warning</div>
                                <p>Deleted documents cannot be recovered!</p>
                            </div>
                        `
                    }
                ]
            },
            'autosave': {
                title: 'Auto-Save',
                icon: 'fa-clock',
                intro: 'Never lose your work again with the powerful auto-save feature.',
                subsections: [
                    {
                        title: 'Enabling Auto-Save',
                        icon: 'fa-toggle-on',
                        content: `
                            <p>Turn on auto-save to automatically save your work:</p>
                            <div class="docs-steps">
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Open Settings Menu</h4>
                                        <p>Click on <strong>Settings</strong> in the header bar.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Toggle Auto-Save</h4>
                                        <p>Click on "Auto Save" to enable or disable the feature.</p>
                                    </div>
                                </div>
                            </div>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Note</div>
                                <p>Auto-save is enabled by default for your convenience.</p>
                            </div>
                        `
                    },
                    {
                        title: 'Configuring Auto-Save',
                        icon: 'fa-sliders-h',
                        content: `
                            <p>Customize auto-save behavior in Advanced Settings:</p>
                            <ul>
                                <li><strong>Interval</strong> - Set how often auto-save triggers (time, words, or characters)</li>
                                <li><strong>Auto-Save Limit</strong> - Maximum number of auto-saves to keep (default: 3)</li>
                                <li><strong>Auto-Delete</strong> - Automatically delete old auto-saves after X days</li>
                            </ul>
                            <p>Access these options via <strong>Settings → Advanced Settings</strong>.</p>
                        `
                    },
                    {
                        title: 'Auto-Save vs Manual Save',
                        icon: 'fa-exchange-alt',
                        content: `
                            <p>Understanding the difference:</p>
                            <table class="docs-table">
                                <tr>
                                    <th>Feature</th>
                                    <th>Auto-Save</th>
                                    <th>Manual Save</th>
                                </tr>
                                <tr>
                                    <td>Location</td>
                                    <td>Auto-Saved Documents section</td>
                                    <td>Saved Documents section</td>
                                </tr>
                                <tr>
                                    <td>Retention</td>
                                    <td>Limited by auto-save count</td>
                                    <td>Kept until manually deleted</td>
                                </tr>
                                <tr>
                                    <td>Auto-Delete</td>
                                    <td>Can be auto-deleted</td>
                                    <td>Never auto-deleted</td>
                                </tr>
                            </table>
                            <p>When you manually save an auto-saved document, it's promoted to the Saved Documents section.</p>
                        `
                    }
                ]
            },
            'flags': {
                title: 'Document Flags',
                icon: 'fa-flag',
                intro: 'Organize and prioritize your documents with color-coded flags.',
                subsections: [
                    {
                        title: 'Built-in Flags',
                        icon: 'fa-palette',
                        content: `
                            <p>Use these preset flags to categorize your documents:</p>
                            <div class="docs-feature-grid">
                                <div class="docs-feature-item">
                                    <span style="color:#ef4444"><i class="fas fa-flag"></i></span>
                                    <span><strong>Red - Urgent</strong><br>Requires immediate attention</span>
                                </div>
                                <div class="docs-feature-item">
                                    <span style="color:#f97316"><i class="fas fa-flag"></i></span>
                                    <span><strong>Orange - Important</strong><br>High priority item</span>
                                </div>
                                <div class="docs-feature-item">
                                    <span style="color:#eab308"><i class="fas fa-flag"></i></span>
                                    <span><strong>Yellow - Review</strong><br>Needs to be checked</span>
                                </div>
                                <div class="docs-feature-item">
                                    <span style="color:#22c55e"><i class="fas fa-flag"></i></span>
                                    <span><strong>Green - Complete</strong><br>Finished and ready</span>
                                </div>
                                <div class="docs-feature-item">
                                    <span style="color:#3b82f6"><i class="fas fa-flag"></i></span>
                                    <span><strong>Blue - In Progress</strong><br>Currently being worked on</span>
                                </div>
                                <div class="docs-feature-item">
                                    <span style="color:#a855f7"><i class="fas fa-flag"></i></span>
                                    <span><strong>Purple - Ideas</strong><br>Brainstorming or concepts</span>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: 'Setting a Flag',
                        icon: 'fa-mouse-pointer',
                        content: `
                            <p>Apply a flag to your current document:</p>
                            <div class="docs-steps">
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Open View Menu</h4>
                                        <p>Click on <strong>View</strong> in the header bar.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Hover Over Flags</h4>
                                        <p>Hover over "Flags" to see the submenu.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Select a Flag</h4>
                                        <p>Click on the desired flag color to apply it.</p>
                                    </div>
                                </div>
                            </div>
                            <p>When a flag is set, a colored border appears around the editor.</p>
                        `
                    },
                    {
                        title: 'Custom Flags',
                        icon: 'fa-plus-circle',
                        content: `
                            <p>Create your own flags with custom colors and names:</p>
                            <ul>
                                <li>Go to <strong>View → Flags → Add Custom Flag</strong></li>
                                <li>Enter a name for your flag (max 30 characters)</li>
                                <li>Choose a color from presets or use the custom color picker</li>
                                <li>Add a description (shown in tooltips, max 100 characters)</li>
                                <li>Click <strong>Create Flag</strong></li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Tip</div>
                                <p>Hover over any flag to see its description in a tooltip!</p>
                            </div>
                        `
                    },
                    {
                        title: 'Flag Border Settings',
                        icon: 'fa-border-style',
                        content: `
                            <p>Customize the flag border appearance:</p>
                            <ul>
                                <li><strong>Toggle Border</strong> - Enable or disable the colored border around the editor</li>
                                <li><strong>Border Width</strong> - Adjust thickness from 1px to 10px</li>
                            </ul>
                            <p>Find these settings in <strong>Settings → Advanced Settings → Document Flags</strong>.</p>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Note</div>
                                <p>Even if the border is disabled, the flag name will still show in the status bar (if enabled in Customize Editor).</p>
                            </div>
                        `
                    }
                ]
            },
            'themes': {
                title: 'Themes & Appearance',
                icon: 'fa-palette',
                intro: 'Customize the look and feel of the editor to match your preferences.',
                subsections: [
                    {
                        title: 'Light / Theme / Dark Mode',
                        icon: 'fa-sun',
                        content: `
                            <p>Switch between display modes using the toggle in the header:</p>
                            <div class="docs-feature-grid">
                                <div class="docs-feature-item">
                                    <i class="fas fa-sun"></i>
                                    <span><strong>Light Mode</strong><br>Bright interface, easy on eyes during the day</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-palette"></i>
                                    <span><strong>Theme Mode</strong><br>Uses your selected color theme</span>
                                </div>
                                <div class="docs-feature-item">
                                    <i class="fas fa-moon"></i>
                                    <span><strong>Dark Mode</strong><br>Dark interface, reduces eye strain at night</span>
                                </div>
                            </div>
                            <p>Click on the icons in the toggle to switch modes.</p>
                        `
                    },
                    {
                        title: 'Selecting a Theme',
                        icon: 'fa-swatchbook',
                        content: `
                            <p>Choose from a variety of beautiful themes:</p>
                            <div class="docs-steps">
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Open Theme Modal</h4>
                                        <p>Go to <strong>View → Theme</strong>.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Browse Themes</h4>
                                        <p>View basic themes or switch to the "Animated" tab for dynamic themes.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Preview & Save</h4>
                                        <p>Click a theme to preview it live. Click "Save" to keep your selection.</p>
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: 'Animated Themes',
                        icon: 'fa-magic',
                        content: `
                            <p>Experience dynamic, animated themes:</p>
                            <ul>
                                <li><strong>Aurora</strong> - Northern lights effect</li>
                                <li><strong>Ocean Wave</strong> - Flowing water animations</li>
                                <li><strong>Sunset Glow</strong> - Warm gradient transitions</li>
                                <li><strong>Neon Pulse</strong> - Cyberpunk-style glowing effects</li>
                                <li><strong>Galaxy</strong> - Twinkling stars in space</li>
                                <li><strong>Forest</strong> - Nature-inspired with sunbeams</li>
                                <li><strong>Candy Swirl</strong> - Playful pink gradients</li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Customization</div>
                                <p>Right-click any animated theme to customize its animation speed, intensity, and other effects!</p>
                            </div>
                        `
                    }
                ]
            },
            'toolbar': {
                title: 'Toolbar Customization',
                icon: 'fa-tools',
                intro: 'Show or hide toolbar buttons to create your perfect editing environment.',
                subsections: [
                    {
                        title: 'Customizing the Toolbar',
                        icon: 'fa-cog',
                        content: `
                            <p>Access toolbar customization:</p>
                            <ul>
                                <li>Go to <strong>View → Customize Toolbar</strong></li>
                                <li>Toggle individual tools on or off</li>
                                <li>Use "Toggle All" to enable/disable everything at once</li>
                                <li>Click "Save" to apply changes</li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Tip</div>
                                <p>Some tools like Subscript and Superscript are disabled by default. Enable them here if needed!</p>
                            </div>
                        `
                    },
                    {
                        title: 'Available Tools',
                        icon: 'fa-th-list',
                        content: `
                            <p>Tools you can enable or disable:</p>
                            <ul>
                                <li><strong>History</strong>: Undo, Redo</li>
                                <li><strong>Text Formatting</strong>: Bold, Italic, Underline, Strikethrough, Subscript, Superscript</li>
                                <li><strong>Paragraph</strong>: Format, Font Family, Font Size</li>
                                <li><strong>Colors</strong>: Text Color, Highlight Color</li>
                                <li><strong>Alignment</strong>: Left, Center, Right, Justify</li>
                                <li><strong>Lists</strong>: Bullet List, Numbered List, Indent, Outdent</li>
                                <li><strong>Insert</strong>: Link, Image, Table, Horizontal Line</li>
                                <li><strong>Utility</strong>: Clear Formatting, Spell Check</li>
                            </ul>
                        `
                    }
                ]
            },
            'spellcheck': {
                title: 'Spell Check & Autocorrect',
                icon: 'fa-spell-check',
                intro: 'Catch typos and improve your writing with built-in spelling tools.',
                subsections: [
                    {
                        title: 'Enabling Spell Check',
                        icon: 'fa-toggle-on',
                        content: `
                            <p>Turn on spell checking:</p>
                            <ul>
                                <li>Click the <i class="fas fa-spell-check"></i> button in the toolbar</li>
                                <li>Open the dropdown to access spell check options</li>
                                <li>Toggle "Spell Check" to enable/disable</li>
                            </ul>
                            <p>Misspelled words will be underlined in red.</p>
                        `
                    },
                    {
                        title: 'Autocorrect',
                        icon: 'fa-magic',
                        content: `
                            <p>Automatically fix common typos:</p>
                            <ul>
                                <li>Enable "Auto-Correct" in the spell check dropdown</li>
                                <li>Common mistakes are fixed as you type</li>
                                <li>A popup shows corrections - click ✓ to accept or ✕ to dismiss</li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Built-in Rules</div>
                                <p>Common corrections include: teh → the, dont → don't, cant → can't, and many more!</p>
                            </div>
                        `
                    },
                    {
                        title: 'Custom Dictionary',
                        icon: 'fa-book',
                        content: `
                            <p>Manage your personal dictionary and autocorrect rules:</p>
                            <ul>
                                <li>Click "Manage Dictionary" in the spell check dropdown</li>
                                <li>Add words to your custom dictionary</li>
                                <li>Create custom autocorrect rules (e.g., "btw" → "by the way")</li>
                                <li>Remove entries you no longer need</li>
                            </ul>
                        `
                    }
                ]
            },
            'folders': {
                title: 'Folders & Organization',
                icon: 'fa-folder',
                intro: 'Keep your documents organized with folders.',
                subsections: [
                    {
                        title: 'Creating Folders',
                        icon: 'fa-folder-plus',
                        content: `
                            <p>Create folders to organize your documents:</p>
                            <div class="docs-steps">
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Click the + Button</h4>
                                        <p>In the sidebar header, click the <i class="fas fa-plus"></i> button.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Select "New Folder"</h4>
                                        <p>Choose "New Folder" from the context menu.</p>
                                    </div>
                                </div>
                                <div class="docs-step">
                                    <div class="docs-step-number"></div>
                                    <div class="docs-step-content">
                                        <h4>Name Your Folder</h4>
                                        <p>Enter a name and click "Create".</p>
                                    </div>
                                </div>
                            </div>
                        `
                    },
                    {
                        title: 'Moving Documents to Folders',
                        icon: 'fa-arrows-alt',
                        content: `
                            <p>Move documents into folders:</p>
                            <ul>
                                <li>Right-click on a document in the sidebar</li>
                                <li>Select "Move To..."</li>
                                <li>Choose the destination folder</li>
                            </ul>
                            <p>Documents in folders won't appear in the main document list.</p>
                        `
                    },
                    {
                        title: 'Opening Folders',
                        icon: 'fa-folder-open',
                        content: `
                            <p>Access documents inside folders:</p>
                            <ul>
                                <li>Double-click on a folder to open it</li>
                                <li>The sidebar shows only documents in that folder</li>
                                <li>Click the "Back" button to return to the main view</li>
                            </ul>
                        `
                    }
                ]
            },
            'advanced': {
                title: 'Advanced Settings',
                icon: 'fa-cog',
                intro: 'Fine-tune the editor with advanced configuration options.',
                subsections: [
                    {
                        title: 'Accessing Advanced Settings',
                        icon: 'fa-sliders-h',
                        content: `
                            <p>Open the Advanced Settings modal:</p>
                            <ul>
                                <li>Go to <strong>Settings → Advanced Settings</strong></li>
                            </ul>
                            <p>Here you'll find detailed configuration for auto-save, flags, notifications, and more.</p>
                        `
                    },
                    {
                        title: 'Modal Behavior',
                        icon: 'fa-window-restore',
                        content: `
                            <p>Customize how modals behave:</p>
                            <ul>
                                <li><strong>Click Outside Action</strong> - What happens when you click outside a modal:
                                    <ul>
                                        <li>Do Nothing</li>
                                        <li>Close and Cancel</li>
                                        <li>Close and Save</li>
                                    </ul>
                                </li>
                                <li><strong>Save Behavior</strong> - Whether clicking "Save" also closes the modal</li>
                            </ul>
                        `
                    },
                    {
                        title: 'Default Load Action',
                        icon: 'fa-play',
                        content: `
                            <p>Choose what happens when you open the editor:</p>
                            <ul>
                                <li><strong>Load New Document</strong> - Start with a blank document</li>
                                <li><strong>Load Last Saved</strong> - Open your most recent saved document</li>
                                <li><strong>Load Last Auto-Save</strong> - Open your most recent auto-save</li>
                                <li><strong>Show Warnings</strong> - Show any auto-saves about to be deleted</li>
                                <li><strong>Do Nothing</strong> - Show only the header (clean state)</li>
                            </ul>
                        `
                    },
                    {
                        title: 'Toast Notifications',
                        icon: 'fa-bell',
                        content: `
                            <p>Control how notifications appear and behave:</p>
                            <ul>
                                <li>Click "Toast Settings" in Advanced Settings</li>
                                <li><strong>Master Toggle</strong> - Enable/disable all notifications</li>
                                <li><strong>Individual Types</strong> - Toggle specific notification categories</li>
                                <li><strong>Duration</strong> - Set how long toasts stay visible (1-10 seconds)</li>
                                <li><strong>Position</strong> - Choose where toasts appear:
                                    <ul>
                                        <li>Top Right, Top Left</li>
                                        <li>Bottom Right, Bottom Left</li>
                                    </ul>
                                </li>
                                <li><strong>Behavior</strong> - How multiple notifications are handled:
                                    <ul>
                                        <li><strong>Stack</strong> - Multiple toasts visible, stacked vertically</li>
                                        <li><strong>Replace</strong> - New toast instantly replaces the current one</li>
                                        <li><strong>Queue</strong> - One at a time, others wait in line</li>
                                    </ul>
                                </li>
                            </ul>
                            <div class="docs-tip">
                                <div class="docs-tip-header"><i class="fas fa-lightbulb"></i> Tip</div>
                                <p>Use the "Test Notification" button to preview your settings!</p>
                            </div>
                        `
                    },
                    {
                        title: 'Reset to Defaults',
                        icon: 'fa-undo-alt',
                        content: `
                            <p>Start fresh by resetting all data:</p>
                            <ul>
                                <li>Click the <i class="fas fa-undo-alt"></i> Reset button in the header</li>
                                <li>Review what will be deleted</li>
                                <li>Click "Learn More" to see the full list of affected data</li>
                                <li>Confirm to reset everything</li>
                            </ul>
                            <div class="docs-warning">
                                <div class="docs-warning-header"><i class="fas fa-exclamation-triangle"></i> Warning</div>
                                <p>This action cannot be undone! All documents, settings, and customizations will be lost.</p>
                            </div>
                        `
                    }
                ]
            },
            'shortcuts': {
                title: 'Keyboard Shortcuts',
                icon: 'fa-keyboard',
                intro: 'Speed up your workflow with these keyboard shortcuts.',
                subsections: [
                    {
                        title: 'Essential Shortcuts',
                        icon: 'fa-star',
                        content: `
                            <table class="docs-table">
                                <tr>
                                    <th>Shortcut</th>
                                    <th>Action</th>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">S</span></td>
                                    <td>Save document</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">Z</span></td>
                                    <td>Undo</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">Y</span></td>
                                    <td>Redo</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">A</span></td>
                                    <td>Select all</td>
                                </tr>
                            </table>
                        `
                    },
                    {
                        title: 'Formatting Shortcuts',
                        icon: 'fa-font',
                        content: `
                            <table class="docs-table">
                                <tr>
                                    <th>Shortcut</th>
                                    <th>Action</th>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">B</span></td>
                                    <td>Bold</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">I</span></td>
                                    <td>Italic</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">U</span></td>
                                    <td>Underline</td>
                                </tr>
                            </table>
                        `
                    },
                    {
                        title: 'Clipboard Shortcuts',
                        icon: 'fa-clipboard',
                        content: `
                            <table class="docs-table">
                                <tr>
                                    <th>Shortcut</th>
                                    <th>Action</th>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">C</span></td>
                                    <td>Copy</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">X</span></td>
                                    <td>Cut</td>
                                </tr>
                                <tr>
                                    <td><span class="docs-key">Ctrl</span> + <span class="docs-key">V</span></td>
                                    <td>Paste</td>
                                </tr>
                            </table>
                        `
                    }
                ]
            }
        };
    }

    populateDocsContent() {
        const content = document.getElementById('docsContent');
        const docsData = this.getDocsContent();

        let html = '';
        for (const [sectionId, section] of Object.entries(docsData)) {
            html += `
                <div class="docs-section" id="docs-${sectionId}">
                    <h2><i class="fas ${section.icon}"></i> ${section.title}</h2>
                    <p class="docs-section-intro">${section.intro}</p>
            `;

            for (const subsection of section.subsections) {
                html += `
                    <div class="docs-subsection">
                        <h3><i class="fas ${subsection.icon}"></i> ${subsection.title}</h3>
                        ${subsection.content}
                    </div>
                `;
            }

            html += '</div>';
        }

        content.innerHTML = html;
    }

    searchDocs(query) {
        const docsContent = document.getElementById('docsContent');
        const docsData = this.getDocsContent();

        if (!query.trim()) {
            // Show default section
            this.populateDocsContent();
            this.showDocsSection('getting-started');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        // Search through all documentation
        for (const [sectionId, section] of Object.entries(docsData)) {
            for (const subsection of section.subsections) {
                const titleMatch = subsection.title.toLowerCase().includes(lowerQuery);
                const contentMatch = subsection.content.toLowerCase().includes(lowerQuery);

                if (titleMatch || contentMatch) {
                    // Extract preview text
                    let preview = '';
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = subsection.content;
                    const text = tempDiv.textContent || tempDiv.innerText;
                    const index = text.toLowerCase().indexOf(lowerQuery);
                    if (index > -1) {
                        const start = Math.max(0, index - 40);
                        const end = Math.min(text.length, index + query.length + 60);
                        preview = (start > 0 ? '...' : '') +
                                  text.slice(start, end).replace(
                                      new RegExp(query, 'gi'),
                                      match => `<mark>${match}</mark>`
                                  ) +
                                  (end < text.length ? '...' : '');
                    }

                    results.push({
                        sectionId,
                        sectionTitle: section.title,
                        title: subsection.title,
                        preview
                    });
                }
            }
        }

        // Display results
        if (results.length > 0) {
            let html = `<div class="docs-search-results">
                <h3>Found ${results.length} result${results.length > 1 ? 's' : ''} for "${query}"</h3>`;

            for (const result of results) {
                html += `
                    <div class="docs-search-result" data-section="${result.sectionId}">
                        <div class="docs-search-result-title">${result.title}</div>
                        <div class="docs-search-result-section"><i class="fas fa-folder"></i> ${result.sectionTitle}</div>
                        <div class="docs-search-result-preview">${result.preview}</div>
                    </div>
                `;
            }

            html += '</div>';
            docsContent.innerHTML = html;

            // Add click handlers
            docsContent.querySelectorAll('.docs-search-result').forEach(el => {
                el.addEventListener('click', () => {
                    document.getElementById('docsSearchInput').value = '';
                    this.populateDocsContent();
                    this.showDocsSection(el.dataset.section);
                });
            });
        } else {
            docsContent.innerHTML = `
                <div class="docs-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
        }

        // Deselect all nav items
        document.querySelectorAll('.docs-nav-header').forEach(btn => {
            btn.classList.remove('active');
        });
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

    // ==================== Edit Menu ====================

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

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!editMenuBtn.contains(e.target) && !editMenu.contains(e.target)) {
                editMenu.classList.remove('show');
            }
        });
    }

    // ==================== View Menu Flags ====================

    initViewMenuFlags() {
        const viewMenu = document.getElementById('viewMenu');

        // Flag buttons in View menu submenu (built-in flags)
        this.bindFlagItemEvents();

        // Add Custom Flag button
        const addCustomFlagBtn = document.getElementById('addCustomFlagBtn');
        if (addCustomFlagBtn) {
            addCustomFlagBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                viewMenu.classList.remove('show');
                this.openFlagCreatorModal();
            });
        }
    }

    bindFlagItemEvents() {
        const viewMenu = document.getElementById('viewMenu');

        document.querySelectorAll('.flag-item').forEach(item => {
            // Remove existing listeners by cloning
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const flag = newItem.dataset.flag;
                this.setDocumentFlag(flag);
                viewMenu.classList.remove('show');
            });
        });
    }

    // ==================== Flag Tooltips ====================

    initFlagTooltips() {
        const tooltip = document.getElementById('flagTooltip');
        if (!tooltip) return;

        // Use event delegation for flag items
        document.addEventListener('mouseover', (e) => {
            const flagItem = e.target.closest('.flag-item');
            if (flagItem && flagItem.dataset.description) {
                this.showFlagTooltip(flagItem, flagItem.dataset.description);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const flagItem = e.target.closest('.flag-item');
            if (flagItem) {
                this.hideFlagTooltip();
            }
        });
    }

    showFlagTooltip(element, description) {
        const tooltip = document.getElementById('flagTooltip');
        const tooltipText = document.getElementById('flagTooltipText');
        if (!tooltip || !tooltipText) return;

        // Cap at 100 characters
        tooltipText.textContent = description.substring(0, 100);

        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

        tooltip.classList.add('show');
    }

    hideFlagTooltip() {
        const tooltip = document.getElementById('flagTooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    // ==================== Custom Flag Creator ====================

    loadCustomFlags() {
        const saved = localStorage.getItem('wysiwyg_custom_flags');
        return saved ? JSON.parse(saved) : [];
    }

    saveCustomFlags() {
        localStorage.setItem('wysiwyg_custom_flags', JSON.stringify(this.customFlags));
    }

    initCustomFlagCreator() {
        const modal = document.getElementById('flagCreatorModal');
        const closeBtn = document.getElementById('flagCreatorClose');
        const cancelBtn = document.getElementById('flagCreatorCancelBtn');
        const saveBtn = document.getElementById('flagCreatorSaveBtn');
        const nameInput = document.getElementById('customFlagName');
        const descInput = document.getElementById('customFlagDescription');
        const colorPicker = document.getElementById('customFlagColorPicker');
        const charCounter = document.getElementById('flagDescCharCount');

        // Close button (X)
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.handleFlagCreatorClose());
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleFlagCreatorClose());
        }

        // Save button
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCustomFlag());
        }

        // Color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
                preset.classList.add('selected');
                this.updateFlagPreview();
            });
        });

        // Custom color picker
        if (colorPicker) {
            colorPicker.addEventListener('input', () => {
                document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
                this.updateFlagPreview();
            });
        }

        // Name input - update preview
        if (nameInput) {
            nameInput.addEventListener('input', () => this.updateFlagPreview());
        }

        // Description input - character counter
        if (descInput && charCounter) {
            descInput.addEventListener('input', () => {
                const remaining = 100 - descInput.value.length;
                charCounter.textContent = remaining;

                const counterWrapper = charCounter.parentElement;
                counterWrapper.classList.remove('warning', 'danger');
                if (remaining <= 10) {
                    counterWrapper.classList.add('danger');
                } else if (remaining <= 30) {
                    counterWrapper.classList.add('warning');
                }
            });
        }

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.handleModalClickOutside(
                        'flagCreatorModal',
                        () => this.saveCustomFlag(),
                        () => this.handleFlagCreatorClose()
                    );
                }
            });
        }
    }

    openFlagCreatorModal() {
        // Store original state for change detection
        this.flagCreatorOriginalState = JSON.stringify({
            name: '',
            color: '#ef4444',
            description: ''
        });

        // Reset form
        document.getElementById('customFlagName').value = '';
        document.getElementById('customFlagDescription').value = '';
        document.getElementById('customFlagColorPicker').value = '#3b82f6';
        document.getElementById('flagDescCharCount').textContent = '100';

        // Reset color presets
        document.querySelectorAll('.color-preset').forEach((p, i) => {
            p.classList.toggle('selected', i === 0);
        });

        // Reset char counter styling
        document.getElementById('flagDescCharCount').parentElement.classList.remove('warning', 'danger');

        // Update preview
        this.updateFlagPreview();

        // Show modal
        document.getElementById('flagCreatorModal').classList.add('show');
    }

    updateFlagPreview() {
        const nameInput = document.getElementById('customFlagName');
        const colorPicker = document.getElementById('customFlagColorPicker');
        const previewColor = document.getElementById('flagPreviewColor');
        const previewName = document.getElementById('flagPreviewName');

        // Get color
        const selectedPreset = document.querySelector('.color-preset.selected');
        const color = selectedPreset ? selectedPreset.dataset.color : colorPicker.value;

        // Update preview
        previewColor.style.background = color;
        previewName.textContent = nameInput.value || 'Custom Flag';
    }

    getSelectedFlagColor() {
        const selectedPreset = document.querySelector('.color-preset.selected');
        if (selectedPreset) {
            return selectedPreset.dataset.color;
        }
        return document.getElementById('customFlagColorPicker').value;
    }

    hasFlagCreatorChanges() {
        const currentState = JSON.stringify({
            name: document.getElementById('customFlagName').value,
            color: this.getSelectedFlagColor(),
            description: document.getElementById('customFlagDescription').value
        });
        return currentState !== this.flagCreatorOriginalState;
    }

    handleFlagCreatorClose() {
        if (this.hasFlagCreatorChanges()) {
            this.showUnsavedChangesWarning(
                'flagCreatorModal',
                () => this.saveCustomFlag(),
                () => this.closeFlagCreatorModal()
            );
        } else {
            this.closeFlagCreatorModal();
        }
    }

    closeFlagCreatorModal() {
        document.getElementById('flagCreatorModal').classList.remove('show');
        this.flagCreatorOriginalState = null;
    }

    saveCustomFlag() {
        const name = document.getElementById('customFlagName').value.trim();
        const description = document.getElementById('customFlagDescription').value.trim();
        const color = this.getSelectedFlagColor();

        // Validate
        if (!name) {
            this.showNotification('Please enter a flag name', 'settings');
            return;
        }

        // Create flag ID from name
        const flagId = 'custom_' + name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();

        // Create custom flag object
        const customFlag = {
            id: flagId,
            name: name,
            color: color,
            description: description || `Custom flag: ${name}`
        };

        // Add to custom flags
        this.customFlags.push(customFlag);
        this.saveCustomFlags();

        // Re-render custom flags in menu
        this.renderCustomFlags();

        // Close modal based on save behavior
        if (this.modalSaveBehavior === 'saveAndClose') {
            this.closeFlagCreatorModal();
        } else {
            // Update original state so it doesn't trigger unsaved warning
            this.flagCreatorOriginalState = JSON.stringify({
                name: name,
                color: color,
                description: description
            });
        }

        this.showNotification(`Flag "${name}" created!`, 'settings');
    }

    renderCustomFlags() {
        const container = document.getElementById('customFlagsContainer');
        if (!container) return;

        if (this.customFlags.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = this.customFlags.map(flag => `
            <button class="dropdown-item flag-item custom-flag" 
                    data-flag="${flag.id}" 
                    data-description="${flag.description.substring(0, 100)}">
                <span class="flag-color" style="background: ${flag.color};"></span> 
                ${flag.name}
                <button class="delete-custom-flag" data-flag-id="${flag.id}" title="Delete flag">
                    <i class="fas fa-times"></i>
                </button>
            </button>
        `).join('');

        // Bind events for custom flags
        this.bindFlagItemEvents();

        // Bind delete buttons
        container.querySelectorAll('.delete-custom-flag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const flagId = btn.dataset.flagId;
                this.deleteCustomFlag(flagId);
            });
        });
    }

    deleteCustomFlag(flagId) {
        const flag = this.customFlags.find(f => f.id === flagId);
        if (!flag) return;

        if (confirm(`Delete the "${flag.name}" flag?`)) {
            this.customFlags = this.customFlags.filter(f => f.id !== flagId);
            this.saveCustomFlags();
            this.renderCustomFlags();
            this.showNotification(`Flag "${flag.name}" deleted`, 'settings');
        }
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

    loadFlagBorderEnabled() {
        const saved = localStorage.getItem('wysiwyg_flag_border_enabled');
        return saved !== null ? saved === 'true' : true; // Default enabled
    }

    saveFlagBorderEnabled() {
        localStorage.setItem('wysiwyg_flag_border_enabled', this.flagBorderEnabled.toString());
    }

    setDocumentFlag(flag) {
        this.currentFlag = flag;
        this.applyFlagToEditor();
        this.updateFlagMenuState();
        this.updateFlagStatusBar();

        // Save flag with current document if saved
        if (this.currentDocId) {
            const doc = this.documents.find(d => d.id === this.currentDocId);
            if (doc) {
                doc.flag = flag;
                this.saveDocuments();
                this.renderDocumentList();
            }
        }

        // Get flag name for notification
        const flagName = this.getFlagDisplayName(flag);
        this.showNotification(`Flag set: ${flagName}`, 'settings');
    }

    getFlagDisplayName(flagId) {
        const builtInFlags = {
            'none': 'No flag',
            'red': 'Red - Urgent',
            'orange': 'Orange - Important',
            'yellow': 'Yellow - Review',
            'green': 'Green - Complete',
            'blue': 'Blue - In Progress',
            'purple': 'Purple - Ideas'
        };

        if (builtInFlags[flagId]) {
            return builtInFlags[flagId];
        }

        // Check custom flags
        const customFlag = this.customFlags.find(f => f.id === flagId);
        if (customFlag) {
            return customFlag.name;
        }

        return flagId;
    }

    getFlagColor(flagId) {
        const builtInColors = {
            'red': '#ef4444',
            'orange': '#f97316',
            'yellow': '#eab308',
            'green': '#22c55e',
            'blue': '#3b82f6',
            'purple': '#a855f7'
        };

        if (builtInColors[flagId]) {
            return builtInColors[flagId];
        }

        // Check custom flags
        const customFlag = this.customFlags.find(f => f.id === flagId);
        if (customFlag) {
            return customFlag.color;
        }

        return '#3b82f6'; // Default blue
    }

    applyFlagToEditor() {
        const editorWrapper = document.querySelector('.editor-wrapper');

        // Remove all flag classes
        editorWrapper.classList.remove('flagged', 'flag-red', 'flag-orange', 'flag-yellow', 'flag-green', 'flag-blue', 'flag-purple', 'flag-custom');
        editorWrapper.style.borderWidth = '';
        editorWrapper.style.borderColor = '';

        // Only show border if flag border is enabled AND there's a flag set
        if (this.flagBorderEnabled && this.currentFlag && this.currentFlag !== 'none') {
            editorWrapper.classList.add('flagged');

            // Check if it's a custom flag
            if (this.currentFlag.startsWith('custom_')) {
                editorWrapper.classList.add('flag-custom');
                const color = this.getFlagColor(this.currentFlag);
                editorWrapper.style.borderColor = color;
            } else {
                editorWrapper.classList.add(`flag-${this.currentFlag}`);
            }
            editorWrapper.style.borderWidth = `${this.flagBorderWidth}px`;
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
        flagStatus.classList.remove('flag-red', 'flag-orange', 'flag-yellow', 'flag-green', 'flag-blue', 'flag-purple', 'flag-custom');
        flagStatus.style.color = '';

        if (this.currentFlag && this.currentFlag !== 'none') {
            const builtInNames = {
                'red': 'Urgent',
                'orange': 'Important',
                'yellow': 'Review',
                'green': 'Complete',
                'blue': 'In Progress',
                'purple': 'Ideas'
            };

            if (builtInNames[this.currentFlag]) {
                flagStatus.textContent = builtInNames[this.currentFlag];
                flagStatus.classList.add(`flag-${this.currentFlag}`);
            } else {
                // Custom flag
                const customFlag = this.customFlags.find(f => f.id === this.currentFlag);
                if (customFlag) {
                    flagStatus.textContent = customFlag.name;
                    flagStatus.style.color = customFlag.color;
                } else {
                    flagStatus.textContent = '';
                }
            }
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

        // Update reading time
        this.updateReadingTime(words);
    }

    updateReadingTime(wordCount = null) {
        if (wordCount === null) {
            const text = this.editor.innerText || '';
            wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        }

        // Average reading speed is 200-250 words per minute, using 200 for estimate
        const wordsPerMinute = 200;
        const minutes = Math.ceil(wordCount / wordsPerMinute);

        const readingTimeEl = document.getElementById('readingTime');
        if (readingTimeEl) {
            if (minutes === 0) {
                readingTimeEl.textContent = '~0 min read';
            } else if (minutes === 1) {
                readingTimeEl.textContent = '~1 min read';
            } else {
                readingTimeEl.textContent = `~${minutes} min read`;
            }
        }
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

        // Initialize toast service if not already done
        if (!this.activeToasts) {
            this.initToastService();
        }

        const deliveryMode = this.toastSettings.deliveryMode || 'stack';

        switch (deliveryMode) {
            case 'clear':
                // Clear all existing toasts before showing new one
                this.clearAllToasts();
                this.displayToast(message, category);
                break;

            case 'queue':
                // If a toast is already showing, queue this one
                if (this.activeToasts.length > 0) {
                    this.toastQueue.push({ message, category });
                } else {
                    this.displayToast(message, category);
                }
                break;

            case 'stack':
            default:
                // Show multiple toasts stacked
                this.displayToast(message, category);
                break;
        }
    }
}

// Initialize the editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new WYSIWYGEditor();
});
