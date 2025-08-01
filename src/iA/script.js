// Configuration
const PROJECTS_DIR = '../../data/ia/projets/';
const CODES_DIR = '../../data/ia/codes/';
const FILE_PREFIX = 'projet';
const FILE_SUFFIX = '.txt';
const MAX_PROJECTS = 50;

// ================= INITIALISATION =================
window.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
});

async function initPortfolio() {
    // Initial setup
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    try {
        await loadProjects();
    } catch (error) {
        console.error("Erreur de chargement:", error);
        showErrorMessage("Erreur lors du chargement des projets");
    } finally {
        hideLoader();
    }

    setupFilters();
    setupTheme();
    setupModalCloseHandlers();
}

// ================= LOADER =================
function hideLoader() {
    const loader = document.getElementById('loading');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
}

// ================= CHARGEMENT PROJETS =================
async function loadProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = '';
    let loadedCount = 0;

    for (let i = 1; i <= MAX_PROJECTS; i++) {
        try {
            const filename = `${FILE_PREFIX}${i}${FILE_SUFFIX}`;
            const response = await fetch(`${PROJECTS_DIR}${filename}`);

            if (!response.ok) continue;

            const textData = await response.text();
            const projectData = parseProjectData(textData, i);
            createProjectCard(projectData);
            loadedCount++;
        } catch (error) {
            console.error(`Erreur sur projet ${i}:`, error);
        }
    }

    if (loadedCount === 0) {
        showNoProjectsMessage();
    }
}

function parseProjectData(textData, projectId) {
    const [header, details = ''] = textData.split('---').map(s => s.trim());
    const metadata = {};
    
    // Parse metadata
    header.split('\n').forEach(line => {
        const [key, ...values] = line.split(':');
        if (key) metadata[key.trim().toLowerCase()] = values.join(':').trim();
    });

    // Parse details
    const detailedSections = {};
    let currentSection = null;
    
    details.split('\n').forEach(line => {
        line = line.trim();
        if (!line) return;
        
        if (line.endsWith(':')) {
            currentSection = line.replace(':', '').trim().toLowerCase();
            detailedSections[currentSection] = '';
        } else if (currentSection) {
            detailedSections[currentSection] += line + '\n';
        }
    });

    // Clean sections
    Object.keys(detailedSections).forEach(key => {
        detailedSections[key] = detailedSections[key].trim();
    });

    return {
        id: projectId,
        titre: metadata.titre || `Projet ${projectId}`,
        imageUrl: metadata.image || getDefaultImageUrl(),
        categorie: metadata.catégorie?.toLowerCase() || 'data',
        description: metadata.description || 'Description non disponible',
        technologiesArray: metadata.technologies?.split(',').map(t => t.trim()) || [],
        badge: metadata.badge || null,
        details: detailedSections,
        codeUrl: metadata.code ? `${CODES_DIR}${metadata.code}.zip` : null
    };
}

// ================= AFFICHAGE PROJETS =================
function createProjectCard(projectData) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.category = projectData.categorie;
    card.dataset.id = projectData.id;
    card.style.animationDelay = `${projectData.id * 0.1}s`;

    // HTML Structure
    card.innerHTML = `
        <div class="project-image">
            <img src="${projectData.imageUrl}" alt="${projectData.titre}" loading="lazy">
        </div>
        <div class="project-header">
            <div class="project-icon"><i class="fas fa-${getIconForCategory(projectData.categorie)}"></i></div>
            <h2>${projectData.titre}</h2>
            ${projectData.badge ? `<span class="project-badge">${projectData.badge}</span>` : ''}
        </div>
        <div class="project-body">
            <p>${projectData.description}</p>
            <ul class="project-stats">
                ${projectData.technologiesArray.map(tech => `
                    <li><i class="fas fa-${getIconForTech(tech)}"></i> ${tech}</li>
                `).join('')}
            </ul>
        </div>
        <div class="project-footer">
            <div class="project-actions">
                ${projectData.codeUrl ? `
                    <button class="code-btn" data-url="${projectData.codeUrl}">
                        <i class="fas fa-code"></i> Code
                    </button>
                ` : ''}
                <button class="details-btn">
                    <i class="fas fa-info-circle"></i> Détails
                </button>
            </div>
        </div>
    `;

    // Add to DOM
    document.querySelector('.projects-grid').appendChild(card);
    
    // Setup interactions
    setupCardInteractions(card, projectData);
}

