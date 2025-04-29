const API_CONFIG = {
    BASE_URL: 'https://apivt.iut-orsay.fr/api',
    HEADERS: {
        'accept': 'application/json',
        'X-API-KEY': 'f73a0a2287c30a2cb731c1fc0b8aa57fa1767217a4a93e4e7a67bd7e39232cae',
        'X-API-ID': '252356e7fece639c6b31997d8a04e3e9-9f34f72d8ab785e8dd12ba65fa32bbb3'
    }
};

// Configuration des couleurs pour les types de séances
const COULEURS = {
    'TP': 'tp',
    'CM': 'cm',
    'PRO': 'pro',
    'RESA': 'resa',
    'DS': 'ds'
};

// État global de l'application
const state = {
    identifiant: '',
    codeEtudiant: null,
    emploiDuTemps: [],
    dateDebut: getTodayStr(),
    dateFin: getTodayStr(),
    vue: 'jour',
    loading: false,
    error: null
};


const elements = {

    identificationScreen: document.getElementById('identification-screen'),
    edtScreen: document.getElementById('edt-screen'),
    
    authForm: document.getElementById('auth-form'),
    identifiantInput: document.getElementById('identifiant'),
    rememberMe: document.getElementById('remember-me'),
    loginBtn: document.getElementById('login-btn'),
    loginText: document.getElementById('login-text'),
    loginSpinner: document.getElementById('login-spinner'),
    errorMessage: document.getElementById('error-message'),
    
    userInfo: document.getElementById('user-info'),
    logoutBtn: document.getElementById('logout-btn'),
    
    jourBtn: document.getElementById('jour-btn'),
    semaineBtn: document.getElementById('semaine-btn'),
    vueJournaliere: document.getElementById('vue-journaliere'),
    vueHebdomadaire: document.getElementById('vue-hebdomadaire'),
    loadingIndicator: document.getElementById('loading-indicator'),
    
    jourTitre: document.getElementById('jour-titre'),
    prevDayBtn: document.getElementById('prev-day'),
    nextDayBtn: document.getElementById('next-day'),
    coursList: document.getElementById('cours-jour'),
    
    semaineTitre: document.getElementById('semaine-titre'),
    prevWeekBtn: document.getElementById('prev-week'),
    nextWeekBtn: document.getElementById('next-week'),
    semaineTable: document.getElementById('semaine-table'),
    semaineBody: document.getElementById('semaine-body'),
    
    currentYear: document.getElementById('current-year')
};

// Initialisation
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Initialiser l'année en cours dans le footer
    elements.currentYear.textContent = new Date().getFullYear();
    
    // Vérifier si un identifiant est stocké dans le localStorage
    const savedIdentifiant = localStorage.getItem('edtIdentifiant');
    if (savedIdentifiant) {
        elements.identifiantInput.value = savedIdentifiant;
        if (elements.rememberMe) {
            elements.rememberMe.checked = true;
        }
    }
    
    // Écouteurs d'événements pour le formulaire de connexion et déconnexion
    elements.authForm.addEventListener('submit', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Écouteurs pour changer entre les vues journalière et hebdomadaire
    elements.jourBtn.addEventListener('click', () => changerVue('jour'));
    elements.semaineBtn.addEventListener('click', () => changerVue('semaine'));
    
    // Écouteurs pour la navigation dans la vue journalière
    elements.prevDayBtn.addEventListener('click', () => changerJour('precedent'));
    elements.nextDayBtn.addEventListener('click', () => changerJour('suivant'));
    
    // Écouteurs pour la navigation dans la vue hebdomadaire
    elements.prevWeekBtn.addEventListener('click', () => changerSemaine('precedente'));
    elements.nextWeekBtn.addEventListener('click', () => changerSemaine('suivante'));
    
    // Initialiser les éléments de la modale
    initModale();
    
    // Initialiser les dates (aujourd'hui et semaine en cours)
    initDates();

    const backBtn = document.getElementById('back-btn');

    backBtn.addEventListener('click', () => {
        resultEl.style.display = 'none';
        studentIdInput.value = '';
        studentIdInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Fonction d'initialisation de la modale
function initModale() {
    // Référencer les éléments de la modale
    elements.modalOverlay = document.getElementById('modal-overlay');
    elements.coursModal = document.getElementById('cours-modal');
    elements.modalClose = document.getElementById('modal-close');
    elements.modalTitle = document.getElementById('modal-title');
    elements.modalTime = document.getElementById('modal-time');
    elements.modalType = document.getElementById('modal-type');
    elements.modalProf = document.getElementById('modal-prof');
    elements.modalSalle = document.getElementById('modal-salle');
    elements.modalDate = document.getElementById('modal-date');
    elements.modalGroupe = document.getElementById('modal-groupe');
    
    // Ajouter les écouteurs d'événements pour la fermeture de la modale
    if (elements.modalClose) {
        elements.modalClose.addEventListener('click', fermerModaleCours);
    }
    
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', function(e) {
            if (e.target === elements.modalOverlay) {
                fermerModaleCours();
            }
        });
    }
    
    // Écouteur d'événement pour fermer la modale avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.modalOverlay && elements.modalOverlay.classList.contains('active')) {
            fermerModaleCours();
        }
    });
}

