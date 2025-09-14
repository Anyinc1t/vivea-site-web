// Cloudflare Pages Function pour traiter les soumissions de formulaire
// Ce fichier sera exécuté automatiquement sur Cloudflare Pages

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Traitement CORS
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Gestion des requêtes OPTIONS (preflight)
        if (request.method === 'OPTIONS') {
            return new Response(null, { 
                status: 200, 
                headers: corsHeaders 
            });
        }

        // Parser les données du formulaire
        const formData = await request.json();
        
        // Validation des données requises
        if (!formData.nom || !formData.email || !formData.telephone) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Données manquantes',
                message: 'Nom, email et téléphone sont requis'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Email invalide',
                message: 'Veuillez saisir une adresse email valide'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }

        // Générer un ID de suivi unique
        const trackingId = `VIV-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        
        // Préparer les données pour l'email
        const emailData = {
            to: env.CONTACT_EMAIL || 'contact@vivea.ca',
            from: env.FROM_EMAIL || 'noreply@vivea.ca',
            subject: `Nouvelle demande de test d'eau - ${trackingId}`,
            html: generateEmailHTML(formData, trackingId),
            text: generateEmailText(formData, trackingId)
        };

        // Envoyer l'email via l'API Cloudflare Email (si configurée)
        let emailResult = null;
        if (env.RESEND_API_KEY) {
            emailResult = await sendViaResend(emailData, env.RESEND_API_KEY);
        } else if (env.SENDGRID_API_KEY) {
            emailResult = await sendViaSendGrid(emailData, env.SENDGRID_API_KEY);
        }

        // Sauvegarder dans Cloudflare KV (optionnel)
        if (env.VIVEA_KV) {
            const requestData = {
                id: trackingId,
                ...formData,
                timestamp: new Date().toISOString(),
                ip: request.headers.get('CF-Connecting-IP'),
                country: request.cf?.country || 'Unknown'
            };
            
            await env.VIVEA_KV.put(
                `request:${trackingId}`, 
                JSON.stringify(requestData),
                { expirationTtl: 60 * 60 * 24 * 90 } // 90 jours
            );
        }

        // Réponse de succès
        return new Response(JSON.stringify({
            success: true,
            trackingId: trackingId,
            message: 'Votre demande a été envoyée avec succès',
            emailSent: !!emailResult,
            service: 'cloudflare-pages'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        console.error('Erreur dans submit-form:', error);
        
        return new Response(JSON.stringify({
            success: false,
            error: 'Erreur serveur',
            message: 'Une erreur technique est survenue. Veuillez réessayer.'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Envoyer email via Resend.com
async function sendViaResend(emailData, apiKey) {
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            throw new Error(`Resend API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur Resend:', error);
        return null;
    }
}

// Envoyer email via SendGrid
async function sendViaSendGrid(emailData, apiKey) {
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [{
                    to: [{ email: emailData.to }]
                }],
                from: { email: emailData.from },
                subject: emailData.subject,
                content: [
                    { type: 'text/html', value: emailData.html },
                    { type: 'text/plain', value: emailData.text }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`SendGrid API error: ${response.status}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Erreur SendGrid:', error);
        return null;
    }
}

// Générer le contenu HTML de l'email
function generateEmailHTML(formData, trackingId) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nouvelle demande de test d'eau - Vivéa</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00bcd4, #008ba3); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #00bcd4; }
        .label { font-weight: 600; color: #00bcd4; margin-bottom: 5px; }
        .value { color: #333; }
        .tracking { background: #e3f2fd; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .btn { background: #00bcd4; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; }
        .footer { text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Nouvelle Demande de Test d'Eau</h1>
            <p>Une nouvelle famille souhaite découvrir la qualité de son eau</p>
        </div>
        
        <div class="content">
            <div class="tracking">
                <strong>Numéro de suivi : ${trackingId}</strong><br>
                <small>Reçu le ${new Date().toLocaleDateString('fr-CA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</small>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <div class="label">👤 Nom complet</div>
                    <div class="value">${formData.nom}</div>
                </div>
                <div class="info-item">
                    <div class="label">📧 Email</div>
                    <div class="value">${formData.email}</div>
                </div>
                <div class="info-item">
                    <div class="label">📞 Téléphone</div>
                    <div class="value">${formData.telephone}</div>
                </div>
                <div class="info-item">
                    <div class="label">📅 Date de demande</div>
                    <div class="value">${new Date().toLocaleDateString('fr-CA')}</div>
                </div>
            </div>

            ${formData.adresse ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="label">🏠 Adresse</div>
                    <div class="value">${formData.adresse}</div>
                </div>
            ` : ''}

            ${formData.notes ? `
                <div class="info-item" style="margin-top: 20px;">
                    <div class="label">📝 Notes</div>
                    <div class="value">${formData.notes}</div>
                </div>
            ` : ''}

            <div class="cta">
                <p><strong>⚡ Action requise :</strong> Contacter ce prospect dans les 24h</p>
                <a href="tel:${formData.telephone}" class="btn">📞 Appeler maintenant</a>
                <a href="mailto:${formData.email}" class="btn" style="margin-left: 10px;">📧 Envoyer un email</a>
            </div>

            <div class="footer">
                <p>🌊 Vivéa - Solutions de Filtration d'Eau</p>
                <p>Demande reçue via le site web • Système automatisé</p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// Générer le contenu texte de l'email
function generateEmailText(formData, trackingId) {
    return `
NOUVELLE DEMANDE DE TEST D'EAU - VIVÉA
=====================================

Numéro de suivi : ${trackingId}
Date de réception : ${new Date().toLocaleDateString('fr-CA')}

INFORMATIONS CLIENT :
--------------------
Nom : ${formData.nom}
Email : ${formData.email}
Téléphone : ${formData.telephone}
${formData.adresse ? `Adresse : ${formData.adresse}` : ''}
${formData.notes ? `Notes : ${formData.notes}` : ''}

ACTION REQUISE :
---------------
⚡ Contacter ce prospect dans les 24h
📞 Téléphone : ${formData.telephone}
📧 Email : ${formData.email}

---
🌊 Vivéa - Solutions de Filtration d'Eau
Demande reçue via le site web
    `.trim();
}