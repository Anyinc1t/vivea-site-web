// Vivéa - Gestionnaire de Formulaire pour Site Publié
// Solution alternative pour l'envoi de formulaires sans API backend

class ViveaFormHandler {
    constructor() {
        this.isProduction = !window.location.hostname.includes('localhost');
        console.log('Mode production:', this.isProduction);
    }

    /**
     * Valider les données du formulaire
     */
    validateTestRequest(data) {
        const errors = [];
        
        if (!data.nom || data.nom.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!data.telephone || !/^[+]?[0-9\s\-().]{10,}$/.test(data.telephone)) {
            errors.push('Veuillez saisir un numéro de téléphone valide');
        }
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Veuillez saisir une adresse email valide');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Soumettre le formulaire selon l'environnement
     */
    async submitTestRequest(formData) {
        if (this.isProduction) {
            return await this.submitToEmailService(formData);
        } else {
            // En développement, utiliser l'API locale si disponible
            try {
                const response = await fetch('/tables/test_requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nom: formData.nom,
                        telephone: formData.telephone,
                        email: formData.email,
                        statut: 'nouveau',
                        source_acquisition: 'site_web',
                        date_souhaitee: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        creneau_prefere: 'flexible',
                        produit_interesse: 'non_specifie',
                        notes: 'Demande via formulaire de contact du site web'
                    })
                });

                if (!response.ok) throw new Error('API non disponible');
                return await response.json();
            } catch (error) {
                console.log('API locale non disponible, utilisation du service email');
                return await this.submitToEmailService(formData);
            }
        }
    }

    /**
     * Envoyer via service email (production)
     */
    async submitToEmailService(formData) {
        // Solution 1: Cloudflare Pages Function (recommandée)
        try {
            const response = await fetch('/functions/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                return { 
                    success: true, 
                    service: 'cloudflare-pages',
                    trackingId: result.trackingId 
                };
            } else {
                throw new Error(result.message || 'Cloudflare Pages error');
            }
        } catch (error) {
            console.log('Cloudflare Pages non disponible, essai Formspree...', error);
            return await this.submitToFormspree(formData);
        }
    }

    /**
     * Fallback vers Formspree
     */
    async submitToFormspree(formData) {
        try {
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.nom,
                    phone: formData.telephone,
                    email: formData.email,
                    subject: 'Nouvelle demande de test d\'eau Vivéa',
                    message: `
Nouvelle demande de test d'eau gratuit:

Nom: ${formData.nom}
Téléphone: ${formData.telephone}
Email: ${formData.email}
Date de demande: ${new Date().toLocaleDateString('fr-CA')}
Source: Site web Vivéa

Merci de contacter ce prospect dans les 24h.
                    `.trim()
                })
            });

            if (response.ok) {
                return { success: true, service: 'formspree' };
            } else {
                throw new Error('Formspree error');
            }
        } catch (error) {
            console.log('Formspree non disponible, utilisation du mailto');
            return this.submitViaMailto(formData);
        }
    }

    /**
     * Solution de fallback: mailto
     */
    submitViaMailto(formData) {
        const subject = encodeURIComponent('Nouvelle demande de test d\'eau Vivéa');
        const body = encodeURIComponent(`
Nouvelle demande de test d'eau gratuit:

Nom: ${formData.nom}
Téléphone: ${formData.telephone}
Email: ${formData.email}
Date de demande: ${new Date().toLocaleDateString('fr-CA')}

Merci de contacter ce prospect dans les 24h.
        `.trim());

        // Ouvrir le client email par défaut
        window.location.href = `mailto:contact@vivea.ca?subject=${subject}&body=${body}`;
        
        return { 
            success: true, 
            service: 'mailto',
            message: 'Votre client email va s\'ouvrir avec les informations pré-remplies.'
        };
    }

    /**
     * Enregistrer localement en attendant la synchronisation
     */
    saveToLocalStorage(formData) {
        try {
            const requests = JSON.parse(localStorage.getItem('vivea_requests') || '[]');
            const newRequest = {
                id: Date.now().toString(),
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'pending_sync'
            };
            
            requests.push(newRequest);
            localStorage.setItem('vivea_requests', JSON.stringify(requests));
            
            return { success: true, stored: true };
        } catch (error) {
            console.error('Erreur localStorage:', error);
            return { success: false, error: 'Storage error' };
        }
    }

    /**
     * Récupérer les demandes en attente
     */
    getPendingRequests() {
        try {
            return JSON.parse(localStorage.getItem('vivea_requests') || '[]');
        } catch (error) {
            return [];
        }
    }

    /**
     * Formater un numéro de téléphone
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }

    /**
     * Générer un ID de suivi pour le client
     */
    generateTrackingId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `VIV-${timestamp}-${random}`.toUpperCase();
    }
}

// Instance globale
window.viveaFormHandler = new ViveaFormHandler();

// Configuration pour différents services email
window.VIVEA_CONFIG = {
    // Cloudflare Pages (principal)
    cloudflare: {
        endpoint: '/functions/submit-form'
    },
    
    // Pour utiliser Formspree (fallback):
    // 1. Aller sur formspree.io
    // 2. Créer un compte
    // 3. Créer un nouveau formulaire
    // 4. Remplacer YOUR_FORM_ID ci-dessous
    formspree: {
        endpoint: 'https://formspree.io/f/YOUR_FORM_ID'
    },
    
    // Email de contact par défaut
    contact: {
        email: 'contact@vivea.ca',
        phone: '1-800-VIVEA-1'
    },
    
    // Détection environnement
    isCloudflarePages: () => {
        return window.location.hostname.includes('.pages.dev') || 
               window.location.hostname.includes('vivea.ca');
    }
};