function initDates() {
    const today = new Date();
    state.dateDebut = formatDate(today);
    state.dateFin = formatDate(today);
    
    const jourSemaine = today.getDay();
    const premierJour = new Date(today);
    premierJour.setDate(today.getDate() - (jourSemaine === 0 ? 6 : jourSemaine - 1));
    
    const dernierJour = new Date(premierJour);
    dernierJour.setDate(premierJour.getDate() + 4);
    
    state.semaineDebut = formatDate(premierJour);
    state.semaineFin = formatDate(dernierJour);
}



async function handleLogin(e) {
    e.preventDefault();
    
    const identifiant = elements.identifiantInput.value.trim();
    if (!identifiant) {
        showError('Veuillez saisir votre identifiant');
        return;
    }
    
    state.identifiant = identifiant;
    setLoading(true);
    hideError();
    
    // Gérer l'option "Se souvenir de moi"
    if (elements.rememberMe && elements.rememberMe.checked) {
        localStorage.setItem('edtIdentifiant', identifiant);
    } else {
        localStorage.removeItem('edtIdentifiant');
    }
    
    try {
        const codeEtudiant = await getCodeEtudiant(identifiant);
        state.codeEtudiant = codeEtudiant;
        

        await getEmploiDuTemps(codeEtudiant, state.dateDebut, state.dateFin);
        

        showEdtScreen();
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showError('Erreur lors de la connexion. Veuillez vérifier votre identifiant et réessayer.');
    } finally {
        setLoading(false);
    }
}

function handleLogout() {
    // Si l'utilisateur déconnecte et que "Se souvenir de moi" n'est pas coché, effacer le localStorage
    if (elements.rememberMe && !elements.rememberMe.checked) {
        localStorage.removeItem('edtIdentifiant');
    }

    state.identifiant = '';
    state.codeEtudiant = null;
    state.emploiDuTemps = [];
    
    // Ne pas vider l'input si "Se souvenir de moi" est coché
    if (!elements.rememberMe || !elements.rememberMe.checked) {
        elements.identifiantInput.value = '';
    }
    
    showAuthScreen();
}

