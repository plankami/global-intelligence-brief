// Global Intelligence Brief - JavaScript Functionality

/* 
 * SECURITY NOTE: Admin Password
 * 
 * Password: GlbInt3l!2025$MP#Secure
 * 
 * This password is stored in plain text in the JavaScript file.
 * This is acceptable for a personal static website because:
 * 1. There's no backend to protect
 * 2. All data is local to each user's browser
 * 3. Even with the password, users can only edit their own in-memory data
 * 4. The website files are public anyway (it's a static site)
 * 
 * For production with real backend: Use proper authentication (OAuth, JWT, etc.)
 */

// Admin Configuration
const ADMIN_CONFIG = {
    password: 'GlbInt3l!2025$MP#Secure',
    sessionDuration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

// Application State
let currentPage = 'home';
let subscribers = [];
let opinionPieces = [];
let aboutContent = 'Michael Plancarte is a 22-year-old researcher specializing in AI policy, governance, and international relations. He founded InterBridge, a startup focused on professionally mentoring Chinese international students, and brings firsthand experience navigating the intersection of technology, policy, and cross-cultural dynamics. His work spans economic analysis, constitutional law, intelligence community operations, and emerging technology governance. The Global Intelligence Brief synthesizes complex global developments into actionable insights for policymakers, investors, and international affairs professionals.';

// Admin State (in-memory)
let adminSession = null; // Will store { loginTime: number, isAdmin: true }
let archivedBriefs = []; // Store archived briefs
let currentBrief = {
    date: 'October 18, 2025',
    content: '', // Will be populated from current DOM
    lastModified: new Date().toISOString()
};

// Content editing state
let currentEditingContent = null;

// Generate unique IDs for opinions
function generateId() {
    return 'opinion-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Initialize with sample opinion pieces with proper IDs
const sampleOpinions = [
    {
        id: 'opinion-sample-1',
        title: "The AI Infrastructure Paradox: Why Today's Boom May Lead to Tomorrow's Bust",
        date: "October 15, 2025",
        content: "While AI investments prop up economic growth with $500 billion in capital deployment, historical patterns suggest infrastructure spending before revenue validation creates dangerous vulnerabilities similar to railway mania and dot-com excess. The parallels are striking: massive capital deployment before sustainable business models emerge, valuations disconnected from current revenue streams, and institutional investors driven by FOMO rather than fundamentals. Companies are building GPU clusters and data centers at unprecedented scale, yet few have demonstrated sustainable unit economics at scale. This infrastructure-first approach mirrors the railroad boom of the 1840s and fiber optic buildout of the late 1990s – both periods where massive infrastructure investment preceded demand validation, leading to significant market corrections.",
        excerpt: "While AI investments prop up economic growth with $500 billion in capital deployment, historical patterns suggest infrastructure spending before revenue validation creates dangerous vulnerabilities...",
        readingTime: "8 min read",
        tags: ['AI', 'Economics', 'Infrastructure']
    },
    {
        id: 'opinion-sample-2',
        title: "Democratic Resilience in the Age of Strongmen",
        date: "October 8, 2025",
        content: "Coalition collapses from Tokyo to Paris signal deeper challenges to democratic governance models as populist pressures and fiscal constraints limit governments' ability to address citizen concerns through traditional institutional mechanisms. The simultaneous failure of established political coalitions across multiple advanced democracies suggests structural rather than cyclical challenges. Citizens increasingly view democratic institutions as ineffective at addressing core concerns: economic inequality, technological disruption, climate change, and cultural transformation. Meanwhile, authoritarian alternatives offer the promise of decisive action, even as they fundamentally undermine the pluralistic foundations that enable long-term prosperity and adaptation.",
        excerpt: "Coalition collapses from Tokyo to Paris signal deeper challenges to democratic governance models as populist pressures and fiscal constraints limit governments' ability to address citizen concerns...",
        readingTime: "6 min read",
        tags: ['Democracy', 'Geopolitics', 'Politics']
    }
];

// Initialize opinions in memory
opinionPieces = [...sampleOpinions];

// Archive data
const archiveData = [
    {
        date: 'October 11, 2025',
        title: 'Global Tensions Escalate',
        summary: 'Analysis of escalating trade tensions and diplomatic developments.',
        region: 'global'
    },
    {
        date: 'October 4, 2025',
        title: 'Central Banks Navigate Uncertainty',
        summary: 'Fed policy divergence and emerging market pressures.',
        region: 'global'
    },
    {
        date: 'September 27, 2025',
        title: 'Tech Sector Regulatory Challenges',
        summary: 'Major antitrust actions and AI safety legislation debates.',
        region: 'global'
    },
    {
        date: 'September 20, 2025',
        title: 'Geopolitical Realignments',
        summary: 'BRICS expansion and NATO strategic developments.',
        region: 'global'
    }
];

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    populateArchive();
    populateAboutContent();
    populateOpinions();
    initializeCollapsibles();
    
    // Check admin status and update UI
    updateAdminUI();
    
    // Initialize admin event handlers
    setupAdminEventHandlers();
});

