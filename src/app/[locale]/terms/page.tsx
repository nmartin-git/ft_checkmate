const TermsPage= () => {
  return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">Conditions d'utilisation</h1>

            <p className="mb-4 text-sm text-gray-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">1. Objet</h2>
                <p>Dames.com est une plateforme de jeu en ligne développée dans le cadre du projet ft_transcendence de l'école 42. Ce site est un projet pédagogique et n'a pas de vocation commerciale.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">2. Inscription</h2>
                <p>L'inscription nécessite un nom d'utilisateur unique et une adresse e-mail valide, ou une connexion via l'authentification 42 (OAuth). Vous êtes responsable de la confidentialité de vos identifiants.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">3. Règles d'usage</h2>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Interdiction d'usurper l'identité d'un autre utilisateur</li>
                    <li>Interdiction de tricher (bots, scripts automatisés, exploits)</li>
                    <li>Respect des autres joueurs (pas de harcèlement, propos injurieux)</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-bold mb-2">4. Suppression de compte</h2>
                {/* TODO SUPPRESSION COMPTE*/}<p>Vous pouvez supprimer votre compte à tout moment depuis votre page de profil. Cette action entraîne la suppression de vos données personnelles conformément à notre politique de confidentialité.</p>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-2">5. Responsabilité</h2>
                <p>Ce projet étant réalisé à des fins éducatives, aucune garantie de disponibilité, de performance ou d'absence de bug n'est fournie.</p>
            </section>
        </div>
    );
}
export default TermsPage