async function getCodeEtudiant(identifiant) {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}/etudiants/${identifiant}/code-etudiant`,
            {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            }
        );

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération du code étudiant:', error);
        throw error;
    }
}


async function getEmploiDuTemps(codeEtudiant, startDate, endDate) {
    setLoadingEdt(true);
    
    try {

        const responseSeances = await fetch(
            `${API_CONFIG.BASE_URL}/etudiants/${codeEtudiant}/seances?startDate=${startDate}&endDate=${endDate}`,
            {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            }
        );

        if (!responseSeances.ok) {
            throw new Error(`Erreur HTTP pour les séances: ${responseSeances.status}`);
        }

        const seances = await responseSeances.json();
        
        const responseReservations = await fetch(
            `${API_CONFIG.BASE_URL}/etudiants/${codeEtudiant}/reservations?startDate=${startDate}&endDate=${endDate}`,
            {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            }
        );

        if (!responseReservations.ok) {
            throw new Error(`Erreur HTTP pour les réservations: ${responseReservations.status}`);
        }

        const reservations = await responseReservations.json();
        
        const reservationsFormatted = reservations.map(reservation => ({
            codeSeance: reservation.codeReservation,
            dateSeance: reservation.dateReservation,
            heureSeance: reservation.heureReservation,
            dureeSeance: reservation.dureeReservation,
            nomEnseignement: reservation.commentaire || "Réservation",
            nomMatiere: reservation.commentaire || "Réservation",
            aliasMatiere: "RESA",
            nomProf: reservation.nomProf,
            prenomProf: reservation.prenomProf,
            nomSalle: reservation.nomSalle,
            aliasSalle: reservation.aliasSalle,
            nomGroupe: reservation.aliasGroupe,
            aliasGroupe: reservation.aliasGroupe,
            nomActivite: "Réservation",
            aliasActivite: "RESA"
        }));
        
        state.emploiDuTemps = [...seances, ...reservationsFormatted];
        
        if (state.vue === 'jour') {
            afficherVueJournaliere();
        } else {
            afficherVueHebdomadaire();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        alert('Erreur lors de la récupération de l\'emploi du temps. Veuillez réessayer.');
    } finally {
        setLoadingEdt(false);
    }
}

function changerVue(nouvelleVue) {
    if (state.vue === nouvelleVue) return;
    
    state.vue = nouvelleVue;
    
    if (nouvelleVue === 'jour') {
        elements.jourBtn.classList.add('active');
        elements.semaineBtn.classList.remove('active');
        elements.vueJournaliere.style.display = 'block';
        elements.vueHebdomadaire.style.display = 'none';
        
        getEmploiDuTemps(state.codeEtudiant, state.dateDebut, state.dateFin);
    } else {
        elements.jourBtn.classList.remove('active');
        elements.semaineBtn.classList.add('active');
        elements.vueJournaliere.style.display = 'none';
        elements.vueHebdomadaire.style.display = 'block';
        
        getEmploiDuTemps(state.codeEtudiant, state.semaineDebut, state.semaineFin);
    }
}

function changerJour(direction) {
    const date = new Date(state.dateDebut);
    
    if (direction === 'precedent') {
        date.setDate(date.getDate() - 1);
    } else if (direction === 'suivant') {
        date.setDate(date.getDate() + 1);
    }
    
    state.dateDebut = formatDate(date);
    state.dateFin = formatDate(date);
    
    // Mettre à jour l'affichage
    getEmploiDuTemps(state.codeEtudiant, state.dateDebut, state.dateFin);
}

function changerSemaine(direction) {
    const debut = new Date(state.semaineDebut);
    const fin = new Date(state.semaineFin);
    
    if (direction === 'precedente') {
        debut.setDate(debut.getDate() - 7);
        fin.setDate(fin.getDate() - 7);
    } else if (direction === 'suivante') {
        debut.setDate(debut.getDate() + 7);
        fin.setDate(fin.getDate() + 7);
    }
    
    state.semaineDebut = formatDate(debut);
    state.semaineFin = formatDate(fin);
    
      
    getEmploiDuTemps(state.codeEtudiant, state.semaineDebut, state.semaineFin);
}

  

  
  
function afficherVueJournaliere() {
      
    const jourSemaine = getJourSemaine(state.dateDebut);
    const dateFormatee = formatDateFr(state.dateDebut);
    elements.jourTitre.textContent = `${jourSemaine} ${dateFormatee}`;
    
      
    elements.coursList.innerHTML = '';
    
      
    const seancesJour = getSeancesJour(state.emploiDuTemps, state.dateDebut);
    
      
    if (seancesJour.length === 0) {
        const emptyDayMessage = document.createElement('div');
        emptyDayMessage.className = 'empty-day-message';
        emptyDayMessage.textContent = 'Aucun cours programmé pour cette journée';
        elements.coursList.appendChild(emptyDayMessage);
        return;
    }
    
      
    seancesJour.sort((a, b) => a.heureSeance - b.heureSeance);
    
      
    let totalMinutesCours = 0;
    seancesJour.forEach(seance => {
          
        const heuresDuree = Math.floor(seance.dureeSeance / 100);
        const minutesDuree = seance.dureeSeance % 100;
        totalMinutesCours += (heuresDuree * 60 + minutesDuree);
    });
    
      
    const pixelsParMinuteCours = 1.5;   
    
      
    let derniereHeureFin = null;
    
    seancesJour.forEach((seance, index) => {
          
        const heureDebutActuel = convertirEnMinutes(seance.heureSeance);
        
          
        const heuresDuree = Math.floor(seance.dureeSeance / 100);
        const minutesDuree = seance.dureeSeance % 100;
        const dureeCoursMinutes = heuresDuree * 60 + minutesDuree;
        
          
        const heureFinActuel = heureDebutActuel + dureeCoursMinutes;
        
          
        if (derniereHeureFin !== null) {
            const pauseMinutes = heureDebutActuel - derniereHeureFin;
            
              
            if (pauseMinutes > 15) {
                  
                const pauseElement = document.createElement('div');
                pauseElement.className = 'cours-gap';
                
                  
                const hauteurPause = pauseMinutes * pixelsParMinuteCours;
                pauseElement.style.height = `${hauteurPause}px`;
                
                  
                let pauseTexte = '';
                if (pauseMinutes >= 60) {
                    const heures = Math.floor(pauseMinutes / 60);
                    const minutes = pauseMinutes % 60;
                    pauseTexte = `${heures}h${minutes > 0 ? minutes.toString().padStart(2, '0') : ''}`;
                } else {
                    pauseTexte = `${pauseMinutes} min`;
                }
                
                pauseElement.setAttribute('data-duree', pauseTexte);
                elements.coursList.appendChild(pauseElement);
            }
        }
        
          
        const coursItem = document.createElement('div');
        coursItem.className = `cours-item ${getClasseTypeCours(seance.aliasActivite)}`;
        
        // Stocker une référence à l'objet séance pour la modale (ajouté)
        coursItem.setAttribute('data-seance-index', index);
        coursItem.style.cursor = 'pointer';
        
          
        const hauteurCours = dureeCoursMinutes * pixelsParMinuteCours;
        coursItem.style.minHeight = `${Math.max(hauteurCours, 110)}px`;   
        
          
        const coursHeader = document.createElement('div');
        coursHeader.className = 'cours-header';
        
          
        const coursTitle = document.createElement('div');
        coursTitle.className = 'cours-title';
        coursTitle.textContent = seance.nomMatiere;
        coursHeader.appendChild(coursTitle);
        
          
        const coursType = document.createElement('div');
        coursType.className = `cours-type ${getClasseTypeCours(seance.aliasActivite)}`;
        coursType.textContent = seance.nomActivite;
        coursHeader.appendChild(coursType);
        
        coursItem.appendChild(coursHeader);
        
          
        const coursTime = document.createElement('div');
        coursTime.className = 'cours-time';
        coursTime.textContent = `${formatHeure(seance.heureSeance)} - ${calculerHeureFin(seance.heureSeance, seance.dureeSeance)}`;
        coursItem.appendChild(coursTime);
        
          
        const coursDetails = document.createElement('div');
        coursDetails.className = 'cours-details';
        
          
        if (seance.nomProf && seance.prenomProf) {
              
            const profNoms = seance.nomProf.split(', ');
            const profPrenoms = seance.prenomProf.split(', ');
            
            const profsUniques = [];
            for (let i = 0; i < profNoms.length; i++) {
                const nomComplet = `${profPrenoms[i] || ''} ${profNoms[i] || ''}`.trim();
                if (nomComplet && !profsUniques.includes(nomComplet)) {
                    profsUniques.push(nomComplet);
                }
            }
            
            const coursProf = document.createElement('div');
            coursProf.className = 'cours-prof';
            coursProf.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"></path></svg>`;
            coursProf.innerHTML += profsUniques.join(', ');
            coursDetails.appendChild(coursProf);
        }
        
           
        if (seance.nomSalle) {
               
            const sallesNoms = seance.nomSalle.split(', ');
            const sallesUniques = [...new Set(sallesNoms)].filter(s => s && s !== 'null');
            
            if (sallesUniques.length > 0) {
                const coursSalle = document.createElement('div');
                coursSalle.className = 'cours-salle';
                coursSalle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd"></path></svg>`;
                coursSalle.innerHTML += sallesUniques.join(', ');
                coursDetails.appendChild(coursSalle);
            }
        }
        
        coursItem.appendChild(coursDetails);
        elements.coursList.appendChild(coursItem);
        
        // Ajouter l'événement de clic pour ouvrir la modale (ajouté)
        coursItem.addEventListener('click', function() {
            ouvrirModaleCours(seance);
        });
          
        derniereHeureFin = heureFinActuel;
    });
}

  
function convertirEnMinutes(heure) {
    if (!heure && heure !== 0) return 0;
    
    const heureStr = heure.toString().padStart(4, '0');
    const heures = parseInt(heureStr.substring(0, 2), 10);
    const minutes = parseInt(heureStr.substring(2, 4), 10);
    
    return heures * 60 + minutes;
}

  
function afficherVueHebdomadaire() {
    const heuresDebut = 8; // Heure de début de la journée
    const heuresFin = 19; // Heure de fin de la journée
    const pixelsPar30Minutes = 30; // Hauteur en pixels pour 30 minutes

    const moisAnnee = getMoisAnnee(state.semaineDebut);
    const numeroSemaine = getNumeroSemaine(state.semaineDebut);
    const dateDebut = formatDateFr(state.semaineDebut);
    const dateFin = formatDateFr(state.semaineFin);

    elements.semaineTitre.innerHTML = `
        ${moisAnnee} - Semaine ${numeroSemaine}<br>
        <span style="font-size: 0.8rem;">Du ${dateDebut} au ${dateFin}</span>
    `;

    elements.semaineBody.innerHTML = '';

    const jours = getJoursSemaine(state.semaineDebut);

    const table = document.createElement('table');
    table.className = 'semaine-table';

    const tbody = document.createElement('tbody');
    const bodyRow = document.createElement('tr');

    jours.forEach(jour => {
        const cell = document.createElement('td');
        cell.className = 'jour-column';
        cell.style.position = 'relative'; // Position relative pour placer les cours

        // Ajoutez une grille horaire avec des intervalles de 30 minutes
        for (let heure = heuresDebut; heure <= heuresFin; heure++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const heureDiv = document.createElement('div');
                heureDiv.className = 'heure-ligne';
                heureDiv.style.height = `${pixelsPar30Minutes}px`;
                if (minute === 0) {
                    heureDiv.textContent = `${heure}h`;
                } else {
                    heureDiv.textContent = `${heure}h${minute.toString().padStart(2, '0')}`;
                }
                cell.appendChild(heureDiv);
            }
        }

        // Positionnez les cours
        const seancesJour = getSeancesJour(state.emploiDuTemps, jour.date);
        seancesJour.forEach(seance => {
            const coursItem = document.createElement('div');
            coursItem.className = `semaine-cours ${getClasseTypeCours(seance.aliasActivite)}`;
            coursItem.style.position = 'absolute';

            // Calculez la position et la hauteur
            const heureDebut = convertirEnMinutes(seance.heureSeance) / 60;
            const duree = convertirEnMinutes(seance.dureeSeance) / 60;
            coursItem.style.top = `${(heureDebut - heuresDebut) * pixelsPar30Minutes * 2}px`;
            coursItem.style.height = `${duree * pixelsPar30Minutes * 2}px`;

            // Fixez une largeur uniforme pour tous les cours
            coursItem.style.width = '90%'; // Ajustez la largeur selon vos besoins
            coursItem.style.left = '5%'; // Centrez les cours dans la colonne

            // Ajoutez les détails du cours, y compris les horaires
            coursItem.innerHTML = `
                <div class="semaine-cours-header">${seance.nomMatiere}</div>
                <div class="semaine-cours-time">${formatHeure(seance.heureSeance)} - ${calculerHeureFin(seance.heureSeance, seance.dureeSeance)}</div>
                <div class="semaine-cours-details">
                    <span class="semaine-cours-prof">${seance.nomProf}</span>
                    <span class="semaine-cours-salle">${seance.nomSalle}</span>
                </div>
            `;

            // Ajoutez un événement de clic pour ouvrir la modale
            coursItem.addEventListener('click', () => ouvrirModaleCours(seance));

            cell.appendChild(coursItem);
        });

        bodyRow.appendChild(cell);
    });

    tbody.appendChild(bodyRow);
    table.appendChild(tbody);

    elements.semaineBody.appendChild(table);
}
function showAuthScreen() {
    elements.identificationScreen.style.display = 'flex';
    elements.edtScreen.style.display = 'none';
    elements.logoutBtn.style.display = 'none';
    elements.userInfo.textContent = '';
}

