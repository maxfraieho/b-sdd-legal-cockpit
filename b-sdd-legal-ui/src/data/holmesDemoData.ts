// =========================================================================
// B-SDD LEGAL COCKPIT · FICTIONAL HOLMES DEMO DATASET (Sprint S018)
// Case: «Affaire Irene Adler & Roi de Bohême» (PE24.DEMO-HOLMES)
// 100% Fictional / Zero PII / Canton de Vaud Swiss CPP Framework
// =========================================================================

import {
  ActorItem,
  BordereauPiece,
  CriminalCharge,
  ConfrontationItem,
  LegalRequisition,
} from './legalData';
import { LegalCase } from '../lib/casesManager';

export const HOLMES_CASE: LegalCase = {
  id: 'PE24.DEMO-HOLMES',
  reference: 'DEMO: Affaire Irene Adler',
  title: {
    uk: 'Справа «Ірен Адлер та Король Богемії» (Скандал у Богемії)',
    fr: 'Affaire Irene Adler c/ Roi de Bohême (Un scandale en Bohême)',
    de: 'Rechtssache Irene Adler gegen König von Böhmen (Ein Skandal in Böhmen)',
    it: 'Causa Irene Adler c/ Re di Boemia (Uno scandalo in Boemia)',
    en: 'Irene Adler & King of Bohemia (A Scandal in Bohemia)',
  },
  court: {
    uk: 'Прокуратура кантону Во · Округ Лозанна',
    fr: 'Ministère public du Canton de Vaud · Arrondissement de Lausanne',
    de: 'Staatsanwaltschaft des Kantons Waadt · Bezirk Lausanne',
    it: 'Ministero pubblico del Canton Vaud · Circondario di Losanna',
    en: 'Public Prosecutor of the Canton of Vaud · Lausanne District',
  },
  canton: 'Vaud',
  type: 'penal',
  client_name: 'Wilhelm von ORMSTEIN (Roi de Bohême)',
  client_role: {
    uk: 'Потерпілий & Цивільний позивач (Шантаж)',
    fr: 'Partie plaignante & Demandeur civil (Extorsion alléguée)',
    de: 'Geschädigter & Zivilkläger (Erpressungsvorwurf)',
    it: 'Persona lesa & Accusatore privato (Ricatto asserito)',
    en: 'Complainant & Civil Plaintiff (Alleged Extortion)',
  },
  status: 'active',
  is_benchmark: true,
  created_at: '2024-01-15T08:00:00Z',
  updated_at: '2026-09-30T12:00:00Z',
  description: {
    uk: 'Вигадане навчальне судове досьє: розслідування замаху на шантаж та примус (ст. 181, 180, 146 CP) щодо королівської родини через володіння компрометуючою фотокарткою.',
    fr: 'Dossier judiciaire d\'école entièrement fictif: instruction pour tentative d\'extorsion et contrainte (Art. 181, 180, 146 CP) relative à la détention d\'un cliché compromettant.',
    de: 'Fiktives Schulungsdossier: Untersuchung wegen Nötigung und Erpressung (Art. 181, 180, 146 StGB) betreffend ein kompromittierendes Foto.',
    it: 'Fascicolo giudiziario dimostrativo: indagine per tentata estorsione e coazione (Art. 181, 180, 146 CP).',
    en: 'Fictional training legal dossier: investigation for coercion and extortion (Art. 181, 180, 146 Swiss Criminal Code) involving a compromising cabinet photograph.',
  },
  sequestration_target_chf: 125000,
};

