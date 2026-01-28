// WYSIWYG Editor - Pure JavaScript Implementation

class WYSIWYGEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.documents = this.loadDocuments();
        this.currentDocId = null;
        this.darkMode = this.loadThemePreference();

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

        this.init();
    }

    init() {
        this.initDarkMode();
        this.initSidebar();
        this.initSpellcheckAutocorrect();
        this.bindToolbarButtons();
        this.bindSelects();
        this.bindColorPickers();
        this.bindSpecialButtons();
        this.bindModals();
        this.bindHeaderActions();
        this.bindEditorEvents();
        this.renderDocumentList();
        this.updateCounts();
    }

    // ==================== Dark Mode ====================

    initDarkMode() {
        const toggle = document.getElementById('darkModeToggle');

        // Apply saved preference
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            toggle.checked = true;
        }

        // Bind toggle event
        toggle.addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('wysiwyg_theme') === null) {
                this.toggleDarkMode(e.matches, false);
                toggle.checked = e.matches;
            }
        });
    }

    toggleDarkMode(isDark, savePreference = true) {
        this.darkMode = isDark;

        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (savePreference) {
            this.saveThemePreference(isDark);
        }
    }

    loadThemePreference() {
        const saved = localStorage.getItem('wysiwyg_theme');
        if (saved !== null) {
            return saved === 'dark';
        }
        // Default to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    saveThemePreference(isDark) {
        localStorage.setItem('wysiwyg_theme', isDark ? 'dark' : 'light');
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
        this.showNotification('Document bar hidden.');
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
        this.showNotification('Document bar restored.');
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
                this.showNotification(`Spell check ${this.spellcheckEnabled ? 'enabled' : 'disabled'}`);
            });
        }

        if (autocorrectToggle) {
            autocorrectToggle.addEventListener('change', (e) => {
                this.autocorrectEnabled = e.target.checked;
                this.saveSpellcheckSettings();
                this.showNotification(`Autocorrect ${this.autocorrectEnabled ? 'enabled' : 'disabled'}`);
            });
        }

        if (autocapitalizeToggle) {
            autocapitalizeToggle.addEventListener('change', (e) => {
                this.autocapitalizeEnabled = e.target.checked;
                this.saveSpellcheckSettings();
                this.showNotification(`Auto-capitalize ${this.autocapitalizeEnabled ? 'enabled' : 'disabled'}`);
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
                    this.showNotification(`"${newWord}" added to dictionary`);
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
            this.showNotification(`Autocorrect rule added: "${from}" → "${to}"`);
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
                        this.showNotification(`"${word}" removed from dictionary`);
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
                        this.showNotification(`Autocorrect rule removed`);
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

        // Close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
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
        // New Document
        document.getElementById('newDocBtn').addEventListener('click', () => {
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

    // ==================== Document Management ====================

    newDocument() {
        this.editor.innerHTML = '';
        this.currentDocId = null;
        document.getElementById('docTitle').value = 'Untitled Document';
        this.editor.focus();
        this.updateCounts();
        this.renderDocumentList();
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
        this.showNotification('Document saved!');
    }

    loadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (doc) {
            this.editor.innerHTML = doc.content;
            document.getElementById('docTitle').value = doc.title;
            this.currentDocId = doc.id;
            this.updateCounts();
            this.renderDocumentList();
        }
    }

    deleteDocument(docId) {
        if (confirm('Are you sure you want to delete this document?')) {
            this.documents = this.documents.filter(doc => doc.id !== docId);
            this.saveDocuments();

            if (this.currentDocId === docId) {
                this.newDocument();
            }

            this.renderDocumentList();
            this.showNotification('Document deleted!');
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

        if (this.documents.length === 0) {
            list.innerHTML = '<li class="no-docs">No documents saved yet</li>';
            return;
        }

        // Sort by updated date (newest first)
        const sortedDocs = [...this.documents].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        list.innerHTML = sortedDocs.map(doc => `
            <li class="${doc.id === this.currentDocId ? 'active' : ''}" data-id="${doc.id}">
                <span class="doc-name" title="${doc.title}">${doc.title}</span>
                <button class="delete-btn" data-delete="${doc.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `).join('');

        // Bind click events
        list.querySelectorAll('li[data-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    this.loadDocument(item.dataset.id);
                }
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

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 2000);
    }
}

// Initialize the editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new WYSIWYGEditor();
});