// Initialize the application
function initializeApp() {
    showPage('home');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showPage(page);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            } else {
                hideSearchResults();
            }
        });
    }
    
    // About page edit functionality
    const editAboutBtn = document.getElementById('edit-about-btn');
    if (editAboutBtn) {
        editAboutBtn.addEventListener('click', editAbout);
    }
    
    // Opinion form
    const opinionForm = document.getElementById('opinion-form');
    if (opinionForm) {
        opinionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            publishOpinion();
        });
    }
    
    // Write opinion button
    const writeOpinionBtn = document.getElementById('write-opinion-btn');
    if (writeOpinionBtn) {
        writeOpinionBtn.addEventListener('click', openOpinionModal);
    }
    
    // Edit and delete opinion buttons (event delegation)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-opinion-btn')) {
            if (!checkAdminStatus()) {
                showAlert('Admin access required', 'error');
                return;
            }
            
            const card = e.target.closest('.commentary-card');
            const id = card.dataset.id;
            
            // Get opinion from opinionPieces
            const opinion = opinionPieces.find(o => o.id === id);
            
            if (opinion) {
                // Open modal with existing content
                document.getElementById('opinion-title').value = opinion.title;
                document.getElementById('opinion-content').value = opinion.content;
                if (opinion.tags && document.getElementById('opinion-tags')) {
                    document.getElementById('opinion-tags').value = opinion.tags.join(', ');
                }
                
                const modal = document.getElementById('opinion-modal');
                const modalTitle = document.getElementById('modal-title');
                if (modalTitle) modalTitle.textContent = 'Edit Opinion Piece';
                if (modal) {
                    modal.dataset.editingId = id;
                    modal.classList.remove('hidden');
                }
            }
        }
        
        if (e.target.classList.contains('delete-opinion-btn')) {
            if (!checkAdminStatus()) {
                showAlert('Admin access required', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to delete this opinion piece?')) {
                const card = e.target.closest('.commentary-card');
                const id = card.dataset.id;
                
                // Remove from opinionPieces array
                opinionPieces = opinionPieces.filter(o => o.id !== id);
                
                // Remove from DOM
                card.remove();
                
                showAlert('Opinion piece deleted successfully', 'success');
            }
        }
    });
    
    // Archive filters
    const dateFilter = document.getElementById('date-filter');
    const regionFilter = document.getElementById('region-filter');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyArchiveFilters);
    }
    if (regionFilter) {
        regionFilter.addEventListener('change', applyArchiveFilters);
    }
}

// Page navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Update active states
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    const targetLink = document.querySelector('[data-page="' + pageId + '"]');
    
    if (targetPage) {
        targetPage.classList.add('active');
    }
    if (targetLink) {
        targetLink.classList.add('active');
    }
    
    currentPage = pageId;
    
    // Special handling for archive page
    if (pageId === 'archive') {
        applyArchiveFilters();
    }
}

