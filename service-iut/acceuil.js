// Détection si l'appareil est tactile
function isTouchDevice() {
    return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
}

// Configuration des particules connectées
const PARTICLE_CONFIG = {
    count: 90, // Nombre de particules
    colors: {
        particle: '#590036', // Couleur des particules (primary color)
        line: 'rgba(89, 0, 54, 0.15)' // Couleur des lignes de connexion
    },
    size: {
        min: 2,
        max: 4
    },
    speed: {
        min: 0.5,
        max: 1.5
    },
    connection: {
        distance: 150, // Distance maximale pour connecter deux particules
        limit: 3 // Nombre maximum de connexions par particule
    },
    mouse: {
        distance: 200, // Distance d'influence de la souris
        force: 0.03 // Force d'attraction/répulsion
    }
};

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (PARTICLE_CONFIG.size.max - PARTICLE_CONFIG.size.min) + PARTICLE_CONFIG.size.min;
        
        // Vitesse aléatoire dans toutes les directions
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (PARTICLE_CONFIG.speed.max - PARTICLE_CONFIG.speed.min) + PARTICLE_CONFIG.speed.min;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.connections = [];
    }
    
    update(mouseX, mouseY) {
        // Mouvement de base
        this.x += this.vx;
        this.y += this.vy;
        
        // Influence de la souris
        if (mouseX !== null && mouseY !== null) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < PARTICLE_CONFIG.mouse.distance) {
                const force = (PARTICLE_CONFIG.mouse.distance - distance) / PARTICLE_CONFIG.mouse.distance;
                const angle = Math.atan2(dy, dx);
                
                // Attraction vers la souris
                this.vx += Math.cos(angle) * force * PARTICLE_CONFIG.mouse.force;
                this.vy += Math.sin(angle) * force * PARTICLE_CONFIG.mouse.force;
                
                // Limiter la vitesse
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (currentSpeed > PARTICLE_CONFIG.speed.max * 2) {
                    this.vx = (this.vx / currentSpeed) * PARTICLE_CONFIG.speed.max * 2;
                    this.vy = (this.vy / currentSpeed) * PARTICLE_CONFIG.speed.max * 2;
                }
            }
        }
        
        // Ralentissement très léger pour garder le mouvement
        this.vx *= 0.995;
        this.vy *= 0.995;
        
        // Vitesse minimale pour éviter l'arrêt complet
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed < PARTICLE_CONFIG.speed.min) {
            const angle = Math.atan2(this.vy, this.vx);
            this.vx = Math.cos(angle) * PARTICLE_CONFIG.speed.min;
            this.vy = Math.sin(angle) * PARTICLE_CONFIG.speed.min;
        }
        
        // Rebondir sur les bords avec plus de marge
        const margin = 50;
        if (this.x < -margin) {
            this.x = this.canvas.width + margin;
        } else if (this.x > this.canvas.width + margin) {
            this.x = -margin;
        }
        
        if (this.y < -margin) {
            this.y = this.canvas.height + margin;
        } else if (this.y > this.canvas.height + margin) {
            this.y = -margin;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_CONFIG.colors.particle;
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = null;
        this.mouseY = null;
        
        this.init();
    }
    
    init() {
        // Configuration du canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        // Pas de couleur de fond sur le canvas pour garder le fond du body
        
        // Ajouter au DOM
        document.getElementById('particlesContainer').appendChild(this.canvas);
        
        // Redimensionnement
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Créer les particules
        for (let i = 0; i < PARTICLE_CONFIG.count; i++) {
            this.particles.push(new Particle(this.canvas));
        }
        
        // Événements souris seulement sur desktop
        if (!isTouchDevice()) {
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
            
            document.addEventListener('mouseleave', () => {
                this.mouseX = null;
                this.mouseY = null;
            });
        }
        
        // Démarrer l'animation
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    connectParticles() {
        // Réinitialiser les connexions
        this.particles.forEach(p => p.connections = []);
        
        // Trouver les connexions
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < PARTICLE_CONFIG.connection.distance) {
                    if (p1.connections.length < PARTICLE_CONFIG.connection.limit && 
                        p2.connections.length < PARTICLE_CONFIG.connection.limit) {
                        p1.connections.push({particle: p2, distance: distance});
                        p2.connections.push({particle: p1, distance: distance});
                    }
                }
            }
        }
    }
    
    drawConnections() {
        this.ctx.strokeStyle = PARTICLE_CONFIG.colors.line;
        this.ctx.lineWidth = 1;
        
        const drawnConnections = new Set();
        
        this.particles.forEach(p1 => {
            p1.connections.forEach(conn => {
                const p2 = conn.particle;
                const connectionId = `${Math.min(p1.x, p2.x)}-${Math.min(p1.y, p2.y)}-${Math.max(p1.x, p2.x)}-${Math.max(p1.y, p2.y)}`;
                
                if (!drawnConnections.has(connectionId)) {
                    drawnConnections.add(connectionId);
                    
                    // Opacité basée sur la distance
                    const opacity = 1 - (conn.distance / PARTICLE_CONFIG.connection.distance);
                    this.ctx.strokeStyle = `rgba(89, 0, 54, ${opacity * 0.15})`;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });
        });
    }
    
    animate() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Mettre à jour et dessiner les particules
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
        });
        
        // Connecter les particules
        this.connectParticles();
        
        // Dessiner les connexions
        this.drawConnections();
        
        // Dessiner les particules
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        
        // Boucle d'animation
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Créer le nouveau système de particules connectées
    const particleSystem = new ParticleSystem();
    
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
    
    // Effet 3D sur les cartes - COMPLÈTEMENT DÉSACTIVÉ
    /*
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
    */
    
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