export const HOLMES_ACTORS: ActorItem[] = [
  {
    id: 'ACT-HOLMES-01',
    name: 'Sherlock HOLMES',
    age: 38,
    birthdate: '06.01.1854',
    status: {
      uk: 'Судовий експерт / Приватний детектив',
      fr: 'Expert mandaté / Enquêteur forensique',
      de: 'Beauftragter Experte / Forensischer Ermittler',
      it: 'Esperto nominato / Investigatore forense',
      en: 'Appointed Forensic Investigator / Expert',
    },
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    role: {
      uk: 'Головний судовий експерт та приватний слідчий, найнятий Королем Богемії для встановлення місцезнаходження та вилучення компрометуючого фотознімку.',
      fr: 'Enquêteur indépendant et expert mandaté par le souverain pour localiser et préserver le cliché original sans violation de domicile.',
      de: 'Unabhängiger Ermittler und forensischer Gutachter zur Auffindung des Originalfotos.',
      it: 'Investigatore indipendente ed esperto nominato per il recupero del reperto originale.',
      en: 'Independent forensic investigator appointed to locate and secure the compromise photograph.',
    },
    protected_bona_fide: false,
    legal_reference: 'Art. 182, 184 CPP (Expertise et constatation judiciaire)',
    procedural_standing: 'avocat',
    cpp_article: 'Art. 182-185 CPP',
    discernment_capacity: true,
    nationality: {
      uk: 'Велика Британія (Лондон, Бейкер-стріт 221B)',
      fr: 'Royaume-Uni (221B Baker Street, Londres)',
      de: 'Vereinigtes Königreich (221B Baker Street)',
      it: 'Regno Unito (221B Baker Street)',
      en: 'United Kingdom (221B Baker Street, London)',
    },
    domicile: {
      uk: '221B Baker Street, London / Résidence temporaire Lausanne',
      fr: '221B Baker Street, Londres / Séjour temporaire à Lausanne',
      de: '221B Baker Street, London / Gastaufenthalt Lausanne',
      it: '221B Baker Street, Londra',
      en: '221B Baker Street, London',
    },
    financial_claim_chf: 15000.0,
    risk_level: 'medium',
    droits_proceduraux: {
      uk: [
        'Подання офіційного експертного звіту (ст. 184 КПК)',
        'Огляд речових доказів у кримінальному процесі (ст. 192 КПК)',
      ],
      fr: [
        'Dépôt d\'un rapport d\'expertise forensique assermenté (Art. 184 CPP)',
        'Examen direct des pièces à conviction scellées (Art. 192 CPP)',
      ],
      de: [
        'Einreichung des Gutachtens (Art. 184 StPO)',
        'Einsicht in Beweismittel (Art. 192 StPO)',
      ],
      it: [
        'Deposito della perizia forense (Art. 184 CPP)',
        'Esame dei reperti sigillati (Art. 192 CPP)',
      ],
      en: [
        'Submission of sworn forensic expert report (Art. 184 CPC)',
        'Examination of sealed physical evidence (Art. 192 CPC)',
      ],
    },
    linked_pieces: ['DEMO-P-01', 'DEMO-P-03', 'DEMO-P-04'],
  },
  {
    id: 'ACT-ADLER-02',
    name: 'Irene ADLER («La Femme»)',
    age: 32,
    birthdate: '12.04.1860',
    status: {
      uk: 'Обвинувачена / Власниця доказу (Défenderesse)',
      fr: 'Prévenue / Détentrice de la preuve',
      de: 'Beschuldigte / Beweismittel-Besitzerin',
      it: 'Imputata / Detentrice della prova',
      en: 'Primary Accused / Evidence Holder',
    },
    badgeColor: 'bg-red-950/80 text-red-300 border-red-700/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
    role: {
      uk: 'Примадонна Імперської опери Варшави. Володіє оригіналом спільного фото з королем. Категорично відкидає наміри вимагання грошей, стверджуючи про захист від свавілля.',
      fr: 'Cantatrice émérite de l\'Opéra Impérial. Détentrice du cliché grand format. Conteste toute tentative de chantage pécuniaire, plaidant la légitime défense préventive.',
      de: 'Opernsängerin. Inhaberin des kompromittierenden Bildes. Bestreitet jede Erpressungsabsicht.',
      it: 'Cantante lirica. Detentrice della fotografia. Nega qualsiasi tentativo di estorsione.',
      en: 'Opera prima donna. Possessor of the cabinet photograph. Denies financial blackmail intent.',
    },
    protected_bona_fide: false,
    legal_reference: 'Art. 157, 158 CPP (Droits de la défense et présomption d\'innocence)',
    procedural_standing: 'prevenue',
    cpp_article: 'Art. 157, 158 CPP',
    discernment_capacity: true,
    nationality: {
      uk: 'Сполучені Штати Америки (Нью-Джерсі)',
      fr: 'États-Unis d\'Amérique (New Jersey)',
      de: 'Vereinigte Staaten (New Jersey)',
      it: 'Stati Uniti (New Jersey)',
      en: 'United States of America (New Jersey)',
    },
    domicile: {
      uk: 'Briony Lodge, Serpentine Avenue, St. John\'s Wood, London',
      fr: 'Briony Lodge, Serpentine Avenue, St. John\'s Wood, Londres',
      de: 'Briony Lodge, St. John\'s Wood, London',
      it: 'Briony Lodge, St. John\'s Wood, Londra',
      en: 'Briony Lodge, St. John\'s Wood, London',
    },
    financial_claim_chf: 0.0,
    risk_level: 'high',
    droits_proceduraux: {
      uk: [
        'Право зберігати мовчання та не свідчити проти себе (ст. 113 КПК)',
        'Право на негайний доступ до захисника (ст. 159 КПК)',
        'Право вимагати відхилення недопустимих доказів (ст. 141 КПК)',
      ],
      fr: [
        'Droit de garder le silence et de ne pas s\'auto-incriminer (Art. 113 CPP)',
        'Droit à l\'assistance immédiate d\'un défenseur (Art. 159 CPP)',
        'Droit d\'invoquer l\'inexploitabilité des preuves illicites (Art. 141 CPP)',
      ],
      de: [
        'Aussageverweigerungsrecht (Art. 113 StPO)',
        'Recht auf Rechtsbeistand (Art. 159 StPO)',
        'Unverwertbarkeit illegaler Beweise (Art. 141 StPO)',
      ],
      it: [
        'Diritto di non autoincriminarsi (Art. 113 CPP)',
        'Diritto alla difesa tecnica (Art. 159 CPP)',
        'Inutilizzabilità delle prove illecite (Art. 141 CPP)',
      ],
      en: [
        'Right to remain silent (Art. 113 CPC)',
        'Right to counsel assistance (Art. 159 CPC)',
        'Inadmissibility of illicit evidence (Art. 141 CPC)',
      ],
    },
    linked_pieces: ['DEMO-P-01', 'DEMO-P-02'],
  },
  {
    id: 'ACT-WATSON-03',
    name: 'Dr. John H. WATSON',
    age: 40,
    birthdate: '07.07.1852',
    status: {
      uk: 'Тілесно-медичний експерт / Свідок (Témoin)',
      fr: 'Médecin légiste / Témoin oculaire assermenté',
      de: 'Gerichtsmediziner / Zeuge',
      it: 'Medico legale / Testimone oculare',
      en: 'Forensic Medical Expert / Witness',
    },
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    role: {
      uk: 'Лікар та очевидець операції на Serpentine Avenue. Надав медичний та хімічний висновок щодо димової шашки з ефектом імітації пожежі.',
      fr: 'Docteur en médecine et témoin de l\'intervention à Briony Lodge. A rédigé le constat technique du dispositif fumigène non toxique.',
      de: 'Arzt und Augenzeuge. Verfasste den Bericht über den Rauchkörper.',
      it: 'Medico e testimone oculare. Ha redatto la perizia tecnica sul fumogeno.',
      en: 'Medical doctor and eyewitness. Authored the technical report on the harmless smoke grenade.',
    },
    protected_bona_fide: false,
    legal_reference: 'Art. 162-177 CPP (Témoignage et déposition sous serment)',
    procedural_standing: 'temoin',
    cpp_article: 'Art. 162 CPP',
    discernment_capacity: true,
    nationality: {
      uk: 'Велика Британія',
      fr: 'Royaume-Uni',
      de: 'Vereinigtes Königreich',
      it: 'Regno Unito',
      en: 'United Kingdom',
    },
    domicile: {
      uk: '221B Baker Street, London',
      fr: '221B Baker Street, Londres',
      de: '221B Baker Street, London',
      it: '221B Baker Street, Londra',
      en: '221B Baker Street, London',
    },
    financial_claim_chf: 0.0,
    risk_level: 'low',
    droits_proceduraux: {
      uk: ['Право на захист честі та гідності при допиті (ст. 177 КПК)'],
      fr: ['Droit à l\'indemnisation des témoins convoqués (Art. 177 CPP)'],
      de: ['Entschädigung für Zeugen (Art. 177 StPO)'],
      it: ['Indennità testimoniale (Art. 177 CPP)'],
      en: ['Witness compensation and procedural rights (Art. 177 CPC)'],
    },
    linked_pieces: ['DEMO-P-03'],
  },
  {
    id: 'ACT-ROYAL-04',
    name: 'Wilhelm Gottsreich Sigismond von ORMSTEIN',
    age: 35,
    birthdate: '10.09.1856',
    status: {
      uk: 'Потерпілий / Монарх Богемії (Partie Plaignante)',
      fr: 'Partie plaignante / Victime constituée (Roi de Bohême)',
      de: 'Privatkläger / Geschädigter (König von Böhmen)',
      it: 'Parte attrice privata / Persona lesa (Re di Boemia)',
      en: 'Civil Complainant / Victim (King of Bohemia)',
    },
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    role: {
      uk: 'Спадковий монарх Богемії. Потерпілий від загрози розголошення приватного зв\'язку перед династичним шлюбом зі скандинавською принцесою Клотільдою.',
      fr: 'Souverain régnant de Bohême. Victime d\'un risque de contrainte et de chantage politique avant son mariage princier.',
      de: 'König von Böhmen. Geschädigter durch drohende Veröffentlichung.',
      it: 'Re di Boemia. Persona lesa da minaccia di pubblicazione pregiudizievole.',
      en: 'Reigning King of Bohemia. Victim of threat of disclosure before royal wedding.',
    },
    protected_bona_fide: false,
    legal_reference: 'Art. 115, 118 CPP (Qualité de partie plaignante)',
    procedural_standing: 'victime_plaignante',
    cpp_article: 'Art. 115, 118 CPP',
    discernment_capacity: true,
    nationality: {
      uk: 'Королівство Богемія (Прага)',
      fr: 'Royaume de Bohême (Prague)',
      de: 'Königreich Böhmen (Prag)',
      it: 'Regno di Boemia (Praga)',
      en: 'Kingdom of Bohemia (Prague)',
    },
    domicile: {
      uk: 'Королівський палац, Прага / Місія в Швейцарії',
      fr: 'Palais Royal de Prague / Mission diplomatique en Suisse',
      de: 'Königlicher Palast Prag / Diplomatische Vertretung Schweiz',
      it: 'Palazzo Reale di Praga / Missione diplomatica in Svizzera',
      en: 'Royal Palace, Prague / Diplomatic Mission in Switzerland',
    },
    financial_claim_chf: 125000.0,
    risk_level: 'high',
    droits_proceduraux: {
      uk: [
        'Подання цивільного позову за моральну шкоду (ст. 122 КПК)',
        'Клопотання про невідкладне накладення арешту на негатив (ст. 263 КПК)',
      ],
      fr: [
        'Conclusions civiles formelles d\'adhésion au pénal (Art. 122 CPP)',
        'Réquisition de séquestre conservatoire immédiat (Art. 263 CPP)',
      ],
      de: [
        'Adhäsionsklage auf Genugtuung (Art. 122 StPO)',
        'Beschlagnahmeantrag nach Art. 263 StPO',
      ],
      it: [
        'Azione civile per danno morale (Art. 122 CPP)',
        'Istanza di sequestro conservativo (Art. 263 CPP)',
      ],
      en: [
        'Formal civil adhesion claims (Art. 122 CPC)',
        'Urgent seizure request under Art. 263 CPC',
      ],
    },
    linked_pieces: ['DEMO-P-01', 'DEMO-P-02', 'DEMO-P-04'],
  },
];