function showEdtScreen() {
    elements.identificationScreen.style.display = 'none';
    elements.edtScreen.style.display = 'block';
    elements.logoutBtn.style.display = 'block';
    elements.userInfo.textContent = `Connecté en tant que ${state.identifiant}`;
    
      
    changerVue(state.vue);
}

function setLoading(isLoading) {
    state.loading = isLoading;
    
    elements.loginBtn.disabled = isLoading;
    elements.loginText.style.display = isLoading ? 'none' : 'inline';
    elements.loginSpinner.style.display = isLoading ? 'inline-block' : 'none';
}

function setLoadingEdt(isLoading) {
    elements.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateFr(dateStr) {
    if (!dateStr) return '';
    const [annee, mois, jour] = dateStr.split('-');
    return `${jour}/${mois}/${annee}`;
}

function formatHeure(heure) {
    if (!heure && heure !== 0) return '';
    
    let heureStr = heure.toString().padStart(4, '0');
    
    const heures = heureStr.substring(0, 2);
    const minutes = heureStr.substring(2, 4);
    
    const heuresSansZero = heures.charAt(0) === '0' ? heures.charAt(1) : heures;
    
    return `${heuresSansZero}h${minutes}`;
}

function calculerHeureFin(heureDebut, duree) {
    if ((!heureDebut && heureDebut !== 0) || !duree) return '';
    
    const heureDebutStr = heureDebut.toString().padStart(4, '0');
    const dureeStr = duree.toString().padStart(4, '0');
    
    const heuresDebut = parseInt(heureDebutStr.substring(0, 2), 10);
    const minutesDebut = parseInt(heureDebutStr.substring(2, 4), 10);
    
    const heuresDuree = parseInt(dureeStr.substring(0, dureeStr.length - 2), 10);
    const minutesDuree = parseInt(dureeStr.substring(dureeStr.length - 2), 10);
    
    let totalMinutes = (heuresDebut + heuresDuree) * 60 + (minutesDebut + minutesDuree);
    
    const nouvHeures = Math.floor(totalMinutes / 60);
    const nouvMinutes = totalMinutes % 60;
    
    return `${nouvHeures}h${nouvMinutes.toString().padStart(2, '0')}`;
}

function getTodayStr() {
    return formatDate(new Date());
}

function getJourSemaine(dateStr) {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const date = new Date(dateStr);
    return jours[date.getDay()];
}

function getMoisAnnee(dateStr) {
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const date = new Date(dateStr);
    return `${mois[date.getMonth()]} ${date.getFullYear()}`;
}

function getNumeroSemaine(dateStr) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
      
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      
    const semaine1 = new Date(date.getFullYear(), 0, 4);
      
    semaine1.setDate(semaine1.getDate() + 3 - (semaine1.getDay() + 6) % 7);
      
    return 1 + Math.round(((date.getTime() - semaine1.getTime()) / 86400000 - 3 + (semaine1.getDay() + 6) % 7) / 7);
}

