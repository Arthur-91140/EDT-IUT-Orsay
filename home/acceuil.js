// Détection si l'appareil est tactile
function isTouchDevice() {
    return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
}

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si c'est un appareil tactile
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
    
    // Animer la section d'accueil
    setTimeout(function() {
        document.querySelector('.welcome-section').classList.add('visible');
    }, 300);
    
    // Animer les cartes de service avec délai
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const delay = card.getAttribute('data-delay') || 0;
        setTimeout(() => {
            card.classList.add('visible');
        }, parseInt(delay) + 600);
    });
    
    // Bouton retour en haut
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Effet 3D uniquement sur les appareils non tactiles
    if (!isTouchDevice()) {
        serviceCards.forEach(card => {
            const container = card.querySelector('.card-3d-container');
            
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Léger effet 3D au survol
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = (x - centerX) / 60;
                const rotateX = (centerY - y) / 60;
                
                container.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', function() {
                container.style.transform = '';
                setTimeout(() => {
                    container.style.transition = 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
                }, 100);
            });
        });
    }
    
    // Effet de vague au clic sur les boutons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ne pas créer d'effet de vague sur mobile pour éviter les problèmes de performance
            if (isTouchDevice()) return;
            
            // Créer l'élément d'effet d'onde
            const circle = document.createElement('div');
            const rect = this.getBoundingClientRect();
            
            circle.style.width = circle.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
            circle.style.left = `${e.clientX - rect.left - (parseInt(circle.style.width) / 2)}px`;
            circle.style.top = `${e.clientY - rect.top - (parseInt(circle.style.height) / 2)}px`;
            
            // Styles pour l'effet de vague
            circle.style.position = 'absolute';
            circle.style.borderRadius = '50%';
            circle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            circle.style.transform = 'scale(0)';
            circle.style.animation = 'ripple 0.6s linear';
            
            // Ajouter une position relative au bouton si nécessaire
            if (getComputedStyle(this).position !== 'relative') {
                this.style.position = 'relative';
            }
            this.style.overflow = 'hidden';
            
            // Ajouter l'effet au bouton
            this.appendChild(circle);
            
            // Supprimer l'effet après l'animation
            setTimeout(() => {
                circle.remove();
            }, 600);
        });
    });
});

// Optimisation pour mobile : désactiver certaines animations lors du défilement
let scrollTimeout;
window.addEventListener('scroll', function() {
    document.body.classList.add('is-scrolling');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
    }, 100);
});