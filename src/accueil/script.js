window.addEventListener('load', function() {
    const loading = document.getElementById('loading');
    setTimeout(() => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 400);
    }, 700);
});

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    
    navLinks.setAttribute('data-visible', !isExpanded);
    hamburger.setAttribute('aria-expanded', !isExpanded);
    document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
}

function closeMenu() {
    document.getElementById('navLinks').setAttribute('data-visible', 'false');
    document.querySelector('.hamburger').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = 'auto';
}

document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    const isMenuVisible = navLinks.getAttribute('data-visible') === 'true';
    
    if (isMenuVisible && !navLinks.contains(event.target) && !hamburger.contains(event.target)) {
        closeMenu();
    }
});

document.addEventListener('touchstart', function() {}, { passive: true });

const navbar = document.getElementById('navbar');
const headerHeight = navbar.offsetHeight;

function handleScroll() {
    if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    const reveals = document.querySelectorAll('.reveal:not(.active)');
    
    reveals.forEach(reveal => {
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = window.innerHeight - 100;
        
        if (revealTop < revealPoint) {
            reveal.classList.add('active');
        }
    });
}

let isScrolling;
window.addEventListener('scroll', function() {
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(handleScroll, 50);
}, { passive: true });

document.addEventListener('DOMContentLoaded', function() {
    const typingElement = document.querySelector('.hero__subtitle');
    const cursorElement = document.querySelector('.hero__cursor');
    const professions = ["développeur Full-Stack", "passionné par IA", "expert en algorithmique", "passionné de Tech"];
    let currentProfession = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isEnd = false;
    
    function type() {
        const currentText = professions[currentProfession];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isEnd = true;
            isDeleting = true;
            setTimeout(type, 1500);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentProfession = (currentProfession + 1) % professions.length;
            setTimeout(type, 500);
        } else {
            const typingSpeed = isDeleting ? 50 : 100;
            setTimeout(type, typingSpeed);
        }
    }
    
    setTimeout(type, 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    handleScroll();
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const targetPosition = target.offsetTop - headerHeight;
                
                if (document.getElementById('navLinks').getAttribute('data-visible') === 'true') {
                    closeMenu();
                }
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                } else {
                    location.hash = targetId;
                }
            }
        });
    });
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('#name').value.trim();
            const email = this.querySelector('#email').value.trim();
            const message = this.querySelector('#message').value.trim();
            
            if (name && email && message) {
                alert('Message envoyé avec succès !');
                this.reset();
            } else {
                alert('Veuillez remplir tous les champs du formulaire.');
            }
        });
    }
});

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

document.addEventListener('touchmove', function(e) {
    if (document.getElementById('navLinks').getAttribute('data-visible') === 'true') {
        e.preventDefault();
    }
}, { passive: false });