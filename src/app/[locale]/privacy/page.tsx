const PrivacyPage= () => {
  return (
        <div className="max-w-3xl mx-auto px-6 py-10 bg-[#262522]">
            <h1 className="text-2xl font-bold mb-6">Politique de confidentialité</h1>

            <p className="mb-4 text-sm text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">1. Données collectées</h2>
                <p>Lors de votre inscription et utilisation de Dames.com, nous collectons :</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Votre nom d'utilisateur et adresse e-mail</li>
                    <li>Votre avatar</li>
                    <li>Votre historique de parties et statistiques de jeu</li>
                    <li>Vos données d'authentification (via l'API 42 si connexion OAuth)</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">2. Utilisation des données</h2>
                <p>Ces données sont utilisées uniquement pour :</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Vous permettre de jouer et suivre vos statistiques</li>
                    <li>Gérer votre compte et session (via cookies/tokens JWT)</li>
                    <li>Afficher votre profil aux autres joueurs</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">3. Cookies</h2>
                <p>Nous utilisons des cookies techniques (session, authentification) nécessaires au fonctionnement du site. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">4. Partage des données</h2>
                <p>Vos données ne sont jamais vendues ni partagées avec des tiers à des fins commerciales. Elles restent strictement internes au fonctionnement de l'application.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">5. Vos droits</h2>
                <p>Conformément au RGPD, vous pouvez à tout moment demander l'accès, la modification ou la suppression de vos données personnelles en supprimant votre compte depuis votre profil, ou en nous contactant.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-2">6. Contact</h2>
                <p>Pour toute question relative à vos données, contactez l'équipe de développement via le dépôt du projet.</p>
            </section>
        </div>
    );
}
export default PrivacyPage