export const HOLMES_PIECES: BordereauPiece[] = [
  {
    cote: 'DEMO-P-01',
    date_faits: '1888-03-20',
    date_versement: '2026-09-30',
    titre: {
      uk: 'Фотокартка формату «кабінет»: Суверен та Ірен Адлер на терасі',
      fr: 'Photographie cabinet: Le Souverain et Irene Adler à Briony Lodge',
      en: 'Cabinet photograph: The Sovereign and Irene Adler at Briony Lodge',
    },
    categorie: 'Photo EXIF',
    sha256: '9f83c126487e45b8e9a2b5349f28d8b1e4c76a9f0284759a1c8f302b11e8a93c',
    admissibilite: {
      fr: 'Admissible sous Art. 139 al. 2 CPP (licéité de la détention initiale par la défenderesse).',
      uk: 'Допустимий доказ за ст. 139 ч. 2 КПК (правомірність початкового володіння знімком).',
      en: 'Admissible under Art. 139 para. 2 CPC (lawful initial possession by defendant).',
    },
    portee_probatoire: {
      fr: 'Prouve la matérialité de la liaison antérieure et constitue l\'objet matériel de la tentative de contrainte (Art. 181 CP).',
      uk: 'Доводить матеріальний факт попереднього знайомства та виступає об\'єктом примусу (ст. 181 CP).',
      en: 'Proves the historical relationship and constitutes the corpus of the coercion charge.',
    },
    citation_cle: {
      fr: '«Une photographie grand format cabinet représentant les deux protagonistes ensemble sur la terrasse de Briony Lodge.»',
      uk: '«Фотографія великого кабінетного формату, де обидва фігуранти зображені разом на терасі Бріоні Лодж.»',
      en: '«A cabinet-sized photograph depicting both individuals together on the terrace of Briony Lodge.»',
    },
    fichier_local: 'CABINET_PHOTO_ADLER_ORMSTEIN_1888.jpg',
    exif_meta: {
      camera: 'Chambre Sanderson 5x7 Émulsion Sèche',
      lens: 'Dallmeyer Rapid Rectilinear 8-inch',
      timestamp: '1888-03-20T15:30:00Z',
      gps: '51.5333° N, 0.1833° W (St. John\'s Wood, London)',
      iso: 25,
      aperture: 'f/8.0',
      alibi_verification: {
        fr: 'Plaque gélatino-argentique authentifiée conforme aux émulsions de mars 1888.',
        uk: 'Желатино-срібна пластина автентифікована згідно з хімічними стандартами березня 1888 р.',
        en: 'Gelatin silver dry plate authenticated to chemical baseline of March 1888.',
      },
    },
  },
  {
    cote: 'DEMO-P-02',
    date_faits: '1888-03-22',
    date_versement: '2026-09-30',
    titre: {
      uk: 'Оригінал листа Ірен Адлер, залишеного у сховку Briony Lodge',
      fr: 'Lettre autographe d\'Irene Adler scellée et adressée à Sherlock Holmes',
      en: 'Autograph sealed letter by Irene Adler addressed to Sherlock Holmes',
    },
    categorie: 'Message',
    sha256: '5d41402abc4b2a76b9719d911017c5926b4e3a09d3b1e7f62d1838841a02102f',
    admissibilite: {
      fr: 'Admissible de plein droit sous Art. 139 al. 1 CPP (titre documentaire abandonné volontairement).',
      uk: 'Допустимий доказ за ст. 139 ч. 1 КПК (документ, добровільно залишений адресатам).',
      en: 'Admissible under Art. 139 para. 1 CPC (voluntarily left documentary title).',
    },
    portee_probatoire: {
      fr: 'Établit l\'engagement unilatéral de ne pas faire usage du cliché sauf agression de la partie plaignante, disqualifiant l\'escroquerie vénale.',
      uk: 'Встановлює одностороннє зобов\'язання не оприлюднювати знімок, спростовуючи корисливий мотив шахрайства.',
      en: 'Establishes unilateral pledge not to publish the picture unless attacked, negating venal fraud.',
    },
    citation_cle: {
      fr: '«Le Roi peut faire ce qu\'il lui plaît sans crainte d\'une femme qu\'il a si cruellement sous-estimée. Je garde le cliché uniquement pour ma sauvegarde.»',
      uk: '«Король може чинити як забажає без страху перед жінкою, яку він так жорстоко недооцінив. Я зберігаю фото виключно для власної безпеки.»',
      en: '«The King may do what he will without hindrance from one whom he has cruelly wronged. I keep it only to safeguard myself.»',
    },
    fichier_local: 'LETTRE_AUTOGRAPHE_IRENE_ADLER_1888.pdf',
  },
  {
    cote: 'DEMO-P-03',
    date_faits: '1888-03-21',
    date_versement: '2026-09-30',
    titre: {
      uk: 'Експертний звіт доктора Ватсона щодо димового заряду в церкві св. Моніки',
      fr: 'Rapport toxicologique et balistique du fumigène de l\'église St. Monica',
      en: 'Toxicological and ballistic report on St. Monica smoke cartridge',
    },
    categorie: 'Procédure',
    sha256: '7d793037a0760186574b0282f2f435e7b1e5a614d82697ff3177c7a3b3142f56',
    admissibilite: {
      fr: 'Admissible sous Art. 184 CPP (rapport d\'homme de l\'art certifié conforme).',
      uk: 'Допустимий експертний висновок за ст. 184 КПК.',
      en: 'Admissible under Art. 184 CPC as verified expert findings.',
    },
    portee_probatoire: {
      fr: 'Confirme l\'absence de danger pyrotechnique mortel et la nature purement tactique du leurre destiné à révéler la cachette.',
      uk: 'Підтверджує відсутність смертельної піротехнічної загрози та суто тактичний характер прийому.',
      en: 'Confirms non-lethal nature of the tactical smoke device deployed to reveal the hideout.',
    },
    citation_cle: {
      fr: '«Composition: salpêtre et soufre sans charge explosive. Dispersion dense de fumée blanche sans toxicité respiratoire aiguë.»',
      uk: '«Склад: селітра та сірка без детонатора. Щільне розсіювання білого диму без токсичного отруєння.»',
      en: '«Composition: potassium nitrate and sulphur without detonator. Dense white smoke without acute toxicity.»',
    },
    fichier_local: 'RAPPORT_WATSON_FUMIGENE_ST_MONICA.pdf',
  },
  {
    cote: 'DEMO-P-04',
    date_faits: '1888-03-19',
    date_versement: '2026-09-30',
    titre: {
      uk: 'Банківський чек на суму 1 000 фунтів стерлінгів золотом (Banque Nationale)',
      fr: 'Quittance bancaire d\'acompte d\'honoraires de £1\'000 or (Banque Nationale)',
      en: 'Bank receipt of £1,000 gold retainer fees (National Bank)',
    },
    categorie: 'Bancaire',
    sha256: '3a5f82c04e76a91d2c67b5e4392a01f8d9b6c430e782a15f9d2e1b4c3087a912',
    admissibilite: {
      fr: 'Admissible de plein droit sous Art. 139 al. 1 CPP (titre de paiement authentique).',
      uk: 'Допустимий доказ за ст. 139 ч. 1 КПК (офіційний розрахунковий документ).',
      en: 'Admissible under Art. 139 para. 1 CPC as authentic banking title.',
    },
    portee_probatoire: {
      fr: 'Atteste du mandat onéreux et justifie les prétentions civiles d\'indemnisation au titre des dépens de l\'instruction (Art. 429 CPP).',
      uk: 'Підтверджує оплатний характер слідчого мандату та обґрунтовує витрати на процес (ст. 429 КПК).',
      en: 'Certifies professional retainer fees supporting cost recovery claims under Art. 429 CPC.',
    },
    citation_cle: {
      fr: '«Reçu du Souverain de Bohême la somme de £300 en espèces et £700 en billets de banque au porteur pour frais de recherche.»',
      uk: '«Отримано від Суверена Богемії суму £300 золотом та £700 банкнотами на покриття слідчих витрат.»',
      en: '«Received from the Sovereign of Bohemia £300 in gold and £700 in banknotes for investigation costs.»',
    },
    fichier_local: 'BCV_QUITTANCE_1000_LIVRES_1888.pdf',
  },
];

