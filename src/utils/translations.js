// Translations for all UI strings in the app
export const translations = {
  en: {
    // Common
    translate: 'Translate',
    settings: 'Settings',
    loading: 'Loading...',
    saving: 'Saving...',
    saved: 'Saved',
    cancel: 'Cancel',
    close: 'Close',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    copied: 'Copied!',
    error: 'Error',
    
    // TopBar
    backToClassroom: 'Back to Classroom',
    translateTitle: 'Translate',
    translateFrom: 'From',
    translateTo: 'To',
    textToTranslate: 'Text to translate',
    translation: 'Translation',
    enterTextToTranslate: 'Enter text to translate...',
    translationWillAppear: 'Translation will appear here...',
    selectDifferentLanguages: 'Select different languages to translate',
    translationRequiresChrome: 'Translation requires Chrome 138+ with Translator API support.',
    translationNotAvailable: 'Translation not available',
    translationFailed: 'Translation failed',
    
    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize your learning experience',
    yourNativeLanguage: 'Your Native Language',
    nativeLanguageDescription: 'The language you\'re most comfortable with',
    saveSettings: 'Save Settings',
    settingsSavedSuccessfully: 'Settings saved successfully!',
    errorSavingSettings: 'Error saving settings. Please try again.',
    loadingSettings: 'Loading settings...',
    
    // SelectedTextBlock
    selectedText: 'Selected Text',
    askMeAQuestion: 'Ask me a question',
    askAboutThisImage: 'Ask about this image',
    explainGrammar: 'Explain grammar',
    
    // UnifiedSidebar
    selectTextToGetStarted: 'Select text to get started!',
    selectTextFromPage: 'Select text from the page to get started!',
    openAnyArticle: 'Open any article, blog post, or news page in the main window.',
    highlightText: 'Highlight or click on any text to translate it and save words',
    clickParagraph: 'Click on any image to discuss it with AI',
    useAskToGetExplanations: 'Then use Ask to get explanations and practice.',
    ask: 'Ask',
    typeMessage: 'Type a message...',
    
    // TextbookPage
    languageTextbook: 'Language Textbook',
    textbookSubtitle: 'Your comprehensive learning resource',
    
    // VocabularyTable
    vocabulary: 'Vocabulary',
    word: 'Word',
    progress: 'Progress',
    source: 'Source',
    actions: 'Actions',
    practice: 'Practice',
    delete: 'Delete',
    reset: 'Reset',
    addWord: 'Add Word',
    importWords: 'Import Words',
    exportWords: 'Export Words',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    words: 'words',
    noWordsYet: 'No words yet',
    startSelectingText: 'Start selecting text to build your vocabulary!',
    allSources: 'All Sources',
    latest: 'Latest',
    groupBySource: 'Group by Source',
    
    // AddWordModal
    addNewWord: 'Add a New Word',
    enterWord: 'Enter the word',
    enterTranslation: 'Enter the translation',
    languageCode: 'Language Code',
    languageCodePlaceholder: 'e.g., nl, es, fr',
    autoTranslateToEnglish: 'Auto-translate to English',
    adding: 'Adding...',
    
    // ProductTour
    exploreWebpage: 'Explore any webpage',
    exploreWebpageBody: 'This is your live webpage. You can select an article, blog post, or news page to get started. Then select any text on the page or click on a paragraph to send it here to practice.',
    selectionAppearsHere: 'Your selection appears here',
    selectionAppearsBody: 'The text you select gets captured here. You can interact with words and phrases to translate and save them.',
    askOrExplain: 'Ask or explain',
    askOrExplainBody: 'Use Ask to pose questions about the selection and get explanations.',
    translateAndSave: 'Translate and save words',
    translateAndSaveBody: 'Highlight a word or a few words in your selection to translate them. The Next button will enable once the translation popup appears.',
    
    // Messages
    noTextSelected: 'No text selected. Please select some text first.',
    imageQuestionsOnly: 'Image questions only support the "Ask about this image" action.',
    aiFeaturesRequireChrome: 'AI features require Chrome 138+ with Prompt API support.',
    pleaseUpdateBrowser: 'Please update your browser.',
    
    // Start Learning Button (in content script - but this is for consistency)
    startLearning: 'Start learning',
    clickToSelectFirst: 'Click to select the first text block or image on the page',
    clickToSelectNext: 'Click to select the next text block or image on the page',
  },
  
  nl: {
    // Common
    translate: 'Vertaal',
    settings: 'Instellingen',
    loading: 'Laden...',
    saving: 'Opslaan...',
    saved: 'Opgeslagen',
    cancel: 'Annuleren',
    close: 'Sluiten',
    next: 'Volgende',
    previous: 'Vorige',
    finish: 'Voltooien',
    copied: 'Gekopieerd!',
    error: 'Fout',
    
    // TopBar
    backToClassroom: 'Terug naar Lokaal',
    translateTitle: 'Vertaal',
    translateFrom: 'Van',
    translateTo: 'Naar',
    textToTranslate: 'Tekst om te vertalen',
    translation: 'Vertaling',
    enterTextToTranslate: 'Voer tekst in om te vertalen...',
    translationWillAppear: 'Vertaling verschijnt hier...',
    selectDifferentLanguages: 'Selecteer verschillende talen om te vertalen',
    translationRequiresChrome: 'Vertaling vereist Chrome 138+ met Translator API-ondersteuning.',
    translationNotAvailable: 'Vertaling niet beschikbaar',
    translationFailed: 'Vertaling mislukt',
    
    // Settings
    settingsTitle: 'Instellingen',
    settingsSubtitle: 'Pas je leerervaring aan',
    yourNativeLanguage: 'Je Moedertaal',
    nativeLanguageDescription: 'De taal waarin je je het meest comfortabel voelt',
    saveSettings: 'Instellingen Opslaan',
    settingsSavedSuccessfully: 'Instellingen succesvol opgeslagen!',
    errorSavingSettings: 'Fout bij het opslaan van instellingen. Probeer het opnieuw.',
    loadingSettings: 'Instellingen laden...',
    
    // SelectedTextBlock
    selectedText: 'Geselecteerde Tekst',
    askMeAQuestion: 'Stel me een vraag',
    askAboutThisImage: 'Vraag over deze afbeelding',
    explainGrammar: 'Leg grammatica uit',
    
    // UnifiedSidebar
    selectTextToGetStarted: 'Selecteer tekst om te beginnen!',
    selectTextFromPage: 'Selecteer tekst van de pagina om te beginnen!',
    openAnyArticle: 'Open elk artikel, blogpost of nieuwspagina in het hoofdvenster.',
    highlightText: 'Markeer of klik op een tekst om deze te vertalen en woorden op te slaan',
    clickParagraph: 'Klik op een afbeelding om deze hier te bespreken met AI',
    useAskToGetExplanations: 'Gebruik Vraag om uitleg te krijgen en te oefenen.',
    ask: 'Vraag',
    typeMessage: 'Typ een bericht...',
    
    // TextbookPage
    languageTextbook: 'Taalboek',
    textbookSubtitle: 'Je uitgebreide leerbron',
    
    // VocabularyTable
    vocabulary: 'Woordenschat',
    word: 'Woord',
    progress: 'Voortgang',
    source: 'Bron',
    actions: 'Acties',
    practice: 'Oefenen',
    delete: 'Verwijderen',
    reset: 'Resetten',
    addWord: 'Woord Toevoegen',
    importWords: 'Woorden Importeren',
    exportWords: 'Woorden Exporteren',
    showing: 'Toont',
    to: 'tot',
    of: 'van',
    words: 'woorden',
    noWordsYet: 'Nog geen woorden',
    startSelectingText: 'Begin met het selecteren van tekst om je woordenschat op te bouwen!',
    allSources: 'Alle Bronnen',
    latest: 'Nieuwste',
    groupBySource: 'Groeperen op Bron',
    
    // AddWordModal
    addNewWord: 'Nieuw Woord Toevoegen',
    enterWord: 'Voer het woord in',
    enterTranslation: 'Voer de vertaling in',
    languageCode: 'Taalcode',
    languageCodePlaceholder: 'bijv. nl, es, fr',
    autoTranslateToEnglish: 'Auto-vertaal naar Engels',
    adding: 'Toevoegen...',
    
    // ProductTour
    exploreWebpage: 'Verken een webpagina',
    exploreWebpageBody: 'Dit is je live webpagina. Je kunt een artikel, blogpost of nieuwspagina selecteren om te beginnen. Selecteer dan tekst op de pagina of klik op een alinea om deze hier te verzenden om te oefenen.',
    selectionAppearsHere: 'Je selectie verschijnt hier',
    selectionAppearsBody: 'De tekst die je selecteert wordt hier vastgelegd. Je kunt interactie hebben met woorden en zinnen om ze te vertalen en op te slaan.',
    askOrExplain: 'Vraag of leg uit',
    askOrExplainBody: 'Gebruik Vraag om vragen over de selectie te stellen en uitleg te krijgen.',
    translateAndSave: 'Vertaal en sla woorden op',
    translateAndSaveBody: 'Markeer een woord of enkele woorden in je selectie om ze te vertalen. De knop Volgende wordt ingeschakeld zodra het vertaalvenster verschijnt.',
    
    // Messages
    noTextSelected: 'Geen tekst geselecteerd. Selecteer eerst wat tekst.',
    imageQuestionsOnly: 'Afbeeldingsvragen ondersteunen alleen de actie "Vraag over deze afbeelding".',
    aiFeaturesRequireChrome: 'AI-functies vereisen Chrome 138+ met Prompt API-ondersteuning.',
    pleaseUpdateBrowser: 'Update je browser.',
    
    // Start Learning Button
    startLearning: 'Begin met leren',
    clickToSelectFirst: 'Klik om het eerste tekstblok of de eerste afbeelding op de pagina te selecteren',
    clickToSelectNext: 'Klik om het volgende tekstblok of de volgende afbeelding op de pagina te selecteren',
  },
  
  es: {
    // Common
    translate: 'Traducir',
    settings: 'Configuración',
    loading: 'Cargando...',
    saving: 'Guardando...',
    saved: 'Guardado',
    cancel: 'Cancelar',
    close: 'Cerrar',
    next: 'Siguiente',
    previous: 'Anterior',
    finish: 'Finalizar',
    copied: '¡Copiado!',
    error: 'Error',
    
    // TopBar
    backToClassroom: 'Volver al Aula',
    translateTitle: 'Traducir',
    translateFrom: 'De',
    translateTo: 'A',
    textToTranslate: 'Texto a traducir',
    translation: 'Traducción',
    enterTextToTranslate: 'Ingresa texto para traducir...',
    translationWillAppear: 'La traducción aparecerá aquí...',
    selectDifferentLanguages: 'Selecciona diferentes idiomas para traducir',
    translationRequiresChrome: 'La traducción requiere Chrome 138+ con soporte para Translator API.',
    translationNotAvailable: 'Traducción no disponible',
    translationFailed: 'Error en la traducción',
    
    // Settings
    settingsTitle: 'Configuración',
    settingsSubtitle: 'Personaliza tu experiencia de aprendizaje',
    yourNativeLanguage: 'Tu Idioma Nativo',
    nativeLanguageDescription: 'El idioma con el que te sientes más cómodo',
    saveSettings: 'Guardar Configuración',
    settingsSavedSuccessfully: '¡Configuración guardada exitosamente!',
    errorSavingSettings: 'Error al guardar la configuración. Por favor, intenta de nuevo.',
    loadingSettings: 'Cargando configuración...',
    
    // SelectedTextBlock
    selectedText: 'Texto Seleccionado',
    askMeAQuestion: 'Hazme una pregunta',
    askAboutThisImage: 'Pregunta sobre esta imagen',
    explainGrammar: 'Explicar gramática',
    
    // UnifiedSidebar
    selectTextToGetStarted: '¡Selecciona texto para comenzar!',
    selectTextFromPage: '¡Selecciona texto de la página para comenzar!',
    openAnyArticle: 'Abre cualquier artículo, publicación de blog o página de noticias en la ventana principal.',
    highlightText: 'Resalta o haz clic en cualquier texto para traducirlo y guardar palabras',
    clickParagraph: 'Haz clic en cualquier imagen para discutirla con IA',
    useAskToGetExplanations: 'Luego usa Preguntar para obtener explicaciones y practicar.',
    ask: 'Preguntar',
    typeMessage: 'Escribe un mensaje...',
    
    // TextbookPage
    languageTextbook: 'Libro de Idioma',
    textbookSubtitle: 'Tu recurso de aprendizaje integral',
    
    // VocabularyTable
    vocabulary: 'Vocabulario',
    word: 'Palabra',
    progress: 'Progreso',
    source: 'Fuente',
    actions: 'Acciones',
    practice: 'Practicar',
    delete: 'Eliminar',
    reset: 'Restablecer',
    addWord: 'Agregar Palabra',
    importWords: 'Importar Palabras',
    exportWords: 'Exportar Palabras',
    showing: 'Mostrando',
    to: 'a',
    of: 'de',
    words: 'palabras',
    noWordsYet: 'Aún no hay palabras',
    startSelectingText: '¡Comienza a seleccionar texto para construir tu vocabulario!',
    allSources: 'Todas las Fuentes',
    latest: 'Más Reciente',
    groupBySource: 'Agrupar por Fuente',
    
    // AddWordModal
    addNewWord: 'Agregar Nueva Palabra',
    enterWord: 'Ingresa la palabra',
    enterTranslation: 'Ingresa la traducción',
    languageCode: 'Código de Idioma',
    languageCodePlaceholder: 'ej. nl, es, fr',
    autoTranslateToEnglish: 'Auto-traducir al inglés',
    adding: 'Agregando...',
    
    // ProductTour
    exploreWebpage: 'Explora cualquier página web',
    exploreWebpageBody: 'Esta es tu página web en vivo. Puedes seleccionar un artículo, publicación de blog o página de noticias para comenzar. Luego selecciona cualquier texto en la página o haz clic en un párrafo para enviarlo aquí y practicar.',
    selectionAppearsHere: 'Tu selección aparece aquí',
    selectionAppearsBody: 'El texto que seleccionas se captura aquí. Puedes interactuar con palabras y frases para traducirlas y guardarlas.',
    askOrExplain: 'Preguntar o explicar',
    askOrExplainBody: 'Usa Preguntar para hacer preguntas sobre la selección y obtener explicaciones.',
    translateAndSave: 'Traducir y guardar palabras',
    translateAndSaveBody: 'Resalta una palabra o algunas palabras en tu selección para traducirlas. El botón Siguiente se habilitará una vez que aparezca la ventana de traducción.',
    
    // Messages
    noTextSelected: 'No se ha seleccionado texto. Por favor, selecciona texto primero.',
    imageQuestionsOnly: 'Las preguntas sobre imágenes solo admiten la acción "Pregunta sobre esta imagen".',
    aiFeaturesRequireChrome: 'Las funciones de IA requieren Chrome 138+ con soporte para Prompt API.',
    pleaseUpdateBrowser: 'Por favor, actualiza tu navegador.',
    
    // Start Learning Button
    startLearning: 'Comenzar a aprender',
    clickToSelectFirst: 'Haz clic para seleccionar el primer bloque de texto o imagen en la página',
    clickToSelectNext: 'Haz clic para seleccionar el siguiente bloque de texto o imagen en la página',
  },
  
  fr: {
    // Common
    translate: 'Traduire',
    settings: 'Paramètres',
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    saved: 'Enregistré',
    cancel: 'Annuler',
    close: 'Fermer',
    next: 'Suivant',
    previous: 'Précédent',
    finish: 'Terminer',
    copied: 'Copié!',
    error: 'Erreur',
    
    // TopBar
    backToClassroom: 'Retour à la Salle',
    translateTitle: 'Traduire',
    translateFrom: 'De',
    translateTo: 'Vers',
    textToTranslate: 'Texte à traduire',
    translation: 'Traduction',
    enterTextToTranslate: 'Entrez le texte à traduire...',
    translationWillAppear: 'La traduction apparaîtra ici...',
    selectDifferentLanguages: 'Sélectionnez différentes langues pour traduire',
    translationRequiresChrome: 'La traduction nécessite Chrome 138+ avec support de Translator API.',
    translationNotAvailable: 'Traduction non disponible',
    translationFailed: 'Échec de la traduction',
    
    // Settings
    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Personnalisez votre expérience d\'apprentissage',
    yourNativeLanguage: 'Votre Langue Maternelle',
    nativeLanguageDescription: 'La langue avec laquelle vous êtes le plus à l\'aise',
    saveSettings: 'Enregistrer les Paramètres',
    settingsSavedSuccessfully: 'Paramètres enregistrés avec succès!',
    errorSavingSettings: 'Erreur lors de l\'enregistrement des paramètres. Veuillez réessayer.',
    loadingSettings: 'Chargement des paramètres...',
    
    // SelectedTextBlock
    selectedText: 'Texte Sélectionné',
    askMeAQuestion: 'Posez-moi une question',
    askAboutThisImage: 'Question sur cette image',
    explainGrammar: 'Expliquer la grammaire',
    
    // UnifiedSidebar
    selectTextToGetStarted: 'Sélectionnez du texte pour commencer!',
    selectTextFromPage: 'Sélectionnez du texte de la page pour commencer!',
    openAnyArticle: 'Ouvrez n\'importe quel article, billet de blog ou page d\'actualités dans la fenêtre principale.',
    highlightText: 'Surlignez ou cliquez sur du texte pour le traduire et enregistrer des mots',
    clickParagraph: 'Cliquez sur une image pour la discuter avec IA',
    useAskToGetExplanations: 'Utilisez Demander pour obtenir des explications et pratiquer.',
    ask: 'Demander',
    typeMessage: 'Tapez un message...',
    
    // TextbookPage
    languageTextbook: 'Livre de Langue',
    textbookSubtitle: 'Votre ressource d\'apprentissage complète',
    
    // VocabularyTable
    vocabulary: 'Vocabulaire',
    word: 'Mot',
    progress: 'Progrès',
    source: 'Source',
    actions: 'Actions',
    practice: 'Pratiquer',
    delete: 'Supprimer',
    reset: 'Réinitialiser',
    addWord: 'Ajouter un Mot',
    importWords: 'Importer des Mots',
    exportWords: 'Exporter des Mots',
    showing: 'Affichage',
    to: 'à',
    of: 'de',
    words: 'mots',
    noWordsYet: 'Pas encore de mots',
    startSelectingText: 'Commencez à sélectionner du texte pour construire votre vocabulaire!',
    allSources: 'Toutes les Sources',
    latest: 'Plus Récent',
    groupBySource: 'Grouper par Source',
    
    // AddWordModal
    addNewWord: 'Ajouter un Nouveau Mot',
    enterWord: 'Entrez le mot',
    enterTranslation: 'Entrez la traduction',
    languageCode: 'Code de Langue',
    languageCodePlaceholder: 'ex. nl, es, fr',
    autoTranslateToEnglish: 'Auto-traduire en anglais',
    adding: 'Ajout...',
    
    // ProductTour
    exploreWebpage: 'Explorez n\'importe quelle page web',
    exploreWebpageBody: 'Ceci est votre page web en direct. Vous pouvez sélectionner un article, un billet de blog ou une page d\'actualités pour commencer. Ensuite, sélectionnez n\'importe quel texte sur la page ou cliquez sur un paragraphe pour l\'envoyer ici et pratiquer.',
    selectionAppearsHere: 'Votre sélection apparaît ici',
    selectionAppearsBody: 'Le texte que vous sélectionnez est capturé ici. Vous pouvez interagir avec les mots et phrases pour les traduire et les enregistrer.',
    askOrExplain: 'Demander ou expliquer',
    askOrExplainBody: 'Utilisez Demander pour poser des questions sur la sélection et obtenir des explications.',
    translateAndSave: 'Traduire et enregistrer des mots',
    translateAndSaveBody: 'Surlignez un mot ou quelques mots dans votre sélection pour les traduire. Le bouton Suivant sera activé une fois que la fenêtre de traduction apparaît.',
    
    // Messages
    noTextSelected: 'Aucun texte sélectionné. Veuillez d\'abord sélectionner du texte.',
    imageQuestionsOnly: 'Les questions sur les images ne prennent en charge que l\'action "Question sur cette image".',
    aiFeaturesRequireChrome: 'Les fonctionnalités IA nécessitent Chrome 138+ avec support de Prompt API.',
    pleaseUpdateBrowser: 'Veuillez mettre à jour votre navigateur.',
    
    // Start Learning Button
    startLearning: 'Commencer à apprendre',
    clickToSelectFirst: 'Cliquez pour sélectionner le premier bloc de texte ou image sur la page',
    clickToSelectNext: 'Cliquez pour sélectionner le bloc de texte ou image suivant sur la page',
  },
  
  de: {
    // Common
    translate: 'Übersetzen',
    settings: 'Einstellungen',
    loading: 'Lädt...',
    saving: 'Speichern...',
    saved: 'Gespeichert',
    cancel: 'Abbrechen',
    close: 'Schließen',
    next: 'Weiter',
    previous: 'Zurück',
    finish: 'Beenden',
    copied: 'Kopiert!',
    error: 'Fehler',
    
    // TopBar
    backToClassroom: 'Zurück zum Klassenzimmer',
    translateTitle: 'Übersetzen',
    translateFrom: 'Von',
    translateTo: 'Nach',
    textToTranslate: 'Zu übersetzender Text',
    translation: 'Übersetzung',
    enterTextToTranslate: 'Text eingeben zum Übersetzen...',
    translationWillAppear: 'Übersetzung erscheint hier...',
    selectDifferentLanguages: 'Wählen Sie verschiedene Sprachen zum Übersetzen',
    translationRequiresChrome: 'Übersetzung erfordert Chrome 138+ mit Translator API-Unterstützung.',
    translationNotAvailable: 'Übersetzung nicht verfügbar',
    translationFailed: 'Übersetzung fehlgeschlagen',
    
    // Settings
    settingsTitle: 'Einstellungen',
    settingsSubtitle: 'Passen Sie Ihre Lernerfahrung an',
    yourNativeLanguage: 'Ihre Muttersprache',
    nativeLanguageDescription: 'Die Sprache, in der Sie sich am wohlsten fühlen',
    saveSettings: 'Einstellungen Speichern',
    settingsSavedSuccessfully: 'Einstellungen erfolgreich gespeichert!',
    errorSavingSettings: 'Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es erneut.',
    loadingSettings: 'Einstellungen laden...',
    
    // SelectedTextBlock
    selectedText: 'Ausgewählter Text',
    askMeAQuestion: 'Stellen Sie mir eine Frage',
    askAboutThisImage: 'Frage zu diesem Bild',
    explainGrammar: 'Grammatik erklären',
    
    // UnifiedSidebar
    selectTextToGetStarted: 'Wählen Sie Text aus, um zu beginnen!',
    selectTextFromPage: 'Wählen Sie Text von der Seite aus, um zu beginnen!',
    openAnyArticle: 'Öffnen Sie einen Artikel, Blogbeitrag oder eine Nachrichtenseite im Hauptfenster.',
    highlightText: 'Markieren oder klicken Sie auf Text, um ihn zu übersetzen und Wörter zu speichern',
    clickParagraph: 'Klicken Sie auf eine Bild, um es hier mit IA zu besprechen',
    useAskToGetExplanations: 'Verwenden Sie Fragen, um Erklärungen zu erhalten und zu üben.',
    ask: 'Fragen',
    typeMessage: 'Nachricht eingeben...',
    
    // TextbookPage
    languageTextbook: 'Sprachbuch',
    textbookSubtitle: 'Ihre umfassende Lernquelle',
    
    // VocabularyTable
    vocabulary: 'Wortschatz',
    word: 'Wort',
    progress: 'Fortschritt',
    source: 'Quelle',
    actions: 'Aktionen',
    practice: 'Üben',
    delete: 'Löschen',
    reset: 'Zurücksetzen',
    addWord: 'Wort Hinzufügen',
    importWords: 'Wörter Importieren',
    exportWords: 'Wörter Exportieren',
    showing: 'Zeige',
    to: 'bis',
    of: 'von',
    words: 'Wörter',
    noWordsYet: 'Noch keine Wörter',
    startSelectingText: 'Beginnen Sie mit der Auswahl von Text, um Ihren Wortschatz aufzubauen!',
    allSources: 'Alle Quellen',
    latest: 'Neueste',
    groupBySource: 'Nach Quelle gruppieren',
    
    // AddWordModal
    addNewWord: 'Neues Wort Hinzufügen',
    enterWord: 'Geben Sie das Wort ein',
    enterTranslation: 'Geben Sie die Übersetzung ein',
    languageCode: 'Sprachcode',
    languageCodePlaceholder: 'z.B. nl, es, fr',
    autoTranslateToEnglish: 'Automatisch ins Englische übersetzen',
    adding: 'Hinzufügen...',
    
    // ProductTour
    exploreWebpage: 'Erkunden Sie eine Webseite',
    exploreWebpageBody: 'Dies ist Ihre Live-Webseite. Sie können einen Artikel, Blogbeitrag oder eine Nachrichtenseite auswählen, um zu beginnen. Wählen Sie dann Text auf der Seite aus oder klicken Sie auf einen Absatz, um ihn hier zum Üben zu senden.',
    selectionAppearsHere: 'Ihre Auswahl erscheint hier',
    selectionAppearsBody: 'Der von Ihnen ausgewählte Text wird hier erfasst. Sie können mit Wörtern und Phrasen interagieren, um sie zu übersetzen und zu speichern.',
    askOrExplain: 'Fragen oder erklären',
    askOrExplainBody: 'Verwenden Sie Fragen, um Fragen zur Auswahl zu stellen und Erklärungen zu erhalten.',
    translateAndSave: 'Wörter übersetzen und speichern',
    translateAndSaveBody: 'Markieren Sie ein Wort oder einige Wörter in Ihrer Auswahl, um sie zu übersetzen. Die Schaltfläche Weiter wird aktiviert, sobald das Übersetzungsfenster erscheint.',
    
    // Messages
    noTextSelected: 'Kein Text ausgewählt. Bitte wählen Sie zuerst Text aus.',
    imageQuestionsOnly: 'Bildfragen unterstützen nur die Aktion "Frage zu diesem Bild".',
    aiFeaturesRequireChrome: 'KI-Funktionen erfordern Chrome 138+ mit Prompt API-Unterstützung.',
    pleaseUpdateBrowser: 'Bitte aktualisieren Sie Ihren Browser.',
    
    // Start Learning Button
    startLearning: 'Mit dem Lernen beginnen',
    clickToSelectFirst: 'Klicken Sie, um den ersten Textblock oder das erste Bild auf der Seite auszuwählen',
    clickToSelectNext: 'Klicken Sie, um den nächsten Textblock oder das nächste Bild auf der Seite auszuwählen',
  },
  
  it: {
    // Common
    translate: 'Traduci',
    settings: 'Impostazioni',
    loading: 'Caricamento...',
    saving: 'Salvataggio...',
    saved: 'Salvato',
    cancel: 'Annulla',
    close: 'Chiudi',
    next: 'Avanti',
    previous: 'Indietro',
    finish: 'Termina',
    copied: 'Copiato!',
    error: 'Errore',
    
    // TopBar
    backToClassroom: 'Torna all\'Aula',
    translateTitle: 'Traduci',
    translateFrom: 'Da',
    translateTo: 'A',
    textToTranslate: 'Testo da tradurre',
    translation: 'Traduzione',
    enterTextToTranslate: 'Inserisci il testo da tradurre...',
    translationWillAppear: 'La traduzione apparirà qui...',
    selectDifferentLanguages: 'Seleziona lingue diverse per tradurre',
    translationRequiresChrome: 'La traduzione richiede Chrome 138+ con supporto per Translator API.',
    translationNotAvailable: 'Traduzione non disponibile',
    translationFailed: 'Traduzione fallita',
    
    // Settings
    settingsTitle: 'Impostazioni',
    settingsSubtitle: 'Personalizza la tua esperienza di apprendimento',
    yourNativeLanguage: 'La Tua Lingua Madre',
    nativeLanguageDescription: 'La lingua con cui ti senti più a tuo agio',
    saveSettings: 'Salva Impostazioni',
    settingsSavedSuccessfully: 'Impostazioni salvate con successo!',
    errorSavingSettings: 'Errore nel salvare le impostazioni. Riprova.',
    loadingSettings: 'Caricamento impostazioni...',
    
    // SelectedTextBlock
    selectedText: 'Testo Selezionato',
    askMeAQuestion: 'Fammi una domanda',
    askAboutThisImage: 'Chiedi su questa immagine',
    explainGrammar: 'Spiega la grammatica',
    
    // UnifiedSidebar
    selectTextToGetStarted: 'Seleziona il testo per iniziare!',
    selectTextFromPage: 'Seleziona il testo dalla pagina per iniziare!',
    openAnyArticle: 'Apri qualsiasi articolo, post del blog o pagina di notizie nella finestra principale.',
    highlightText: 'Evidenzia il testo per tradurlo e salvare le parole',
    clickParagraph: 'Oppure fai clic su un paragrafo per inviarlo qui per domande',
    useAskToGetExplanations: 'Usa Chiedi per ottenere spiegazioni e praticare.',
    ask: 'Chiedi',
    typeMessage: 'Digita un messaggio...',
    
    // TextbookPage
    languageTextbook: 'Libro di Lingua',
    textbookSubtitle: 'La tua risorsa di apprendimento completa',
    
    // VocabularyTable
    vocabulary: 'Vocabolario',
    word: 'Parola',
    progress: 'Progresso',
    source: 'Fonte',
    actions: 'Azioni',
    practice: 'Pratica',
    delete: 'Elimina',
    reset: 'Reimposta',
    addWord: 'Aggiungi Parola',
    importWords: 'Importa Parole',
    exportWords: 'Esporta Parole',
    showing: 'Mostra',
    to: 'a',
    of: 'di',
    words: 'parole',
    noWordsYet: 'Ancora nessuna parola',
    startSelectingText: 'Inizia a selezionare il testo per costruire il tuo vocabolario!',
    allSources: 'Tutte le Fonti',
    latest: 'Più Recente',
    groupBySource: 'Raggruppa per Fonte',
    
    // AddWordModal
    addNewWord: 'Aggiungi Nuova Parola',
    enterWord: 'Inserisci la parola',
    enterTranslation: 'Inserisci la traduzione',
    languageCode: 'Codice Lingua',
    languageCodePlaceholder: 'es. nl, es, fr',
    autoTranslateToEnglish: 'Traduci automaticamente in inglese',
    adding: 'Aggiunta...',
    
    // ProductTour
    exploreWebpage: 'Esplora qualsiasi pagina web',
    exploreWebpageBody: 'Questa è la tua pagina web in tempo reale. Puoi selezionare un articolo, un post del blog o una pagina di notizie per iniziare. Quindi seleziona qualsiasi testo sulla pagina o fai clic su un paragrafo per inviarlo qui per esercitarti.',
    selectionAppearsHere: 'La tua selezione appare qui',
    selectionAppearsBody: 'Il testo che selezioni viene catturato qui. Puoi interagire con parole e frasi per tradurle e salvarle.',
    askOrExplain: 'Chiedi o spiega',
    askOrExplainBody: 'Usa Chiedi per porre domande sulla selezione e ottenere spiegazioni.',
    translateAndSave: 'Traduci e salva le parole',
    translateAndSaveBody: 'Evidenzia una parola o alcune parole nella tua selezione per tradurle. Il pulsante Avanti verrà abilitato una volta che appare la finestra di traduzione.',
    
    // Messages
    noTextSelected: 'Nessun testo selezionato. Seleziona prima del testo.',
    imageQuestionsOnly: 'Le domande sulle immagini supportano solo l\'azione "Chiedi su questa immagine".',
    aiFeaturesRequireChrome: 'Le funzionalità AI richiedono Chrome 138+ con supporto per Prompt API.',
    pleaseUpdateBrowser: 'Aggiorna il tuo browser.',
    
    // Start Learning Button
    startLearning: 'Inizia ad apprendere',
    clickToSelectFirst: 'Fai clic per selezionare il primo blocco di testo o immagine sulla pagina',
    clickToSelectNext: 'Fai clic per selezionare il blocco di testo o immagine successivo sulla pagina',
  },
  
  pt: {
    // Common
    translate: 'Traduzir',
    settings: 'Configurações',
    loading: 'Carregando...',
    saving: 'Salvando...',
    saved: 'Salvo',
    cancel: 'Cancelar',
    close: 'Fechar',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    copied: 'Copiado!',
    error: 'Erro',
    
    // TopBar
    backToClassroom: 'Voltar à Sala',
    translateTitle: 'Traduzir',
    translateFrom: 'De',
    translateTo: 'Para',
    textToTranslate: 'Texto para traduzir',
    translation: 'Tradução',
    enterTextToTranslate: 'Digite o texto para traduzir...',
    translationWillAppear: 'A tradução aparecerá aqui...',
    selectDifferentLanguages: 'Selecione idiomas diferentes para traduzir',
    translationRequiresChrome: 'A tradução requer Chrome 138+ com suporte para Translator API.',
    translationNotAvailable: 'Tradução não disponível',
    translationFailed: 'Tradução falhou',
    
    // Settings
    settingsTitle: 'Configurações',
    settingsSubtitle: 'Personalize sua experiência de aprendizado',
    yourNativeLanguage: 'Seu Idioma Nativo',
    nativeLanguageDescription: 'O idioma com o qual você se sente mais confortável',
    saveSettings: 'Salvar Configurações',
    settingsSavedSuccessfully: 'Configurações salvas com sucesso!',
    errorSavingSettings: 'Erro ao salvar as configurações. Tente novamente.',
    loadingSettings: 'Carregando configurações...',
    
    // SelectedTextBlock
    selectedText: 'Texto Selecionado',
    askMeAQuestion: 'Me faça uma pergunta',
    askAboutThisImage: 'Pergunte sobre esta imagem',
    explainGrammar: 'Explicar gramática',
    
    // UnifiedSidebar
    selectTextToGetStarted: 'Selecione texto para começar!',
    selectTextFromPage: 'Selecione texto da página para começar!',
    openAnyArticle: 'Abra qualquer artigo, post de blog ou página de notícias na janela principal.',
    highlightText: 'Destaque ou clique em texto para traduzi-lo e salvar palavras',
    clickParagraph: 'Clique em uma imagem para discutir com IA',
    useAskToGetExplanations: 'Use Perguntar para obter explicações e praticar.',
    ask: 'Perguntar',
    typeMessage: 'Digite uma mensagem...',
    
    // TextbookPage
    languageTextbook: 'Livro de Idioma',
    textbookSubtitle: 'Seu recurso de aprendizado abrangente',
    
    // VocabularyTable
    vocabulary: 'Vocabulário',
    word: 'Palavra',
    progress: 'Progresso',
    source: 'Fonte',
    actions: 'Ações',
    practice: 'Praticar',
    delete: 'Excluir',
    reset: 'Redefinir',
    addWord: 'Adicionar Palavra',
    importWords: 'Importar Palavras',
    exportWords: 'Exportar Palavras',
    showing: 'Mostrando',
    to: 'até',
    of: 'de',
    words: 'palavras',
    noWordsYet: 'Ainda não há palavras',
    startSelectingText: 'Comece a selecionar texto para construir seu vocabulário!',
    allSources: 'Todas as Fontes',
    latest: 'Mais Recente',
    groupBySource: 'Agrupar por Fonte',
    
    // AddWordModal
    addNewWord: 'Adicionar Nova Palavra',
    enterWord: 'Digite a palavra',
    enterTranslation: 'Digite a tradução',
    languageCode: 'Código de Idioma',
    languageCodePlaceholder: 'ex. nl, es, fr',
    autoTranslateToEnglish: 'Traduzir automaticamente para inglês',
    adding: 'Adicionando...',
    
    // ProductTour
    exploreWebpage: 'Explore qualquer página da web',
    exploreWebpageBody: 'Esta é sua página da web ao vivo. Você pode selecionar um artigo, post de blog ou página de notícias para começar. Em seguida, selecione qualquer texto na página ou clique em um parágrafo para enviá-lo aqui para praticar.',
    selectionAppearsHere: 'Sua seleção aparece aqui',
    selectionAppearsBody: 'O texto que você seleciona é capturado aqui. Você pode interagir com palavras e frases para traduzi-las e salvá-las.',
    askOrExplain: 'Perguntar ou explicar',
    askOrExplainBody: 'Use Perguntar para fazer perguntas sobre a seleção e obter explicações.',
    translateAndSave: 'Traduzir e salvar palavras',
    translateAndSaveBody: 'Destaque uma palavra ou algumas palavras em sua seleção para traduzi-las. O botão Próximo será habilitado assim que a janela de tradução aparecer.',
    
    // Messages
    noTextSelected: 'Nenhum texto selecionado. Selecione texto primeiro.',
    imageQuestionsOnly: 'Perguntas sobre imagens suportam apenas a ação "Pergunte sobre esta imagem".',
    aiFeaturesRequireChrome: 'Recursos de IA requerem Chrome 138+ com suporte para Prompt API.',
    pleaseUpdateBrowser: 'Atualize seu navegador.',
    
    // Start Learning Button
    startLearning: 'Começar a aprender',
    clickToSelectFirst: 'Clique para selecionar o primeiro bloco de texto ou imagem na página',
    clickToSelectNext: 'Clique para selecionar o próximo bloco de texto ou imagem na página',
  },
};

// Default fallback language
const defaultLanguage = 'en';

// Get translation for a key
export const getTranslation = (key, language = defaultLanguage) => {
  const lang = translations[language] || translations[defaultLanguage];
  return lang[key] || key;
};


