FrokLore - Baza recepata iz celog sveta

FrokLore je interaktivna web aplikacija koja služi kao baza recepata iz svih krajeva sveta. Omogućava korisnicima da pregledaju, dodaju i pretražuju recepte koristeći moderan React frontend i Firebase backend za skladištenje podataka i autentifikaciju.

Tehnologije:

-React.js
-HTML5 & CSS3
-JavaScript (ES6+)
-Firebase (Firestore, Authentication)
-React Router (za navigaciju između stranica)
-Eventualno dodatne biblioteke (npr. styled-components, axios)
-Funkcionalnosti
-Pregled recepata po kategorijama i zemljama
-Pretraga recepata po nazivu ili sastojcima
-Dodavanje novih recepata (potrebna autentifikacija)
-Korisnička registracija i prijava putem Firebase Authentication
-Detaljan prikaz svakog recepta sa slikama i opisom
-Responsivan dizajn za dobar prikaz na desktopu i mobilnim uređajima

===========================================================================================

Instalacija i pokretanje

Kloniraj repozitorijum:

git clone https://github.com/Jasamprobo/ProjektReact


Uđi u folder projekta:

cd froklore


Instaliraj zavisnosti:

npm install


Pokreni razvojni server:

npm start


Otvori http://localhost:3000
        u tvom browseru.

 ========================================================================================
Konfiguracija Firebase-a;

Za povezivanje sa Firebase-om, napravi svoj projekat na Firebase Console
 i u fajlu .env (ili direktno u konfiguraciji) unesi sledeće vrednosti:


REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
===============================================================================
Autor

Martin "Jasamprobo" Brodarac

Email: Brodaracmartin@gmail.com