export const HOLMES_CHARGES: CriminalCharge[] = [
  {
    id: 'CH-DEMO-01',
    code: 'Art. 181 CP',
    title: {
      uk: 'Примус (Contrainte / Nötigung)',
      fr: 'Contrainte (Art. 181 CP)',
      en: 'Unlawful Coercion (Art. 181 SCC)',
    },
    accused: 'Irene ADLER',
    accused_id: 'ACT-ADLER-02',
    victim: {
      uk: 'Wilhelm von ORMSTEIN',
      fr: 'Wilhelm von ORMSTEIN',
      en: 'Wilhelm von ORMSTEIN',
    },
    status: 'contested',
    atf_ruling: {
      fr: 'ATF 141 IV 1: La contrainte suppose une entrave substantielle à la liberté d\'action par la menace d\'un dommage sérieux.',
      uk: 'ATF 141 IV 1: Примус вимагає істотного обмеження свободи дій шляхом загрози серйозної шкоди.',
      en: 'ATF 141 IV 1: Coercion requires substantial restriction of free agency through threat of serious harm.',
    },
    conclusions_penales: {
      fr: 'Constater l\'absence d\'intention délictueuse vénale à la suite de la lettre de désistement DEMO-P-02.',
      uk: 'Констатувати відсутність корисливого умислу після виявлення відмовного листа DEMO-P-02.',
      en: 'Find absence of unlawful venal intent following discovery of letter DEMO-P-02.',
    },
    conclusions_civiles: {
      fr: 'Débouter la partie plaignante de ses conclusions civiles en réparation du tort moral.',
      uk: 'Відмовити цивільному позивачеві у відшкодуванні моральної шкоди.',
      en: 'Dismiss civil claims for moral damages.',
    },
    elements: [
      {
        id: 'EL-01',
        title: {
          fr: 'Usage d\'un moyen de pression illicite',
          uk: 'Використання протиправного засобу тиску',
          en: 'Use of unlawful means of pressure',
        },
        description: {
          fr: 'Détention du cliché cabinet et menace implicite d\'envoi aux parents de la fiancée princière.',
          uk: 'Утримання фотознімку та неявна погроза надіслати його родині нареченої.',
          en: 'Possession of cabinet photograph with implicit threat of dispatch to bride\'s family.',
        },
        status: 'contested',
        citations: [
          {
            evidence_id: 'DEMO-P-01',
            cote: 'DEMO-P-01',
            title: 'Cabinet photographique',
            timecode: '1888-03-20',
            sha256: '9f83c126487e45b8e9a2b5349f28d8b1e4c76a9f0284759a1c8f302b11e8a93c',
            quote: {
              fr: '«Une photographie grand format cabinet...»',
              uk: '«Фотографія великого кабінетного формату...»',
              en: '«A cabinet-sized photograph...»',
            },
            admissibility: {
              fr: 'Admissible Art. 139 CPP',
              uk: 'Допустимий ст. 139 КПК',
              en: 'Admissible Art. 139 CPC',
            },
          },
        ],
      },
    ],
    supporting_cotes: ['DEMO-P-01', 'DEMO-P-02'],
  },
  {
    id: 'CH-DEMO-02',
    code: 'Art. 180 CP',
    title: {
      uk: 'Погрози (Menaces / Drohung)',
      fr: 'Menaces (Art. 180 CP)',
      en: 'Criminal Threats (Art. 180 SCC)',
    },
    accused: 'Irene ADLER',
    accused_id: 'ACT-ADLER-02',
    victim: {
      uk: 'Wilhelm von ORMSTEIN',
      fr: 'Wilhelm von ORMSTEIN',
      en: 'Wilhelm von ORMSTEIN',
    },
    status: 'contested',
    atf_ruling: {
      fr: 'ATF 134 IV 140: L\'infraction de menaces exige d\'alarmer ou d\'effrayer la victime par l\'annonce d\'un préjudice grave.',
      uk: 'ATF 134 IV 140: Склад погроз вимагає залякування потерпілого оголошенням тяжких наслідків.',
      en: 'ATF 134 IV 140: Menaces offense requires terrifying the victim with serious prejudice.',
    },
    conclusions_penales: {
      fr: 'Classer la procédure sous Art. 319 al. 1 let. b CPP pour absence d\'éléments constitutifs.',
      uk: 'Закрити провадження за ст. 319 ч. 1 п. b КПК за відсутністю складу злочину.',
      en: 'Dismiss proceeding under Art. 319 para. 1 let. b CPC.',
    },
    conclusions_civiles: {
      fr: 'Mettre les frais de procédure à la charge de l\'État (Art. 423 CPP).',
      uk: 'Покласти судові витрати на державу (ст. 423 КПК).',
      en: 'Allocate costs to the State (Art. 423 CPC).',
    },
    elements: [],
    supporting_cotes: ['DEMO-P-01'],
  },
];

