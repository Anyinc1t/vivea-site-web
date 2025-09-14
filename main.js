// Vivéa - Solutions de Filtration d'Eau - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 188, 212, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinksContainer.classList.toggle('active');
            
            // Toggle hamburger icon
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Form handling avec solutions pour site publié
    const ctaForm = document.querySelector('.cta-form');
    
    if (ctaForm) {
        const submitBtn = ctaForm.querySelector('.btn');
        const inputs = ctaForm.querySelectorAll('input');
        
        ctaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Collecte des données du formulaire
            const formData = {};
            inputs.forEach(input => {
                const placeholder = input.placeholder.toLowerCase();
                if (placeholder.includes('nom')) formData.nom = input.value.trim();
                if (placeholder.includes('téléphone')) formData.telephone = input.value.trim();
                if (placeholder.includes('email')) formData.email = input.value.trim();
            });
            
            // Validation
            const validation = window.viveaFormHandler.validateTestRequest(formData);
            
            if (!validation.isValid) {
                // Afficher erreurs de validation
                inputs.forEach((input, index) => {
                    if (validation.errors.length > index) {
                        input.style.borderLeft = '4px solid #e74c3c';
                        input.style.background = 'rgba(231, 76, 60, 0.05)';
                    }
                });
                
                // Animation d'erreur
                ctaForm.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    ctaForm.style.animation = '';
                }, 500);
                
                // Afficher le premier message d'erreur
                showErrorMessage(validation.errors[0]);
                return;
            }
            
            // Données valides - styles de succès
            inputs.forEach(input => {
                input.style.borderLeft = '4px solid #00bcd4';
                input.style.background = 'rgba(0, 188, 212, 0.05)';
            });
            
            // Animation de soumission
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            submitBtn.style.background = '#6c757d';
            submitBtn.disabled = true;
            
            try {
                // Générer un ID de suivi
                const trackingId = window.viveaFormHandler.generateTrackingId();
                formData.trackingId = trackingId;
                
                // Soumettre selon l'environnement (développement ou production)
                const result = await window.viveaFormHandler.submitTestRequest(formData);
                
                console.log('Demande soumise:', result);
                
                // Sauvegarder également en local comme backup
                window.viveaFormHandler.saveToLocalStorage(formData);
                
                // Succès
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Demande envoyée !';
                submitBtn.style.background = '#4caf50';
                
                setTimeout(() => {
                    showSuccessMessage(trackingId, result.service);
                }, 500);
                
                // Réinitialiser le formulaire après succès
                setTimeout(() => {
                    inputs.forEach(input => {
                        input.value = '';
                        input.style.borderLeft = 'none';
                        input.style.background = 'rgba(255, 255, 255, 0.95)';
                    });
                    
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
                
            } catch (error) {
                console.error('Erreur lors de la soumission:', error);
                
                // Sauvegarder quand même en local
                const backupResult = window.viveaFormHandler.saveToLocalStorage(formData);
                
                if (backupResult.success) {
                    submitBtn.innerHTML = '<i class="fas fa-info-circle"></i> Demande sauvegardée';
                    submitBtn.style.background = '#ff9800';
                    
                    showInfoMessage('Votre demande a été sauvegardée. Nous vous contacterons bientôt !');
                } else {
                    submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur - Réessayer';
                    submitBtn.style.background = '#e74c3c';
                    
                    showErrorMessage('Erreur technique. Veuillez nous appeler directement au 1-800-VIVEA-1');
                }
                
                // Permettre de réessayer
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // Product cards interaction
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const button = card.querySelector('.btn');
        
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Show product details modal (simulation)
                const productName = card.querySelector('h3').textContent;
                showProductModal(productName);
            });
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animateElements = document.querySelectorAll('.vision-card, .problem-card, .comparison-card, .product-card, .impact-card, .process-step');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Counter animation for statistics
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Add statistics counters (example)
    const stats = [
        { selector: '.stat-families', target: 5000 },
        { selector: '.stat-bottles', target: 12000 },
        { selector: '.stat-savings', target: 1200 }
    ];

    stats.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            observer.observe(element);
            element.addEventListener('animationstart', () => {
                animateCounter(element, stat.target);
            });
        }
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-bg');
        
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Dynamic trust indicators
    const trustItems = document.querySelectorAll('.trust-item');
    
    trustItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 500 + (index * 200));
        
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease-out';
    });

    // Utility functions
    function showSuccessMessage(trackingId, service) {
        const message = document.createElement('div');
        message.className = 'success-message';
        const serviceMessage = service === 'mailto' ? 
            '<p class="service-info"><i class="fas fa-envelope"></i> Votre client email va s\'ouvrir automatiquement</p>' :
            '';
            
        message.innerHTML = `
            <div class="message-content">
                <i class="fas fa-check-circle"></i>
                <h3>Merci pour votre demande !</h3>
                <p>Notre équipe vous contactera dans les 24h pour programmer votre test d'eau gratuit.</p>
                ${trackingId ? `<p class="tracking"><strong>Numéro de suivi:</strong> ${trackingId}</p>` : ''}
                ${serviceMessage}
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease-out;
        `;
        
        const content = message.querySelector('.message-content');
        content.style.cssText = `
            background: white;
            padding: 40px 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(0, 188, 212, 0.3);
            transform: scale(0.8);
            transition: all 0.3s ease-out;
        `;
        
        content.querySelector('i').style.cssText = `
            font-size: 48px;
            color: #4caf50;
            margin-bottom: 16px;
            display: block;
        `;
        
        content.querySelector('h3').style.cssText = `
            color: #2c3e50;
            margin-bottom: 12px;
            font-family: 'Playfair Display', serif;
        `;
        
        content.querySelector('p').style.cssText = `
            color: #6c757d;
            line-height: 1.6;
        `;
        
        document.body.appendChild(message);
        
        // Animate in
        setTimeout(() => {
            message.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);
        
        // Auto close after 4 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 4000);
        
        // Close on click
        message.addEventListener('click', function(e) {
            if (e.target === message) {
                message.style.opacity = '0';
                content.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 300);
            }
        });
    }

    function showErrorMessage(errorText) {
        const message = document.createElement('div');
        message.className = 'error-message';
        message.innerHTML = `
            <div class="message-content error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur de validation</h3>
                <p>${errorText}</p>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease-out;
        `;
        
        const content = message.querySelector('.message-content');
        content.style.cssText = `
            background: white;
            padding: 40px 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(231, 76, 60, 0.3);
            transform: scale(0.8);
            transition: all 0.3s ease-out;
            border-left: 4px solid #e74c3c;
        `;
        
        content.querySelector('i').style.cssText = `
            font-size: 48px;
            color: #e74c3c;
            margin-bottom: 16px;
            display: block;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);
        
        setTimeout(() => {
            message.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
        
        message.addEventListener('click', function(e) {
            if (e.target === message) {
                message.style.opacity = '0';
                content.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 300);
            }
        });
    }

    function showInfoMessage(infoText) {
        const message = document.createElement('div');
        message.className = 'info-message';
        message.innerHTML = `
            <div class="message-content info">
                <i class="fas fa-info-circle"></i>
                <h3>Information</h3>
                <p>${infoText}</p>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease-out;
        `;
        
        const content = message.querySelector('.message-content');
        content.style.cssText = `
            background: white;
            padding: 40px 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(255, 152, 0, 0.3);
            transform: scale(0.8);
            transition: all 0.3s ease-out;
            border-left: 4px solid #ff9800;
        `;
        
        content.querySelector('i').style.cssText = `
            font-size: 48px;
            color: #ff9800;
            margin-bottom: 16px;
            display: block;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 10);
        
        setTimeout(() => {
            message.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 4000);
        }, 4000);
        
        message.addEventListener('click', function(e) {
            if (e.target === message) {
                message.style.opacity = '0';
                content.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 300);
            }
        });
    }

    function showProductModal(productName) {
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        
        const isBase = productName.includes('Base');
        const productInfo = isBase ? {
            name: 'Vivéa Base',
            filtration: '10 microns',
            features: [
                'Retient particules visibles',
                'Réduit le chlore et ses dérivés',
                'Améliore le goût et supprime les odeurs',
                'Réduit la dureté de l\'eau',
                'Installation simple sous évier'
            ],
            ideal: 'Idéal pour améliorer le goût et l\'odeur de l\'eau du robinet'
        } : {
            name: 'Vivéa Premium',
            filtration: '0,5 micron',
            features: [
                'Filtre 20× plus fin que le modèle Base',
                'Retient microplastiques, bactéries, cysts',
                'Élimine résidus pharmaceutiques',
                'Protection contre plomb et cyanure',
                'Certification NSF/ANSI 53'
            ],
            ideal: 'Protection santé supérieure pour toute la famille'
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${productInfo.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-highlight">
                        <i class="fas fa-filter"></i>
                        <span>Filtration ${productInfo.filtration}</span>
                    </div>
                    <p class="product-description">${productInfo.ideal}</p>
                    <ul class="modal-features">
                        ${productInfo.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                    <div class="modal-cta">
                        <button class="btn btn-primary">
                            <i class="fas fa-calendar-alt"></i>
                            Réserver un test pour ce produit
                        </button>
                        <p class="modal-note">Notre expert vous présentera ce produit lors du test gratuit</p>
                    </div>
                </div>
            </div>
        `;
        
        // Modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease-out;
            padding: 20px;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 188, 212, 0.3);
            transform: scale(0.8);
            transition: all 0.3s ease-out;
        `;
        
        // Add more specific styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-header {
                padding: 30px 30px 20px;
                border-bottom: 1px solid rgba(0, 188, 212, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-header h3 {
                font-family: 'Playfair Display', serif;
                font-size: 1.5rem;
                color: #2c3e50;
                margin: 0;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                color: #6c757d;
                cursor: pointer;
                padding: 5px;
                line-height: 1;
            }
            .modal-close:hover {
                color: #00bcd4;
            }
            .modal-body {
                padding: 20px 30px 30px;
            }
            .product-highlight {
                background: linear-gradient(135deg, #00bcd4, #008ba3);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .product-description {
                font-style: italic;
                color: #6c757d;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            .modal-features {
                list-style: none;
                margin-bottom: 30px;
            }
            .modal-features li {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
                color: #2c3e50;
            }
            .modal-features i {
                color: #00bcd4;
                font-size: 14px;
            }
            .modal-cta {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid rgba(0, 188, 212, 0.1);
            }
            .modal-note {
                margin-top: 15px;
                font-size: 0.9rem;
                color: #6c757d;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
        
        // Close modal functionality
        const closeModal = () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });
        
        // CTA button in modal
        modal.querySelector('.modal-cta .btn').addEventListener('click', function() {
            closeModal();
            document.querySelector('#cta').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Add shake animation for form validation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    // Enhanced hover effects for cards
    const hoverCards = document.querySelectorAll('.vision-card, .problem-card, .product-card, .impact-card');
    
    hoverCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Loading animation complete
    document.body.classList.add('loaded');
});

// Add CSS for loaded state
const loadedStyle = document.createElement('style');
loadedStyle.textContent = `
    body:not(.loaded) .hero-content {
        opacity: 0;
        transform: translateY(30px);
    }
    
    body.loaded .hero-content {
        opacity: 1;
        transform: translateY(0);
        transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(loadedStyle);