        // Détection si l'appareil est tactile
        function isTouchDevice() {
            return (('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0) ||
                   (navigator.msMaxTouchPoints > 0));
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Configuration des particules
            const PARTICLE_COUNT = 90; // Changez ce nombre pour avoir plus ou moins de particules
            const PARTICLE_COLORS = ['#590036', '#8E1165', '#6A1B9A'];
            const PARTICLE_SIZES = [3, 4, 5, 6, 7]; // Tailles en pixels
            const REPULSION_DISTANCE = 150; // Distance d'influence du curseur (en pixels)
            const REPULSION_FORCE = 50; // Force de répulsion
            
            let particles = []; // Stocker les particules pour l'interaction
            let mouseX = 0;
            let mouseY = 0;
            
            // Fonction pour générer les particules
            function createParticles() {
                const particlesContainer = document.getElementById('particlesContainer');
                const styleSheet = document.createElement('style');
                document.head.appendChild(styleSheet);
                
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    // Créer l'élément particule
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.id = `particle-${i}`;
                    
                    // Propriétés aléatoires
                    const size = PARTICLE_SIZES[Math.floor(Math.random() * PARTICLE_SIZES.length)];
                    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
                    const top = Math.random() * 100; // 0-100%
                    const left = Math.random() * 100; // 0-100%
                    const duration = 7 + Math.random() * 15; // 7-22 secondes
                    
                    // Mouvements aléatoires pour l'animation
                    const moveX1 = (Math.random() - 0.5) * 80; // -40px à +40px
                    const moveY1 = (Math.random() - 0.5) * 80;
                    const moveX2 = (Math.random() - 0.5) * 80;
                    const moveY2 = (Math.random() - 0.5) * 80;
                    const rotation1 = Math.random() * 360;
                    const rotation2 = Math.random() * 360;
                    const opacity1 = 0.2 + Math.random() * 0.6; // 0.2-0.8
                    const opacity2 = 0.2 + Math.random() * 0.6;
                    
                    // Appliquer les styles à la particule
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.top = `${top}%`;
                    particle.style.left = `${left}%`;
                    particle.style.backgroundColor = color;
                    particle.style.animation = `float-${i} ${duration}s ease-in-out infinite`;
                    particle.style.transition = 'filter 0.3s ease-out';
                    
                    // Variables CSS pour la répulsion
                    particle.style.setProperty('--repulsion-x', '0px');
                    particle.style.setProperty('--repulsion-y', '0px');
                    particle.style.setProperty('--repulsion-scale', '1');
                    
                    // Stocker les données de la particule pour l'interaction
                    const particleData = {
                        element: particle,
                        originalTop: top,
                        originalLeft: left,
                        size: size,
                        isRepulsed: false,
                        repulsionX: 0,
                        repulsionY: 0
                    };
                    particles.push(particleData);
                    
                    // Créer l'animation CSS unique pour cette particule avec variables de répulsion
                    const keyframes = `
                        @keyframes float-${i} {
                            0%, 100% { 
                                transform: translate(calc(0px + var(--repulsion-x)), calc(0px + var(--repulsion-y))) rotate(0deg) scale(var(--repulsion-scale)); 
                                opacity: ${0.3 + Math.random() * 0.4}; 
                            }
                            25% { 
                                transform: translate(calc(${moveX1}px + var(--repulsion-x)), calc(${moveY1}px + var(--repulsion-y))) rotate(${rotation1}deg) scale(var(--repulsion-scale)); 
                                opacity: ${opacity1}; 
                            }
                            50% { 
                                transform: translate(calc(${moveX2}px + var(--repulsion-x)), calc(${moveY2}px + var(--repulsion-y))) rotate(${rotation2}deg) scale(var(--repulsion-scale)); 
                                opacity: ${0.2 + Math.random() * 0.6}; 
                            }
                            75% { 
                                transform: translate(calc(${(moveX1 + moveX2) / 2}px + var(--repulsion-x)), calc(${(moveY1 + moveY2) / 2}px + var(--repulsion-y))) rotate(${rotation1 + rotation2}deg) scale(var(--repulsion-scale)); 
                                opacity: ${opacity2}; 
                            }
                        }
                    `;
                    
                    // Ajouter l'animation au stylesheet
                    styleSheet.sheet.insertRule(keyframes, styleSheet.sheet.cssRules.length);
                    
                    // Ajouter la particule au conteneur
                    particlesContainer.appendChild(particle);
                }
            }
            
            // Fonction de répulsion des particules
            function repulseParticles() {
                particles.forEach(particleData => {
                    const particle = particleData.element;
                    const rect = particle.getBoundingClientRect();
                    const particleX = rect.left + rect.width / 2;
                    const particleY = rect.top + rect.height / 2;
                    
                    // Calculer la distance entre la souris et la particule
                    const deltaX = mouseX - particleX;
                    const deltaY = mouseY - particleY;
                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    
                    if (distance < REPULSION_DISTANCE && distance > 0) {
                        // Calculer la force de répulsion (plus fort quand c'est proche)
                        const force = (REPULSION_DISTANCE - distance) / REPULSION_DISTANCE * REPULSION_FORCE;
                        
                        // Calculer la direction de répulsion (opposée au curseur)
                        const angle = Math.atan2(deltaY, deltaX);
                        const repulsionX = -Math.cos(angle) * force;
                        const repulsionY = -Math.sin(angle) * force;
                        
                        // Utiliser les variables CSS pour ajouter la répulsion à l'animation
                        particle.style.setProperty('--repulsion-x', `${repulsionX}px`);
                        particle.style.setProperty('--repulsion-y', `${repulsionY}px`);
                        particle.style.setProperty('--repulsion-scale', '1.3');
                        particle.style.filter = 'brightness(1.4)';
                        particle.style.zIndex = '10';
                        
                        particleData.isRepulsed = true;
                    } else if (particleData.isRepulsed) {
                        // Remettre la particule à sa position normale
                        particle.style.setProperty('--repulsion-x', '0px');
                        particle.style.setProperty('--repulsion-y', '0px');
                        particle.style.setProperty('--repulsion-scale', '1');
                        particle.style.filter = '';
                        particle.style.zIndex = '';
                        
                        particleData.isRepulsed = false;
                    }
                });
            }
            
            // Suivre la position de la souris
            document.addEventListener('mousemove', function(e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                // Appliquer la répulsion seulement sur desktop
                if (!isTouchDevice()) {
                    repulseParticles();
                }
            });
            
            // Réinitialiser les particules quand la souris quitte la fenêtre
            document.addEventListener('mouseleave', function() {
                particles.forEach(particleData => {
                    const particle = particleData.element;
                    particle.style.setProperty('--repulsion-x', '0px');
                    particle.style.setProperty('--repulsion-y', '0px');
                    particle.style.setProperty('--repulsion-scale', '1');
                    particle.style.filter = '';
                    particle.style.zIndex = '';
                    particleData.isRepulsed = false;
                });
            });
            
            // Générer les particules au chargement
            createParticles();
            
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
            
            // Animer les sections dropdown avec délai
            const dropdownSections = document.querySelectorAll('.dropdown-section');
            dropdownSections.forEach(section => {
                const delay = section.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    section.classList.add('visible');
                }, parseInt(delay) + 800);
            });
            
            // Gestion des menus déroulants
            dropdownSections.forEach(section => {
                const header = section.querySelector('.dropdown-header');
                
                header.addEventListener('click', function() {
                    // Fermer tous les autres dropdowns
                    dropdownSections.forEach(otherSection => {
                        if (otherSection !== section && otherSection.classList.contains('active')) {
                            otherSection.classList.remove('active');
                        }
                    });
                    
                    // Toggle du dropdown actuel
                    section.classList.toggle('active');
                });
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
            
            // Gestion des particules qui suivent la souris sur toute la page
            if (!isTouchDevice()) {
                document.addEventListener('mousemove', function(e) {
                    const xPercent = (e.clientX / window.innerWidth) * 100;
                    const yPercent = (e.clientY / window.innerHeight) * 100;
                    document.body.style.setProperty('--mouse-x', `${xPercent}%`);
                    document.body.style.setProperty('--mouse-y', `${yPercent}%`);
                });
            }
            
            // Effet 3D SANS enfoncement sur les cartes
            if (!isTouchDevice()) {
                serviceCards.forEach(card => {
                    const container = card.querySelector('.card-3d-container');
                    
                    card.addEventListener('mousemove', function(e) {
                        const rect = this.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        
                        // Rotation 3D uniquement, SANS translateY
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