// Initialize collapsible sections
function initializeCollapsibles() {
    // Main section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const arrow = this.querySelector('.toggle-arrow');
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                content.style.display = 'none';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('expanded');
                content.style.display = 'block';
                if (arrow) arrow.style.transform = 'rotate(180deg)';
            }
        });
    });
    
    // Regional headers are now just styled headers, no click functionality needed
    
    // Sources section header
    const sourcesHeader = document.querySelector('.sources-header');
    if (sourcesHeader) {
        sourcesHeader.addEventListener('click', function() {
            const content = document.getElementById('sources-content');
            const arrow = document.getElementById('sources-arrow');
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                content.style.display = 'none';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('expanded');
                content.style.display = 'block';
                if (arrow) arrow.style.transform = 'rotate(180deg)';
            }
        });
    }
    
    // Expand/Collapse all buttons
    const expandAllBtn = document.querySelector('.expand-all-btn');
    const collapseAllBtn = document.querySelector('.collapse-all-btn');
    
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function() {
            const sections = ['political', 'financial', 'technology', 'security', 'patterns', 'watchlists'];
            sections.forEach(function(sectionId) {
                const content = document.getElementById(sectionId + '-content');
                const header = content && content.previousElementSibling;
                const arrow = header && header.querySelector('.toggle-arrow');
                
                if (content) {
                    content.classList.add('expanded');
                    content.style.display = 'block';
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                }
            });
            
            this.textContent = 'Collapse All Sections';
            this.onclick = function() {
                sections.forEach(function(sectionId) {
                    const content = document.getElementById(sectionId + '-content');
                    const header = content && content.previousElementSibling;
                    const arrow = header && header.querySelector('.toggle-arrow');
                    
                    if (content) {
                        content.classList.remove('expanded');
                        content.style.display = 'none';
                        if (arrow) arrow.style.transform = 'rotate(0deg)';
                    }
                });
                
                this.textContent = 'Expand All Sections';
                this.onclick = arguments.callee;
            };
        });
    }
}