export const HOLMES_CONFRONTATIONS: ConfrontationItem[] = [
  {
    id: 'CONF-DEMO-01',
    theme: {
      uk: 'Інцидент у церкві св. Моніки та імітація пожежі в Briony Lodge',
      fr: 'Simulation de l\'incendie à Briony Lodge et perquisition occulte',
      en: 'St. Monica smoke deception and covert search at Briony Lodge',
    },
    prevenue_allegation: {
      fr: 'Irene Adler affirme avoir percé à jour le déguisement de Sherlock Holmes dès l\'irruption du pasteur blessé.',
      uk: 'Ірен Адлер стверджує, що розгадала маскування Холмса в образі пораненого священника.',
      en: 'Irene Adler states she recognized Holmes\'s clergyman disguise immediately.',
    },
    corroborated_reality: {
      fr: 'Le rapport Watson (DEMO-P-03) atteste d\'une mise en scène purement visuelle sans mise en danger concrète de la vie d\'autrui.',
      uk: 'Звіт Ватсона (DEMO-P-03) підтверджує суто візуальну постановку без небезпеки для життя.',
      en: 'Watson report confirms theatrical smoke with zero physical danger.',
    },
    inconsistency_point: {
      fr: 'La partie plaignante contestait avoir eu recours à des méthodes d\'intrusion extralégales.',
      uk: 'Потерпілий заперечував використання позасудових методів проникнення до житла.',
      en: 'Complainant denied authorizing extrajudicial entry into private premises.',
    },
    exhibits: ['DEMO-P-01', 'DEMO-P-02', 'DEMO-P-03'],
    certified_timestamp: '1888-03-21T19:00:00Z',
    investigation_questions: {
      fr: [
        'À quel moment précis avez-vous suspecté la présence d\'un déguisement ?',
        'Le cliché a-t-il été retiré de son logement avant ou après le départ précipité ?',
      ],
      uk: [
        'В який саме момент ви запідозрили маскування?',
        'Чи було вилучено фото до чи після термінового від\'їзду?',
      ],
      en: [
        'At what exact moment was the disguise recognized?',
        'Was the photograph moved before or after the hasty departure?',
      ],
    },
    tactical_defense: {
      fr: 'Invoquer l\'absence de dommage matériel et la légitimité du droit de retrait sous Art. 141 CPP.',
      uk: 'Посилатися на відсутність матеріальної шкоди та законність володіння за ст. 141 КПК.',
      en: 'Argue absence of physical damage and legitimate custody under Art. 141 CPC.',
    },
  },
];