function getJoursSemaine(dateDebut) {
    if (!dateDebut) return [];
    
    const debut = new Date(dateDebut);
    const jours = [];
    
    for (let i = 0; i < 5; i++) {   
        const jour = new Date(debut);
        jour.setDate(debut.getDate() + i);
        jours.push({
            date: formatDate(jour),
            nom: getJourSemaine(jour)
        });
    }
    
    return jours;
}

function getClasseTypeCours(typeActivite) {
    if (!typeActivite) return '';
    
    const type = typeActivite.toUpperCase();
    return COULEURS[type] || '';
}

function getSeancesJour(emploiDuTemps, jour) {
    if (!emploiDuTemps || !jour) return [];
    
    const seancesJour = emploiDuTemps.filter(seance => seance.dateSeance === jour);
    
    return regroupeSeances(seancesJour);
}

function regroupeSeances(seances) {
    if (!seances || seances.length === 0) return [];
    
    const groupedByTimeAndCourse = {};
    
    seances.forEach(seance => {
        const key = `${seance.dateSeance}-${seance.heureSeance}-${seance.dureeSeance}-${seance.nomMatiere}-${seance.aliasActivite}`;
        
        if (!groupedByTimeAndCourse[key]) {
            groupedByTimeAndCourse[key] = { ...seance };
        } else {
            Object.keys(seance).forEach(attr => {
                if (seance[attr] !== groupedByTimeAndCourse[key][attr]) {
                    if (seance[attr] === null) {
                        // Ne rien faire si la valeur est null
                    } else if (groupedByTimeAndCourse[key][attr] === null) {
                        groupedByTimeAndCourse[key][attr] = seance[attr];
                    } else {
                        if (attr === 'nomProf' || attr === 'prenomProf' || attr === 'nomSalle' || attr === 'aliasSalle') {
                            const valExistante = groupedByTimeAndCourse[key][attr].split(', ');
                            const nouvelleVal = seance[attr].split(', ');
                            
                            const valeursUniques = [...new Set([...valExistante, ...nouvelleVal])].filter(v => v);
                            groupedByTimeAndCourse[key][attr] = valeursUniques.join(', ');
                        } else {
                            groupedByTimeAndCourse[key][attr] = `${groupedByTimeAndCourse[key][attr]}, ${seance[attr]}`;
                        }
                    }
                }
            });
        }
    });
    
    return Object.values(groupedByTimeAndCourse);
}