// Email subscription functionality
function subscribeEmail(inputId) {
    const emailInput = document.getElementById(inputId);
    const email = emailInput.value.trim();
    
    if (!email) {
        showAlert('Please enter an email address.', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address.', 'error');
        return;
    }
    
    if (subscribers.includes(email)) {
        showAlert('This email is already subscribed.', 'info');
        return;
    }
    
    subscribers.push(email);
    emailInput.value = '';
    
    showAlert('Successfully subscribed! You will receive the Global Intelligence Brief every Friday.', 'success');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(message, type) {
    // Create a more sophisticated alert for subscription success
    if (type === 'success' && message.includes('subscribed')) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'subscribe-message';
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(16, 185, 129, 0.2);
            color: #ffffff;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid rgba(16, 185, 129, 0.4);
            backdrop-filter: blur(10px);
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        `;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 4000);
    } else {
        alert(message);
    }
}

function showSubscribers() {
    if (subscribers.length === 0) {
        showAlert('No subscribers yet.', 'info');
        return;
    }
    
    const subscriberList = subscribers.map(function(email, index) {
        return (index + 1) + '. ' + email;
    }).join('\n');
    
    showAlert('Subscribers (' + subscribers.length + '):\n\n' + subscriberList, 'info');
}

// Search functionality
function performSearch(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Search in opinion pieces
    opinionPieces.forEach(piece => {
        if (piece.title.toLowerCase().includes(queryLower) || 
            piece.content.toLowerCase().includes(queryLower)) {
            results.push({
                type: 'opinion',
                title: piece.title,
                description: 'Opinion piece from ' + piece.date
            });
        }
    });
    
    // Search in archive
    archiveData.forEach(item => {
        if (item.title.toLowerCase().includes(queryLower) || 
            item.summary.toLowerCase().includes(queryLower)) {
            results.push({
                type: 'archive',
                title: item.title,
                description: 'Archive from ' + item.date
            });
        }
    });
    
    displaySearchResults(results.slice(0, 5));
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result">No results found</div>';
    } else {
        searchResults.innerHTML = '';
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.innerHTML = '<strong>' + result.title + '</strong><br><small>' + result.description + '</small>';
            searchResults.appendChild(div);
        });
    }
    
    searchResults.style.display = 'block';
}

function hideSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// Archive functionality
function populateArchive() {
    // Load archived briefs (admin functionality)
    loadArchivedBriefs();
    
    // Legacy archive data for backwards compatibility
    const archiveGrid = document.getElementById('archive-grid');
    if (!archiveGrid) return;
    
    // If no archived briefs exist, show legacy data
    if (archivedBriefs.length === 0) {
        archiveData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'archive-item';
            div.dataset.date = item.date;
            div.dataset.region = item.region;
            
            div.innerHTML = '<h3>' + item.title + '</h3>' +
                           '<div class="date">' + item.date + '</div>' +
                           '<p>' + item.summary + '</p>' +
                           '<button class="read-full-btn">Read Full Brief</button>';
            
            const btn = div.querySelector('.read-full-btn');
            btn.addEventListener('click', function() {
                openArchiveModal(item);
            });
            
            archiveGrid.appendChild(div);
        });
    }
}

function applyArchiveFilters() {
    const dateFilter = document.getElementById('date-filter');
    const regionFilter = document.getElementById('region-filter');
    const archiveItems = document.querySelectorAll('.archive-item');
    
    const dateValue = dateFilter ? dateFilter.value : 'all';
    const regionValue = regionFilter ? regionFilter.value : 'all';
    
    archiveItems.forEach(item => {
        const itemDate = item.dataset.date;
        const itemRegion = item.dataset.region;
        
        let showItem = true;
        
        if (dateValue !== 'all' && !itemDate.includes(dateValue)) {
            showItem = false;
        }
        
        if (regionValue !== 'all' && itemRegion !== regionValue) {
            showItem = false;
        }
        
        item.style.display = showItem ? 'block' : 'none';
    });
}

function openArchiveModal(item) {
    const modal = document.getElementById('archive-modal');
    const title = document.getElementById('archive-modal-title');
    const content = document.getElementById('archive-modal-content');
    
    if (title) title.textContent = item.title + ' - ' + item.date;
    if (content) {
        content.innerHTML = '<div class="executive-summary">' +
                           '<h3>Executive Summary</h3>' +
                           '<p>' + item.summary + '</p>' +
                           '</div>' +
                           '<p>This is a sample archive entry. Full historical content would be available in the production version.</p>';
    }
    
    if (modal) modal.classList.remove('hidden');
}

function closeArchiveModal() {
    const modal = document.getElementById('archive-modal');
    if (modal) modal.classList.add('hidden');
}

// About page functionality
function populateAboutContent() {
    const aboutDisplay = document.getElementById('about-display');
    if (!aboutDisplay) return;
    
    aboutDisplay.innerHTML = aboutContent.split('. ').map(function(sentence) {
        return '<p>' + sentence + (sentence.endsWith('.') ? '' : '.') + '</p>';
    }).join('');
}

function editAbout() {
    if (!checkAdminStatus()) {
        showAlert('Admin access required to edit about section', 'error');
        return;
    }
    
    const aboutDisplay = document.getElementById('about-display');
    const aboutEdit = document.getElementById('about-edit');
    const aboutTextarea = document.getElementById('about-textarea');
    
    if (aboutDisplay) aboutDisplay.classList.add('hidden');
    if (aboutEdit) aboutEdit.classList.remove('hidden');
    if (aboutTextarea) {
        aboutTextarea.value = aboutContent;
        aboutTextarea.focus();
    }
}

function saveAbout() {
    const aboutTextarea = document.getElementById('about-textarea');
    
    if (!aboutTextarea) return;
    
    aboutContent = aboutTextarea.value.trim();
    
    if (!aboutContent) {
        showAlert('Please enter some content for your bio.', 'warning');
        return;
    }
    
    populateAboutContent();
    cancelEditAbout();
    showAlert('About section updated successfully!', 'success');
}

function cancelEditAbout() {
    const aboutDisplay = document.getElementById('about-display');
    const aboutEdit = document.getElementById('about-edit');
    
    if (aboutDisplay) aboutDisplay.classList.remove('hidden');
    if (aboutEdit) aboutEdit.classList.add('hidden');
}

// Opinion pieces functionality
function populateOpinions() {
    const opinionsList = document.getElementById('opinions-list');
    if (!opinionsList) return;
    
    if (opinionPieces.length === 0) {
        opinionsList.innerHTML = '<p class="text-center">No opinion pieces yet. Click "Write New Opinion Piece" to get started.</p>';
        return;
    }
    
    opinionsList.innerHTML = '';
    opinionPieces.forEach(piece => {
        addOpinionToPage(piece);
    });
}

function addOpinionToPage(piece) {
    const opinionsList = document.getElementById('opinions-list');
    if (!opinionsList) return;
    
    const article = document.createElement('article');
    article.className = 'commentary-card';
    article.dataset.id = piece.id;
    
    article.innerHTML = 
        '<h3 class="commentary-title">' + piece.title + '</h3>' +
        '<div class="commentary-meta">' +
        '<span class="commentary-date">' + piece.date + '</span>' +
        '<span class="commentary-reading-time">' + piece.readingTime + '</span>' +
        '<span>By Michael Plancarte</span>' +
        '</div>' +
        '<p class="commentary-excerpt">' + piece.excerpt + '</p>' +
        '<div class="opinion-content" style="display: none;">' +
        '<p>' + piece.content + '</p>' +
        '</div>' +
        '<div class="opinion-tags">' +
        (piece.tags ? piece.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') : '') +
        '</div>' +
        '<div class="commentary-actions">' +
        '<button class="btn-glass read-more-btn">Read More</button>' +
        (checkAdminStatus() ? '<button class="btn-glass edit-opinion-btn admin-btn">Edit</button>' : '') +
        (checkAdminStatus() ? '<button class="btn-glass delete-opinion-btn admin-btn">Delete</button>' : '') +
        '</div>';
    
    // Add click handler for read more
    const readMoreBtn = article.querySelector('.read-more-btn');
    readMoreBtn.addEventListener('click', function() {
        toggleOpinion(piece.id);
    });
    
    // Add to the beginning of the list
    if (opinionsList.firstChild) {
        opinionsList.insertBefore(article, opinionsList.firstChild);
    } else {
        opinionsList.appendChild(article);
    }
}

function toggleOpinion(pieceId) {
    const card = document.querySelector('[data-id="' + pieceId + '"]');
    if (!card) return;
    
    const content = card.querySelector('.opinion-content');
    const btn = card.querySelector('.read-more-btn');
    
    if (content && btn) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
            btn.textContent = 'Read Less';
        } else {
            content.style.display = 'none';
            btn.textContent = 'Read More';
        }
    }
}

function openOpinionModal() {
    if (!checkAdminStatus()) {
        showAlert('Admin access required to write opinion pieces', 'error');
        return;
    }
    
    const modal = document.getElementById('opinion-modal');
    const form = document.getElementById('opinion-form');
    const modalTitle = document.getElementById('modal-title');
    
    if (form) form.reset();
    if (modalTitle) modalTitle.textContent = 'Write New Opinion Piece';
    if (modal) {
        delete modal.dataset.editingId;
        modal.classList.remove('hidden');
    }
}

function closeOpinionModal() {
    const modal = document.getElementById('opinion-modal');
    if (modal) {
        modal.classList.add('hidden');
        delete modal.dataset.editingId;
    }
}

function publishOpinion() {
    const modal = document.getElementById('opinion-modal');
    const titleInput = document.getElementById('opinion-title');
    const contentInput = document.getElementById('opinion-content');
    const tagsInput = document.getElementById('opinion-tags');
    const editingId = modal ? modal.dataset.editingId : null;
    
    if (!titleInput || !contentInput) return;
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const tagsValue = tagsInput ? tagsInput.value.trim() : '';
    
    if (!title || !content) {
        showAlert('Please fill in both title and content.', 'warning');
        return;
    }
    
    const tags = tagsValue ? tagsValue.split(',').map(tag => tag.trim()) : [];
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200) + ' min read';
    const excerpt = content.substring(0, 200) + (content.length > 200 ? '...' : '');
    
    if (editingId) {
        // Update existing opinion
        const index = opinionPieces.findIndex(o => o.id === editingId);
        if (index !== -1) {
            opinionPieces[index] = {
                ...opinionPieces[index],
                title: title,
                content: content,
                excerpt: excerpt,
                readingTime: readingTime,
                tags: tags
            };
            
            // State managed in memory
            
            populateOpinions();
            closeOpinionModal();
            showAlert('Opinion piece updated successfully!', 'success');
        }
    } else {
        // Create new opinion
        const newPiece = {
            id: generateId(),
            title: title,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            excerpt: excerpt,
            content: content,
            tags: tags,
            readingTime: readingTime
        };
        
        opinionPieces.unshift(newPiece);
        
        // State managed in memory
        
        populateOpinions();
        closeOpinionModal();
        showAlert('Opinion piece published successfully!', 'success');
    }
}

function saveDraft() {
    showAlert('Draft saved! (In production, this would save to drafts folder)', 'success');
}

// Admin Authentication Functions
function checkAdminStatus() {
    if (!adminSession) return false;
    
    const now = Date.now();
    
    // Check if session is still valid (24 hours)
    if (now - adminSession.loginTime < ADMIN_CONFIG.sessionDuration) {
        return true;
    } else {
        // Session expired
        adminSession = null;
        return false;
    }
}

function loginAdmin() {
    const password = prompt('Enter admin password:');
    
    if (password === ADMIN_CONFIG.password) {
        // Set session
        adminSession = {
            loginTime: Date.now(),
            isAdmin: true
        };
        
        showAlert('✓ Admin access granted for 24 hours', 'success');
        updateAdminUI();
        return true;
    } else {
        showAlert('❌ Incorrect password', 'error');
        return false;
    }
}

function logoutAdmin() {
    adminSession = null;
    showAlert('Logged out successfully', 'success');
    updateAdminUI();
}

function updateAdminUI() {
    const isAdmin = checkAdminStatus();
    
    // Show/hide admin elements
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
    });
    
    document.querySelectorAll('.admin-btn').forEach(el => {
        el.style.display = isAdmin ? 'inline-block' : 'none';
    });
    
    // Update login/logout button
    const adminBtn = document.getElementById('admin-toggle');
    if (adminBtn) {
        adminBtn.textContent = isAdmin ? 'Logout (Admin)' : 'Admin Login';
        adminBtn.onclick = isAdmin ? logoutAdmin : loginAdmin;
    }
}

// Archive Management Functions
function archiveCurrentBrief() {
    if (!checkAdminStatus()) {
        showAlert('Admin access required', 'error');
        return;
    }
    
    if (!confirm('Archive current brief and create a new one?\n\nThis will:\n1. Move current brief to archive\n2. Create blank template for next week')) {
        return;
    }
    
    // Get current brief content
    const currentBriefContent = document.querySelector('.brief-container').innerHTML;
    const currentDate = document.querySelector('.brief-date').textContent;
    
    // Create archive entry
    const archiveEntry = {
        id: 'brief-' + Date.now(),
        date: currentDate,
        title: 'Executive Summary: ' + currentDate,
        content: currentBriefContent,
        summary: 'Weekly intelligence brief covering global political, economic, and security developments.',
        archivedOn: new Date().toISOString()
    };
    
    // Add to archive
    archivedBriefs.unshift(archiveEntry); // Add to beginning
    
    // Create new blank brief template
    createNewBriefTemplate();
    
    // Update archive grid
    loadArchivedBriefs();
    
    showAlert('✓ Brief archived successfully!\n\nYou can now edit the new blank template.', 'success');
}

function createNewBriefTemplate() {
    // Calculate next Friday's date
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
    const nextFriday = new Date(today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
    const nextDate = nextFriday.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Update date
    const briefDate = document.querySelector('.brief-date');
    if (briefDate) {
        briefDate.textContent = nextDate;
    }
    
    // Clear all section content (keep structure)
    document.querySelectorAll('.section-content').forEach(content => {
        content.innerHTML = '<p class="admin-only" style="color: rgba(255,255,255,0.5); font-style: italic;">Add content here for next week\'s brief...</p>';
        
        // Add edit button if admin
        if (checkAdminStatus()) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-glass edit-content-btn admin-btn';
            editBtn.textContent = 'Edit This Section';
            editBtn.style.marginTop = '1rem';
            editBtn.onclick = function() {
                openContentEditor(content);
            };
            content.appendChild(editBtn);
        }
    });
    
    // Clear executive summary
    const execSummary = document.querySelector('.executive-summary');
    if (execSummary) {
        const summaryContent = execSummary.querySelectorAll('p');
        summaryContent.forEach(p => {
            p.innerHTML = 'Add executive summary content here...';
            p.style.color = 'rgba(255,255,255,0.5)';
            p.style.fontStyle = 'italic';
        });
    }
    
    // Enable content editing for admin
    makeContentEditable();
}

function makeContentEditable() {
    if (!checkAdminStatus()) return;
    
    // Add "Edit Content" button to each section that doesn't have one
    document.querySelectorAll('.section-content').forEach(content => {
        if (!content.querySelector('.edit-content-btn')) {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-glass edit-content-btn admin-btn';
            editBtn.textContent = 'Edit This Section';
            editBtn.style.marginTop = '1rem';
            editBtn.onclick = function() {
                openContentEditor(content);
            };
            content.appendChild(editBtn);
        }
    });
    
    // Add edit button to executive summary
    const execSummary = document.querySelector('.executive-summary');
    if (execSummary && !execSummary.querySelector('.edit-content-btn')) {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-glass edit-content-btn admin-btn';
        editBtn.textContent = 'Edit Executive Summary';
        editBtn.style.marginTop = '1rem';
        editBtn.onclick = function() {
            openContentEditor(execSummary);
        };
        execSummary.appendChild(editBtn);
    }
}

// Content Editing Functions
function openContentEditor(contentElement) {
    if (!checkAdminStatus()) {
        showAlert('Admin access required', 'error');
        return;
    }
    
    currentEditingContent = contentElement;
    const modal = document.getElementById('content-editor-modal');
    const textarea = document.getElementById('content-editor-textarea');
    
    if (textarea) {
        // Get current HTML content, excluding edit buttons
        const clone = contentElement.cloneNode(true);
        clone.querySelectorAll('.edit-content-btn').forEach(btn => btn.remove());
        textarea.value = clone.innerHTML;
    }
    
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeContentEditor() {
    const modal = document.getElementById('content-editor-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentEditingContent = null;
}

function saveContentChanges() {
    if (!currentEditingContent || !checkAdminStatus()) {
        return;
    }
    
    const textarea = document.getElementById('content-editor-textarea');
    if (textarea) {
        const newContent = textarea.value;
        currentEditingContent.innerHTML = newContent;
        
        // Re-add edit button if admin
        makeContentEditable();
        
        closeContentEditor();
        showAlert('✓ Section updated', 'success');
    }
}

// Archive Management Functions
function loadArchivedBriefs() {
    const grid = document.getElementById('archive-grid');
    if (!grid) return;
    
    const isAdmin = checkAdminStatus();
    
    grid.innerHTML = ''; // Clear existing
    
    archivedBriefs.forEach(brief => {
        const card = document.createElement('div');
        card.className = 'archive-card';
        card.dataset.id = brief.id;
        
        card.innerHTML = `
            <div class="archive-date">${brief.date}</div>
            <h3 class="archive-title">${brief.title}</h3>
            <p class="archive-summary">${brief.summary}</p>
            <div class="archive-actions">
                <button class="btn-glass view-archive-btn">View Full Brief</button>
                ${isAdmin ? `
                    <button class="btn-glass edit-archive-btn admin-btn">Edit</button>
                    <button class="btn-glass delete-archive-btn admin-btn">Delete</button>
                ` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function showArchivedBrief(brief) {
    const modal = document.getElementById('archive-modal');
    const title = document.getElementById('archive-modal-title');
    const content = document.getElementById('archive-modal-content');
    
    if (title) title.textContent = brief.title;
    if (content) content.innerHTML = brief.content;
    if (modal) modal.classList.remove('hidden');
}

function editArchivedBrief(brief) {
    if (!checkAdminStatus()) {
        showAlert('Admin access required', 'error');
        return;
    }
    
    const modal = document.getElementById('archive-editor-modal');
    const form = document.getElementById('archive-edit-form');
    
    // Populate form
    document.getElementById('archive-edit-title').value = brief.title;
    document.getElementById('archive-edit-date').value = brief.date;
    document.getElementById('archive-edit-summary').value = brief.summary;
    document.getElementById('archive-edit-content').value = brief.content;
    
    // Store current editing brief
    form.dataset.editingId = brief.id;
    
    if (modal) modal.classList.remove('hidden');
}

function saveArchivedBrief() {
    const form = document.getElementById('archive-edit-form');
    const editingId = form.dataset.editingId;
    
    if (!editingId || !checkAdminStatus()) return;
    
    const title = document.getElementById('archive-edit-title').value.trim();
    const date = document.getElementById('archive-edit-date').value.trim();
    const summary = document.getElementById('archive-edit-summary').value.trim();
    const content = document.getElementById('archive-edit-content').value.trim();
    
    if (!title || !date || !summary || !content) {
        showAlert('Please fill in all fields', 'warning');
        return;
    }
    
    // Update archived brief
    const briefIndex = archivedBriefs.findIndex(b => b.id === editingId);
    if (briefIndex !== -1) {
        archivedBriefs[briefIndex] = {
            ...archivedBriefs[briefIndex],
            title,
            date,
            summary,
            content,
            lastModified: new Date().toISOString()
        };
        
        loadArchivedBriefs();
        closeArchiveEditor();
        showAlert('✓ Archived brief updated', 'success');
    }
}

function deleteArchivedBrief(briefId) {
    if (!checkAdminStatus()) {
        showAlert('Admin access required', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to permanently delete this archived brief?')) {
        return;
    }
    
    archivedBriefs = archivedBriefs.filter(b => b.id !== briefId);
    loadArchivedBriefs();
    showAlert('✓ Archived brief deleted', 'success');
}

function closeArchiveEditor() {
    const modal = document.getElementById('archive-editor-modal');
    if (modal) modal.classList.add('hidden');
}

// Setup Admin Event Handlers
function setupAdminEventHandlers() {
    // Archive current brief button
    const archiveBtn = document.getElementById('archive-current-btn');
    if (archiveBtn) {
        archiveBtn.addEventListener('click', archiveCurrentBrief);
    }
    
    // Content editor save button
    const saveContentBtn = document.getElementById('save-content-btn');
    if (saveContentBtn) {
        saveContentBtn.addEventListener('click', saveContentChanges);
    }
    
    // Archive editor form
    const archiveEditForm = document.getElementById('archive-edit-form');
    if (archiveEditForm) {
        archiveEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveArchivedBrief();
        });
    }
    
    // Event delegation for archive actions
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.archive-card');
        if (!card) return;
        
        const briefId = card.dataset.id;
        const brief = archivedBriefs.find(b => b.id === briefId);
        
        if (e.target.classList.contains('view-archive-btn') && brief) {
            showArchivedBrief(brief);
        }
        
        if (e.target.classList.contains('edit-archive-btn') && brief) {
            editArchivedBrief(brief);
        }
        
        if (e.target.classList.contains('delete-archive-btn')) {
            deleteArchivedBrief(briefId);
        }
    });
}

// Dark mode toggle (glassmorphism theme is optimized for dark)
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
        // Glassmorphism design is optimized for dark backgrounds
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        showAlert('Glassmorphism theme is optimized for dark mode!', 'info');
    });
}