export const HOLMES_REQUISITIONS: LegalRequisition[] = [
  {
    id: 'REQ-DEMO-01',
    title: {
      uk: 'Клопотання про невідкладне опечатування та повернення фотокартки (ст. 263 КПК)',
      fr: 'Réquisition de séquestre conservatoire et restitution du négatif original (Art. 263 CPP)',
      en: 'Urgent seizure requisition and return of original negative (Art. 263 CPC)',
    },
    norme: 'Art. 263 al. 1 let. b CPP',
    autorite: 'Ministère public du Canton de Vaud',
    urgence: 'URGENT',
    category: 'penal',
    conclusions_formelles: {
      fr: [
        'ORDONNER le séquestre conservatoire du cliché original DEMO-P-01.',
        'INTERDIRE toute publication ou duplication sous peine de l\'Art. 292 CP.',
      ],
      uk: [
        'НАКЛАСТИ арешт на оригінал фотознімку DEMO-P-01.',
        'ЗАБОРОНИТИ оприлюднення або дублювання під загрозою ст. 292 CP.',
      ],
      en: [
        'ORDER the seizure of original photograph DEMO-P-01.',
        'FORBID any duplication under penal warning of Art. 292 SCC.',
      ],
    },
    corps_texte: {
      fr: 'Vu l\'urgence procédurale et le risque irréversible d\'atteinte à la réputation de la couronne de Bohême...',
      uk: 'Зважаючи на процесуальну невідкладність та незворотний ризик репутаційної шкоди...',
      en: 'In consideration of procedural urgency and irreversible risk to the Bohemian Crown...',
    },
  },
];
