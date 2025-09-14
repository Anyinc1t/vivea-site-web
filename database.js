// Vivéa - Gestionnaire de Base de Données
// Gestion des interactions avec l'API RESTful pour les tables

class ViveaDatabase {
    constructor() {
        this.baseUrl = '/tables';
    }

    // ===============================
    // GESTION DES DEMANDES DE TESTS
    // ===============================
    
    /**
     * Créer une nouvelle demande de test d'eau
     * @param {Object} requestData - Données de la demande
     * @returns {Promise<Object>} - Demande créée
     */
    async createTestRequest(requestData) {
        try {
            const response = await fetch(`${this.baseUrl}/test_requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: requestData.nom || '',
                    telephone: requestData.telephone || '',
                    email: requestData.email || '',
                    adresse: requestData.adresse || '',
                    ville: requestData.ville || '',
                    code_postal: requestData.code_postal || '',
                    statut: 'nouveau',
                    date_souhaitee: requestData.date_souhaitee || null,
                    creneau_prefere: requestData.creneau_prefere || 'flexible',
                    produit_interesse: requestData.produit_interesse || 'non_specifie',
                    source_acquisition: 'site_web',
                    notes: requestData.notes || ''
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création de la demande:', error);
            throw error;
        }
    }

    /**
     * Récupérer toutes les demandes de tests
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Object>} - Liste des demandes
     */
    async getTestRequests(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.statut) params.append('search', `statut:${filters.statut}`);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.sort) params.append('sort', filters.sort);

            const response = await fetch(`${this.baseUrl}/test_requests?${params}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des demandes:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour le statut d'une demande
     * @param {string} requestId - ID de la demande
     * @param {string} newStatut - Nouveau statut
     * @returns {Promise<Object>} - Demande mise à jour
     */
    async updateTestRequestStatus(requestId, newStatut) {
        try {
            const response = await fetch(`${this.baseUrl}/test_requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    statut: newStatut
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            throw error;
        }
    }

    // ===============================
    // GESTION DES PRODUITS
    // ===============================

    /**
     * Récupérer tous les produits
     * @returns {Promise<Array>} - Liste des produits
     */
    async getProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/produits?sort=populaire,type`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            return [];
        }
    }

    /**
     * Récupérer un produit par son ID
     * @param {string} productId - ID du produit
     * @returns {Promise<Object>} - Données du produit
     */
    async getProduct(productId) {
        try {
            const response = await fetch(`${this.baseUrl}/produits/${productId}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error);
            throw error;
        }
    }

    // ===============================
    // GESTION DES TÉMOIGNAGES
    // ===============================

    /**
     * Récupérer les témoignages publiés
     * @param {number} limit - Nombre de témoignages à récupérer
     * @returns {Promise<Array>} - Liste des témoignages
     */
    async getTestimonials(limit = 6) {
        try {
            const response = await fetch(`${this.baseUrl}/testimonials?search=publie:true&sort=-date_temoignage&limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des témoignages:', error);
            return [];
        }
    }

    /**
     * Récupérer les témoignages featured
     * @returns {Promise<Array>} - Témoignages mis en avant
     */
    async getFeaturedTestimonials() {
        try {
            const response = await fetch(`${this.baseUrl}/testimonials?search=featured:true&search=publie:true&limit=3`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des témoignages featured:', error);
            return [];
        }
    }

    // ===============================
    // GESTION DES STATISTIQUES
    // ===============================

    /**
     * Récupérer les statistiques pour la page d'accueil
     * @returns {Promise<Array>} - Statistiques d'accueil
     */
    async getHomeStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}/statistiques?search=affiche_accueil:true&sort=ordre_affichage`);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            return [];
        }
    }

    /**
     * Mettre à jour une statistique
     * @param {string} statId - ID de la statistique
     * @param {number} newValue - Nouvelle valeur
     * @returns {Promise<Object>} - Statistique mise à jour
     */
    async updateStatistic(statId, newValue) {
        try {
            const response = await fetch(`${this.baseUrl}/statistiques/${statId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    valeur: newValue,
                    date_mise_a_jour: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la statistique:', error);
            throw error;
        }
    }

    // ===============================
    // MÉTHODES UTILITAIRES
    // ===============================

    /**
     * Valider les données d'une demande de test
     * @param {Object} data - Données à valider
     * @returns {Object} - Résultat de validation
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
     * Formater les données pour l'affichage
     * @param {Object} data - Données brutes
     * @returns {Object} - Données formatées
     */
    formatDisplayData(data) {
        return {
            ...data,
            created_at_formatted: new Date(data.created_at).toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            telephone_formatted: this.formatPhoneNumber(data.telephone),
            statut_label: this.getStatusLabel(data.statut)
        };
    }

    /**
     * Formater un numéro de téléphone
     * @param {string} phone - Numéro brut
     * @returns {string} - Numéro formaté
     */
    formatPhoneNumber(phone) {
        if (!phone) return '';
        
        // Supprimer tous les caractères non numériques
        const cleaned = phone.replace(/\D/g, '');
        
        // Format canadien standard (xxx) xxx-xxxx
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        
        return phone;
    }

    /**
     * Obtenir le label d'un statut
     * @param {string} statut - Code du statut
     * @returns {string} - Label du statut
     */
    getStatusLabel(statut) {
        const labels = {
            'nouveau': 'Nouvelle demande',
            'confirme': 'Confirmé',
            'planifie': 'Planifié',
            'realise': 'Réalisé',
            'annule': 'Annulé'
        };
        
        return labels[statut] || statut;
    }

    /**
     * Générer des statistiques de performance
     * @returns {Promise<Object>} - Statistiques calculées
     */
    async generatePerformanceStats() {
        try {
            const [requests, testimonials] = await Promise.all([
                this.getTestRequests({ limit: 1000 }),
                this.getTestimonials(1000)
            ]);

            const totalRequests = requests.total || 0;
            const completedRequests = requests.data?.filter(r => r.statut === 'realise').length || 0;
            const avgSatisfaction = testimonials.reduce((acc, t) => acc + (t.note_satisfaction || 0), 0) / testimonials.length || 0;

            return {
                totalRequests,
                completedRequests,
                conversionRate: totalRequests > 0 ? (completedRequests / totalRequests * 100).toFixed(1) : 0,
                avgSatisfaction: avgSatisfaction.toFixed(1),
                totalTestimonials: testimonials.length
            };
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            return {};
        }
    }
}

// Instance globale de la base de données
window.viveaDB = new ViveaDatabase();

// Export pour utilisation en modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ViveaDatabase;
}