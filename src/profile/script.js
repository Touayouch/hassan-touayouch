document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('home-btn').addEventListener('click', function() {
    window.location.href = '../accueil/index.html';
    });
    // ===== GESTION DU THÈME =====
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = themeBtn.querySelector('i');
    
    // Vérifier la préférence système et le localStorage
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Appliquer le thème initial
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    
    // Basculer le thème au clic
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    // ===== LOADER =====
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-spinner"></div>
        <div class="loader-text">Chargement...</div>
    `;
    document.body.prepend(loader);
    document.body.style.overflow = 'hidden';

    // Simuler un chargement
    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.remove();
            document.body.style.overflow = 'auto';
        }, 500);
    }, 1000);

    // ===== NAVIGATION =====
    // Bouton Accueil
    document.getElementById('home-btn').addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Bouton Contact
    document.getElementById('contact-btn').addEventListener('click', () => {
        document.getElementById('contact').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // ===== CHARGEMENT DES ARTICLES =====
    async function loadArticles() {
        try {
            const maxArticlesToCheck = 10;
            const articles = [];
            
            for (let i = 1; i <= maxArticlesToCheck; i++) {
                try {
                    const fileName = `article${i}.txt`;
                    const response = await fetch(`../../data/articles/infoArticles/${fileName}`);
                    
                    if (!response.ok) continue;
                    
                    const articleText = await response.text();
                    const articleData = parseArticleData(articleText, fileName);
                    
                    if (!articleData.id || !articleData.title) {
                        console.warn(`Article ${fileName} incomplet - ID ou titre manquant`);
                        continue;
                    }
                    
                    articles.push(articleData);
                } catch (error) {
                    console.error(`Erreur lors du chargement de article${i}.txt:`, error);
                }
            }
            
            if (articles.length === 0) {
                throw new Error('Aucun article valide trouvé dans le dossier infoArticles/');
            }
            
            // Trier les articles par date (du plus récent au plus ancien)
            articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            displayArticles(articles);
            
        } catch (error) {
            console.error('Erreur lors du chargement des articles:', error);
            displayErrorArticles();
        }
    }

    // Parser les données de l'article
    function parseArticleData(text, fileName) {
        const data = {};
        const lines = text.split('\n');
        
        const fieldMappings = {
            'Titre:': 'title',
            'Catégorie:': 'category',
            'Date:': 'date',
            'nom article :': 'id',
            'Résumé:': 'summary',
            'Image:': 'image'
        };
        
        lines.forEach(line => {
            for (const [prefix, fieldName] of Object.entries(fieldMappings)) {
                if (line.startsWith(prefix)) {
                    data[fieldName] = line.replace(prefix, '').trim();
                    break;
                }
            }
        });
        
        if (!data.id) data.id = fileName.replace('.txt', '');
        if (!data.image) data.image = 'https://via.placeholder.com/600x400?text=Article+Image';
        if (!data.date) data.date = 'Date non spécifiée';
        
        return data;
    }

    // Afficher les articles dans le DOM
    function displayArticles(articles) {
        const firstArticlesGrid = document.getElementById('first-articles-grid');
        const moreArticlesGrid = document.getElementById('more-articles');
        
        firstArticlesGrid.innerHTML = '';
        moreArticlesGrid.innerHTML = '';
        
        articles.forEach((article, index) => {
            const articleCard = createArticleCard(article);
            
            if (index < 3) {
                firstArticlesGrid.appendChild(articleCard);
            } else {
                moreArticlesGrid.appendChild(articleCard);
            }
        });
        
        document.querySelector('.articles-cta').style.display = articles.length > 3 ? 'flex' : 'none';
    }

    // Créer une carte d'article
    function createArticleCard(article) {
        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        
        articleCard.innerHTML = `
            <div class="article-image-container">
                <img src="${article.image}" 
                    alt="${article.title}" 
                    class="article-image" 
                    loading="lazy">
                ${article.category ? `<span class="article-badge">${article.category}</span>` : ''}
            </div>
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.summary || 'Résumé non disponible'}</p>
                <div class="article-footer">
                    ${article.date ? `<span class="article-date"><i class="far fa-calendar-alt"></i> ${article.date}</span>` : ''}
                    <a href="#" class="article-link" onclick="openArticleModal('${article.id}')">
                        Lire <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        return articleCard;
    }

    // ===== GESTION DE LA MODALE DES ARTICLES =====
    let currentArticleId = null;

    // Fonction pour ouvrir le modal
    window.openArticleModal = function(articleId) {
        event.preventDefault();
        currentArticleId = articleId;
        const modal = document.getElementById('article-modal');
        modal.style.display = 'block';
        document.getElementById('article-language').value = 'fra';
    };

    // Fermer le modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('article-modal').style.display = 'none';
    });

    // Fermer en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('article-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Gestion des boutons d'action
    document.querySelector('.btn-download').addEventListener('click', function() {
        const language = document.getElementById('article-language').value;
        downloadArticle(currentArticleId, language);
    });

    document.querySelector('.btn-open').addEventListener('click', function() {
        const language = document.getElementById('article-language').value;
        openArticle(currentArticleId, language);
    });

    // Télécharger l'article
    function downloadArticle(articleId, language) {
        const pdfUrl = `../../data/articles/articles/article${articleId}${language}.pdf`;
        
        // Créer un lien invisible pour le téléchargement
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `article${articleId}${language}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Fermer la modale après téléchargement
        document.getElementById('article-modal').style.display = 'none';
    }



    // Ouvrir l'article dans un nouvel onglet
    function openArticle(articleId, language) {
        const pdfUrl = `../../data/articles/articles/${articleId}${language}.pdf`;
        
        fetch(pdfUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    window.open(pdfUrl, '_blank');
                } else {
                    alert('Le PDF de cet article n\'est pas disponible dans cette langue');
                }
                document.getElementById('article-modal').style.display = 'none';
            })
            .catch(() => {
                alert('Erreur lors de l\'accès au PDF');
                document.getElementById('article-modal').style.display = 'none';
            });
    }

    // Afficher un message d'erreur
    function displayErrorArticles() {
        const firstArticlesGrid = document.getElementById('first-articles-grid');
        firstArticlesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Impossible de charger les articles. Veuillez réessayer plus tard.</p>
            </div>
        `;
        document.querySelector('.articles-cta').style.display = 'none';
    }

    // ===== BOUTON "VOIR PLUS" D'ARTICLES =====
    const toggleButton = document.getElementById('toggle-articles');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;
            
            this.setAttribute('aria-expanded', newState);
            const btnText = this.querySelector('.btn-toggle-text');
            btnText.textContent = newState ? 'Voir moins' : 'Voir plus';
            
            const moreArticles = document.getElementById('more-articles');
            if (newState) {
                moreArticles.style.display = 'grid';
                setTimeout(() => {
                    moreArticles.style.opacity = '1';
                }, 10);
            } else {
                moreArticles.style.opacity = '0';
                setTimeout(() => {
                    moreArticles.style.display = 'none';
                }, 300);
            }
        });
    }

    // ===== ANIMATIONS AU SCROLL =====
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.reveal');
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    // Démarrer les animations
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // ===== OBSERVATEUR D'INTERSECTION =====
    const createIntersectionObserver = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    };

    createIntersectionObserver();

    // ===== GESTION DES ÉVÉNEMENTS TACTILES =====
    const touchElements = document.querySelectorAll('.nav-btn, .btn, .article-card, .about-card, .personal-card');
    
    touchElements.forEach(el => {
        el.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, {passive: true});
        
        el.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, {passive: true});
    });

    // ===== GESTION DU REDIMENSIONNEMENT =====
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            animateOnScroll();
        }, 250);
    });

    // ===== DÉTECTION DES CAPACITÉS =====
    function checkCapabilities() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile) document.body.classList.add('is-mobile');
        if (isTouch) document.body.classList.add('is-touch');
        
        if (isMobile) {
            document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
        }
    }

    checkCapabilities();

    // ===== CHARGEMENT INITIAL =====
    loadArticles();
});