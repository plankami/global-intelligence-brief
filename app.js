// Global Intelligence Brief - JavaScript Functionality

// Application State
let currentPage = 'home';
let subscribers = [];
let opinionPieces = [];
let aboutContent = 'Michael Plancarte is a 22-year-old researcher specializing in AI policy, governance, and international relations. He founded InterBridge, a startup focused on professionally mentoring Chinese international students, and brings firsthand experience navigating the intersection of technology, policy, and cross-cultural dynamics. His work spans economic analysis, constitutional law, intelligence community operations, and emerging technology governance. The Global Intelligence Brief synthesizes complex global developments into actionable insights for policymakers, investors, and international affairs professionals.';

// Initialize with sample opinion pieces
if (opinionPieces.length === 0) {
    opinionPieces = [
        {
            id: 1,
            title: 'AI Infrastructure Investment Concerns',
            date: 'October 15, 2025',
            excerpt: 'Analysis of AI infrastructure spending patterns and potential bubble indicators...',
            content: 'The current AI infrastructure boom shows concerning parallels to previous technology bubbles. Companies are investing billions in computational infrastructure based on uncertain demand projections.',
            tags: ['AI', 'Economics', 'Technology'],
            readingTime: '5 min read'
        },
        {
            id: 2,
            title: 'Democratic Governance Under Pressure',
            date: 'October 8, 2025',
            excerpt: 'Coalition governments face unprecedented challenges across major democracies...',
            content: 'Coalition collapses across established democracies signal structural challenges to governance in an era of increasing polarization.',
            tags: ['Democracy', 'Geopolitics'],
            readingTime: '4 min read'
        }
    ];
}

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
    const archiveGrid = document.getElementById('archive-grid');
    if (!archiveGrid) return;
    
    archiveGrid.innerHTML = '';
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
        const article = document.createElement('article');
        article.className = 'opinion-item';
        article.id = 'opinion-' + piece.id;
        
        article.innerHTML = '<div class="opinion-header">' +
                           '<h3>' + piece.title + '</h3>' +
                           '<div class="opinion-meta">' +
                           '<span>' + piece.date + '</span>' +
                           '<span>' + piece.readingTime + '</span>' +
                           '<span>By Michael Plancarte</span>' +
                           '</div>' +
                           '</div>' +
                           '<div class="opinion-excerpt">' + piece.excerpt + '</div>' +
                           '<div class="opinion-content" style="display: none;">' +
                           '<p>' + piece.content + '</p>' +
                           '</div>' +
                           '<div class="opinion-tags">' +
                           piece.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') +
                           '</div>';
        
        // Add click handler for title
        const title = article.querySelector('h3');
        title.addEventListener('click', function() {
            toggleOpinion(piece.id);
        });
        
        opinionsList.appendChild(article);
    });
}

function toggleOpinion(pieceId) {
    const content = document.getElementById('opinion-' + pieceId).querySelector('.opinion-content');
    if (content) {
        if (content.style.display === 'none') {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }
}

function openOpinionModal() {
    const modal = document.getElementById('opinion-modal');
    const form = document.getElementById('opinion-form');
    
    if (form) form.reset();
    if (modal) modal.classList.remove('hidden');
}

function closeOpinionModal() {
    const modal = document.getElementById('opinion-modal');
    if (modal) modal.classList.add('hidden');
}

function publishOpinion() {
    const titleInput = document.getElementById('opinion-title');
    const contentInput = document.getElementById('opinion-content');
    const tagsInput = document.getElementById('opinion-tags');
    
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
    
    const newPiece = {
        id: Date.now(),
        title: title,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        excerpt: content.substring(0, 150) + '...',
        content: content,
        tags: tags,
        readingTime: readingTime
    };
    
    opinionPieces.unshift(newPiece);
    
    populateOpinions();
    closeOpinionModal();
    showAlert('Opinion piece published successfully!', 'success');
}

function saveDraft() {
    showAlert('Draft saved! (In production, this would save to drafts folder)', 'success');
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