// Fonctions pour la fenêtre modale
function ouvrirModaleCours(seance, jourStr = null, dateStr = null) {
    if (!seance || !elements.modalOverlay || !elements.coursModal) return;
    
    // Titre du cours
    elements.modalTitle.textContent = seance.nomMatiere;
    
    // Horaires
    elements.modalTime.textContent = `⏱️ ${formatHeure(seance.heureSeance)} - ${calculerHeureFin(seance.heureSeance, seance.dureeSeance)}`;
    
    // Type de cours
    elements.modalType.textContent = seance.nomActivite;
    
    // Classe CSS pour le type de cours
    const typeClass = getClasseTypeCours(seance.aliasActivite);
    
    // Nettoyer les classes précédentes et ajouter la nouvelle
    elements.coursModal.className = 'cours-modal';
    if (typeClass) {
        elements.coursModal.classList.add(typeClass);
    }
    
    // Enseignants
    if (seance.nomProf && seance.prenomProf) {
        const profNoms = seance.nomProf.split(', ');
        const profPrenoms = seance.prenomProf.split(', ');
        
        const profsUniques = [];
        for (let i = 0; i < profNoms.length; i++) {
            const nomComplet = `${profPrenoms[i] || ''} ${profNoms[i] || ''}`.trim();
            if (nomComplet && !profsUniques.includes(nomComplet)) {
                profsUniques.push(nomComplet);
            }
        }
        
        elements.modalProf.textContent = profsUniques.join(', ');
    } else {
        elements.modalProf.textContent = 'Non spécifié';
    }
    
    // Salles
    if (seance.nomSalle) {
        const sallesNoms = seance.nomSalle.split(', ');
        const sallesUniques = [...new Set(sallesNoms)].filter(s => s && s !== 'null');
        
        if (sallesUniques.length > 0) {
            elements.modalSalle.textContent = sallesUniques.join(', ');
        } else {
            elements.modalSalle.textContent = 'Non spécifiée';
        }
    } else {
        elements.modalSalle.textContent = 'Non spécifiée';
    }
    
    // Date
    if (jourStr && dateStr) {
        elements.modalDate.textContent = `${jourStr} ${dateStr}`;
    } else if (seance.dateSeance) {
        const jour = getJourSemaine(seance.dateSeance);
        const date = formatDateFr(seance.dateSeance);
        elements.modalDate.textContent = `${jour} ${date}`;
    } else {
        elements.modalDate.textContent = 'Non spécifiée';
    }
    
    // Groupe
    if (seance.nomGroupe) {
        elements.modalGroupe.textContent = seance.nomGroupe;
    } else {
        elements.modalGroupe.textContent = 'Non spécifié';
    }
    
    // Afficher la modale
    elements.modalOverlay.classList.add('active');
    
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
}



function fermerModaleCours() {
    if (elements.modalOverlay) {
        elements.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}