function setupCardInteractions(card, projectData) {
    // Bouton Détails
    card.querySelector('.details-btn').addEventListener('click', () => {
        showProjectDetails(projectData);
    });

    // Bouton Code
    const codeBtn = card.querySelector('.code-btn');
    if (codeBtn) {
        codeBtn.addEventListener('click', () => {
            downloadCode(projectData.codeUrl);
        });
    }
}

// ================= TELECHARGEMENT CODE =================
function downloadCode(url) {
    if (!url) return;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ================= FONCTIONS UTILITAIRES =================
function getIconForCategory(category) {
    const icons = {
        santé: 'heartbeat',
        vision: 'eye',
        nlp: 'comment-dots',
        data: 'chart-line',
        robot: 'robot',
        devtools: 'code',
        audio: 'music',
        éducation: 'graduation-cap',
        climat: 'cloud-sun'
    };
    return icons[category] || 'project-diagram';
}

function getIconForTech(tech) {
    const techIcons = {
        python: 'python',
        pytorch: 'robot',
        tensorflow: 'microchip',
        onnx: 'bolt',
        lstm: 'brain',
        transformer: 'microscope'
    };
    const lowerTech = tech.toLowerCase();
    for (const [key, icon] of Object.entries(techIcons)) {
        if (lowerTech.includes(key)) return icon;
    }
    return 'code';
}

function getDefaultImageUrl() {
    const categories = ['ai', 'neural-network', 'deep-learning'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    return `https://source.unsplash.com/600x400/?${randomCategory},technology`;
}

// ================= FILTRES =================
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProjects(this.dataset.filter);
        });
    });
}

function filterProjects(filter) {
    document.querySelectorAll('.project-card').forEach(project => {
        const shouldShow = filter === 'all' || project.dataset.category === filter;
        project.style.display = shouldShow ? 'flex' : 'none';
    });
}

// ================= THEME =================
function setupTheme() {
    const themeBtn = document.querySelector('.theme-btn');
    const currentTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(currentTheme);

    themeBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.querySelector('.theme-btn i').className = `fas fa-${theme === 'dark' ? 'sun' : 'moon'}`;
}

// ================= MODALE =================
function showProjectDetails(projectData) {
    const modalContent = `
        <button class="modal-close" aria-label="Fermer">
            <i class="fas fa-times"></i>
        </button>
        <h2 class="modal-title">${projectData.titre}</h2>
        <p class="modal-description">${projectData.details.détails || projectData.description}</p>
        
        ${projectData.details.fonctionnalités ? `
            <h3 class="modal-section-title">Fonctionnalités</h3>
            <ul>${projectData.details.fonctionnalités.split('\n').filter(f => f.trim()).map(f => `
                <li>${f.trim().replace(/^- /, '')}</li>
            `).join('')}</ul>
        ` : ''}
        
        ${projectData.details.défis ? `
            <h3 class="modal-section-title">Défis et Solutions</h3>
            <div class="challenges">${formatChallenges(projectData.details.défis)}</div>
        ` : ''}
        
        ${projectData.codeUrl ? `
            <div class="modal-section-title">
                <button class="download-btn" onclick="downloadCode('${projectData.codeUrl}')">
                    <i class="fas fa-download"></i> Télécharger le code
                </button>
            </div>
        ` : ''}
    `;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${modalContent}
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function formatChallenges(text) {
    return text.split('\n\n').map(entry => {
        const [problem, solution] = entry.split('\n');
        return `
            <div class="challenge-entry">
                <div class="problem">${problem.replace('Problème:', '').trim()}</div>
                <div class="solution">${solution.replace('Solution:', '').trim()}</div>
            </div>
        `;
    }).join('');
}

function setupModalCloseHandlers() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close') || e.target.classList.contains('modal-overlay')) {
            const modal = e.target.closest('.modal-overlay') || document.querySelector('.modal-overlay.active');
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }
    });
}

// ================= MESSAGES =================
function showNoProjectsMessage() {
    document.querySelector('.projects-grid').innerHTML = `
        <div class="no-projects">
            <i class="fas fa-exclamation-circle"></i>
            <p>Aucun projet trouvé</p>
            <small>Vérifiez le dossier ${PROJECTS_DIR}</small>
        </div>
    `;
}

function showErrorMessage(message) {
    document.querySelector('.projects-grid').innerHTML = `
        <div class="error">
            <i class="fas fa-times-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Exposer les fonctions globales
window.downloadCode = downloadCode;