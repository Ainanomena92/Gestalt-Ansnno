document.addEventListener('alpine:init', () => {
    Alpine.data('contactForm', () => ({
        // Nos différents états possibles
        state: 'idle', 
        errorMessage: '', 
        isDevMode: false, // N'oubliez pas de passer à false en production !

        // Notre outil de vérification d'email
        isValidEmail(email) {
            // Cette formule vérifie le format basique d'un email
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },

        async submit(e) {
            // 1. Sécurité anti-spam (Honeypot)
            if (e.target._gotcha.value !== '') return;
            
            // 2. On récupère les données du formulaire
            const formData = new FormData(e.target);
            // Assurez-vous que votre champ email dans le HTML a bien l'attribut name="email"
            const userEmail = formData.get('email'); 

            // 3. L'Étape de Validation
            if (!this.isValidEmail(userEmail)) {
                this.state = 'invalid';
                this.errorMessage = "Veuillez saisir une adresse e-mail valide.";
                return; // 🛑 On stoppe la fonction ici, on n'envoie rien.
            }

            // Si tout est bon, on passe à l'envoi
            this.state = 'sending';
            this.errorMessage = ''; // On efface les éventuelles erreurs précédentes

            // --- DEBUT DU MODE TEST ---
            if (this.isDevMode) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                window.location.href = './Model/merci.html'; 
                return; 
            }
            // --- FIN DU MODE TEST ---

            // --- ENVOI RÉEL VERS FORMSPREE ---
            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    window.location.href = './Model/merci.html'; 
                } else {
                    this.state = 'error';
                    this.errorMessage = "Oups ! Un problème est survenu côté serveur.";
                }
            } catch (err) {
                this.state = 'error';
                this.errorMessage = "Impossible de se connecter. Vérifiez votre connexion internet.";
            }
        }
    }))
})