import React, { useState } from 'react';
import {
  Scale,
  Shield,
  FileCheck2,
  Clock,
  Network,
  Radar,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Globe2,
  FileText,
  AlertCircle,
  Sparkles,
  Users,
  Briefcase,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Terminal,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { SupportedLanguage } from '../types/i18n';
import { getCurrentAuthSession } from '../lib/authManager';

// Supported landing languages
type LandingLang = 'uk' | 'en' | 'fr' | 'de';

// Content dictionary for Aequitas AI Landing Page
const I18N = {
  uk: {
    badge: 'Універсальна Платформа Правового ШІ',
    brand: 'Aequitas AI',
    slogan: 'Інтелектуальна ясність для права. Потужний асистент для адвоката, надійний навігатор для кожного.',
    subSlogan: 'Автоматизоване структурування фактів, криптографічна незмінність доказів, топологічний граф взаємозв’язків та оцінка судової перспективи без технічного жаргону.',
    nav: {
      pillars: 'Можливості',
      audiences: 'Для кого',
      simulator: 'Симулятор справи',
      evidence: 'Реєстр доказів',
      comparison: 'Порівняння',
      launchWorkspace: 'Увійти до Cockpit',
      requestDemo: 'Замовити демо',
    },
    hero: {
      ctaPrimary: 'Спробувати симулятор справи',
      ctaSecondary: 'Вхід до судового Cockpit',
      stats1: '100% захист від галюцинацій',
      stats1sub: 'Кожен висновок спирається на первинні докази',
      stats2: '0.04с перевірка цілісності',
      stats2sub: 'SHA-256 фіксація ланцюга збереження',
      stats3: '2-рівнева хронологія',
      stats3sub: 'Фіксація часу події окремо від часу запису',
    },
    audiences: {
      title: 'Створено для двох взаємодоповнюючих світів',
      desc: 'Єдина екосистема, яка говорить мовою строгих судових процесуальних норм для адвоката і забезпечує прозору, впевнену навігацію для клієнта.',
      tabLawyers: 'Для Адвокатів та Юрфірм',
      tabClients: 'Для Підприємств та Громадян',
      lawyers: {
        heading: 'Потужний аналітичний штаб для судового представництва',
        points: [
          {
            title: 'Блискавичне структурування багатотомних справ',
            desc: 'Синтез сотень сторінок матеріалів, виписок та протоколів у чітку, юридично бездоганну фабулу справи за лічені хвилини.',
          },
          {
            title: 'Абсолютний захист від процесуальних пасток',
            desc: 'ШІ автоматично перевіряє строки позовної давності, правила підсудності, преклюзивні терміни та допустимість кожного доказу.',
          },
          {
            title: 'Безперервний аудит тягаря доказування',
            desc: 'Аналіз того, які саме обставини підлягають доказуванню кожною стороною, з миттєвим виявленням прогалин у позиції опонента.',
          },
          {
            title: 'Сувора конфіденційність та адвокатська таємниця',
            desc: 'Повна локальна ізоляція чутливих матеріалів без передачі у публічні хмарні моделі чи навчання сторонніх систем.',
          },
        ],
      },
      clients: {
        heading: 'Ваш надійний навігатор у складних юридичних ситуаціях',
        points: [
          {
            title: 'Миттєва оцінка судових перспектив спору',
            desc: 'Зрозумілий та об’єктивний аналіз шансів у суді без складних професійних термінів до залучення дорогого консультанта.',
          },
          {
            title: 'Готовий, структурований пакет для вашого юриста',
            desc: 'Автоматичне формування хронології та реєстру первинних документів економить до 60% витрат на погодинну оплату адвоката.',
          },
          {
            title: 'Прозорість кожного кроку та контроль процесу',
            desc: 'Ви завжди розумієте, що відбувається у вашій справі, які вимоги висуваються і які докази захищають ваші інтереси.',
          },
          {
            title: 'Превентивний захист бізнесу та активів',
            desc: 'Виявлення прихованих ризиків у контрактах та захист прав добросовісного набувача до виникнення відкритого конфлікту.',
          },
        ],
      },
    },
    pillars: {
      title: 'Фундаментальні можливості Aequitas AI',
      subtitle: 'Шість взаємопов’язаних систем, що перетворюють правовий хаос на математично вивірену судову позицію.',
      items: [
        {
          index: '01',
          title: 'Незмінний реєстр доказів',
          desc: 'Криптографічний захист кожного документа, аудіозапису чи експертизи з обчисленням хешів за стандартом ISO/IEC 27037. Доказ неможливо підробити або підмінити.',
          badge: 'Цілісність',
        },
        {
          index: '02',
          title: 'Двовимірна хронологія фактів',
          desc: 'Строге розмежування часу реальної життєвої події від часу її фіксації в офіційних реєстрах. Унеможливлює маніпуляції з датами та строками.',
          badge: 'Хронологія',
        },
        {
          index: '03',
          title: 'Граф правових суб’єктів і зв’язків',
          desc: 'Інтерактивна топологія правовідносин: договори, взаємні зобов’язання, статуси сторін, конфлікти інтересів та ланцюги передачі прав.',
          badge: 'Топологія',
        },
        {
          index: '04',
          title: 'Аналізатор правової позиції',
          desc: 'Автоматичне співставлення фактичних обставин із диспозиціями правових норм. Калькулятор балансу доказів та тягаря доказування.',
          badge: 'Аналітика',
        },
        {
          index: '05',
          title: 'Генератор процесуальних документів',
          desc: 'Підготовка позовних заяв, заперечень, апеляційних скарг та адвокатських запитів із безпосереднім цитуванням перевірених джерел.',
          badge: 'Документи',
        },
        {
          index: '06',
          title: 'Аудит добросовісності та імунітетів',
          desc: 'Спеціалізований модуль перевірки добросовісного набуття майна, захисту прав третіх осіб та виявлення зловживання правами.',
          badge: 'Захист прав',
        },
      ],
    },
    simulator: {
      title: 'Інтерактивний симулятор правового аналізу',
      subtitle: 'Оберіть типову життєву ситуацію або введіть власну фабулу, щоб побачити, як Aequitas AI миттєво структурує позицію.',
      presets: [
        {
          id: 'commercial',
          name: 'Комерційний спір',
          scenario: 'Постачальник прострочив відвантаження технологічного обладнання на 45 днів через митну затримку. Покупець нарахував штраф 20% і погрожує розірванням.',
        },
        {
          id: 'property',
          name: 'Захист прав набувача',
          scenario: 'Покупець придбав автомобіль за ринковою ціною в офіційного автодилера. Через 6 місяців з’явився колишній власник із вимогою вилучення як викраденого.',
        },
        {
          id: 'procedural',
          name: 'Процесуальне порушення',
          scenario: 'Під час обшуку слідчий вилучив сервери компанії без ухвали слідчого судді та без залучення незалежного спеціаліста, порушивши таємницю листування.',
        },
      ],
      runButton: 'Здійснити правовий аналіз',
      analyzing: 'Аналіз правових зв’язків та фактів...',
      outputTitle: 'Результати правової структуризації',
      tabFacts: 'Встановлені факти',
      tabNorms: 'Застосовні норми',
      tabRisk: 'Ризик-радар',
      tabStrategy: 'Рекомендована стратегія',
    },
    evidence: {
      title: 'Демонстрація криптографічного реєстру доказів',
      subtitle: 'Кожен доказ отримує унікальний цифровий відбиток та нерозривно пов’язується з юридичним фактом.',
      searchPlaceholder: 'Пошук за назвою або криптографічним хешем...',
    },
    comparison: {
      title: 'Чому універсальні чат-боти непридатні для суду',
      subtitle: 'Порівняння підходів до юридичної роботи та управління доказами.',
      headers: ['Критерій', 'Звичайні ШІ чати', 'Aequitas AI'],
      rows: [
        {
          criterion: 'Гарантія достовірності (відсутність галюцинацій)',
          general: 'Вигадує цитати та неіснуючі статті законів',
          aequitas: '100% верифікована прив’язка до первинних джерел',
        },
        {
          criterion: 'Фіксація часу (Bitemporality)',
          general: 'Плутає хронологію та час складання документів',
          aequitas: 'Строге розділення моменту події та моменту фіксації',
        },
        {
          criterion: 'Юридичний ланцюг доказів (Chain of Custody)',
          general: 'Відсутній, текст ніяк не захищений',
          aequitas: 'SHA-256 хешування кожного долученого артефакту',
        },
        {
          criterion: 'Конфіденційність та адвокатська таємниця',
          general: 'Дані можуть використовуватись для навчання моделей',
          aequitas: 'Ізольований контур, нульовий витік, суворий захист доступу',
        },
        {
          criterion: 'Розрахунок тягаря доказування',
          general: 'Загальні роздуми без нормативної структури',
          aequitas: 'Чіткий матричний розподіл обов’язків доказування',
        },
      ],
    },
    ctaFooter: {
      title: 'Готові побачити правову аналітику нового покоління?',
      subtitle: 'Отримайте доступ до закритого суверенного Cockpit або зв’яжіться з нашою інженерно-правовою командою.',
      buttonCockpit: 'Увійти до Cockpit',
      buttonDocs: 'Переглянути документацію',
    },
  },
  en: {
    badge: 'Universal Legal AI Platform',
    brand: 'Aequitas AI',
    slogan: 'Intelligent Clarity for the Law. Advanced Co-Pilot for Lawyers, Trusted Navigator for Everyone.',
    subSlogan: 'Automated fact structuring, cryptographic evidence integrity, topological relationship graph, and procedural strength assessment without engineering jargon.',
    nav: {
      pillars: 'Capabilities',
      audiences: 'Who it is for',
      simulator: 'Case Simulator',
      evidence: 'Evidence Ledger',
      comparison: 'Comparison',
      launchWorkspace: 'Launch Cockpit',
      requestDemo: 'Request Demo',
    },
    hero: {
      ctaPrimary: 'Try Interactive Simulator',
      ctaSecondary: 'Enter Sovereign Cockpit',
      stats1: '100% Anti-Hallucination',
      stats1sub: 'Every statement grounded in original evidence',
      stats2: '0.04s Integrity Check',
      stats2sub: 'SHA-256 chain of custody verification',
      stats3: 'Bitemporal Timeline',
      stats3sub: 'Separating occurrence time from filing time',
    },
    audiences: {
      title: 'Architected for Two Complementary Worlds',
      desc: 'A unified ecosystem speaking the language of strict procedural rigor for legal counsel while providing clear, reassuring navigation for clients.',
      tabLawyers: 'For Legal Counsel & Law Firms',
      tabClients: 'For Enterprises & Individuals',
      lawyers: {
        heading: 'Strategic Intelligence Command for Litigation',
        points: [
          {
            title: 'Instant Structuring of Multi-Volume Dockets',
            desc: 'Synthesize hundreds of pages of evidence, records, and hearings into clean, admissible statements of facts within minutes.',
          },
          {
            title: 'Protection Against Procedural Traps',
            desc: 'AI continuously audits limitation periods, venue jurisdictions, preclusion windows, and admissibility criteria.',
          },
          {
            title: 'Rigorous Burden of Proof Auditing',
            desc: 'Clear statutory distribution of proof burdens with immediate identification of gaps in opposing counsel arguments.',
          },
          {
            title: 'Absolute Professional Secrecy & Privacy',
            desc: 'Strictly isolated cryptographic environment with zero external telemetry and zero data leakage to public models.',
          },
        ],
      },
      clients: {
        heading: 'Your Trusted Navigator in Complex Disputes',
        points: [
          {
            title: 'Objective Assessment of Litigation Odds',
            desc: 'Clear breakdown of case strength without dense legalese before committing to substantial legal fees.',
          },
          {
            title: 'Lawyer-Ready Structured Briefing',
            desc: 'Automatic collation of evidence and chronologies saving up to 60% of hourly attorney onboarding costs.',
          },
          {
            title: 'Transparency and Continuous Control',
            desc: 'Full visibility into every legal action, pleading, and evidence item safeguarding your interests.',
          },
          {
            title: 'Preemptive Asset and Contract Protection',
            desc: 'Detect latent contractual vulnerabilities and establish bona fide third-party protection before litigation starts.',
          },
        ],
      },
    },
    pillars: {
      title: 'Core Capabilities of Aequitas AI',
      subtitle: 'Six integrated pillars turning complex factual chaos into mathematically structured legal clarity.',
      items: [
        {
          index: '01',
          title: 'Immutable Evidence Ledger',
          desc: 'Cryptographic hashing (ISO/IEC 27037) for documents, audio transcripts, and forensic records. Evidence cannot be tampered with or retroactively altered.',
          badge: 'Integrity',
        },
        {
          index: '02',
          title: 'Bitemporal Fact Chronology',
          desc: 'Separating the valid event time from system recording time. Eradicates timestamp manipulation and validates limitation windows.',
          badge: 'Chronology',
        },
        {
          index: '03',
          title: 'Legal Knowledge Graph',
          desc: 'Interactive topology of legal subjects, contractual obligations, cross-guarantees, and statutory causes of action.',
          badge: 'Topology',
        },
        {
          index: '04',
          title: 'Claim & Risk Radar',
          desc: 'Automatic correlation of empirical facts with statutory claim charts. Dynamic burden of proof balance calculation.',
          badge: 'Analytics',
        },
        {
          index: '05',
          title: 'Procedural Pleadings Engine',
          desc: 'Drafting petitions, motions, appeals, and formal objections with precise citations directly tied to verified sources.',
          badge: 'Pleadings',
        },
        {
          index: '06',
          title: 'Bona Fide & Immunity Audit',
          desc: 'Specialized analysis for bona fide purchasers, third-party standing, procedural immunities, and abuse of process detection.',
          badge: 'Protections',
        },
      ],
    },
    simulator: {
      title: 'Interactive Legal Case Simulator',
      subtitle: 'Select a benchmark scenario or type your own case description to see how Aequitas AI instantly structures your position.',
      presets: [
        {
          id: 'commercial',
          name: 'Commercial Supply Breach',
          scenario: 'Supplier delayed custom machinery delivery by 45 days citing international transit customs hold. Buyer imposed a 20% penalty and threatened contract termination.',
        },
        {
          id: 'property',
          name: 'Bona Fide Property Shield',
          scenario: 'Buyer acquired a vehicle at fair market value from a certified dealer. 6 months later, an original owner filed a replevin suit claiming the vehicle was stolen.',
        },
        {
          id: 'procedural',
          name: 'Procedural Evidence Defect',
          scenario: 'During an executive search, investigators seized company database backups without a judicial warrant and without an independent IT expert present.',
        },
      ],
      runButton: 'Run Structural Legal Analysis',
      analyzing: 'Synthesizing evidence and statutory norms...',
      outputTitle: 'Structured Legal Analysis Output',
      tabFacts: 'Established Facts',
      tabNorms: 'Applicable Norms',
      tabRisk: 'Risk Radar',
      tabStrategy: 'Strategic Roadmap',
    },
    evidence: {
      title: 'Cryptographic Evidence Ledger Demo',
      subtitle: 'Every evidentiary piece is stamped with SHA-256 verification and immutable chain of custody.',
      searchPlaceholder: 'Search by file name or cryptographic hash...',
    },
    comparison: {
      title: 'Why Generic LLMs Fail in Legal Proceedings',
      subtitle: 'Comparison between consumer chatbots and Aequitas AI purpose-built architecture.',
      headers: ['Criteria', 'Generic AI Chatbots', 'Aequitas AI'],
      rows: [
        {
          criterion: 'Veracity & Hallucination Resistance',
          general: 'Fabricates case citations and non-existent statutory articles',
          aequitas: '100% grounded in primary source documents and verified citations',
        },
        {
          criterion: 'Time & Chronology Validation',
          general: 'Conflates narrative time with procedural receipt time',
          aequitas: 'Strict bitemporal separation of occurrence vs recording times',
        },
        {
          criterion: 'Evidence Chain of Custody',
          general: 'None; prompts and outputs are unverified plain text',
          aequitas: 'Cryptographic SHA-256 hashing conforming to ISO/IEC 27037',
        },
        {
          criterion: 'Professional Secrecy & Data Privacy',
          general: 'Data may leak into public training corpora',
          aequitas: 'Isolated sovereign enclave; zero-trust whitelist access',
        },
        {
          criterion: 'Statutory Burden of Proof Modeling',
          general: 'Superficial conversational advice without legal weight',
          aequitas: 'Rigorous matrix of evidentiary requirements and counterclaims',
        },
      ],
    },
    ctaFooter: {
      title: 'Ready to Experience Precision Legal Intelligence?',
      subtitle: 'Access the sovereign advocate cockpit or schedule a specialized briefing with our engineering and legal team.',
      buttonCockpit: 'Launch Advocate Cockpit',
      buttonDocs: 'View Technical Documentation',
    },
  },
  fr: {
    badge: 'Plateforme Universelle d’IA Juridique',
    brand: 'Aequitas AI',
    slogan: 'Clarté Intelligente pour le Droit. Co-pilote d’élite pour avocats, navigateur de confiance pour tous.',
    subSlogan: 'Structuration automatisée des faits, intégrité cryptographique des preuves, graphe relationnel et évaluation de la force procédurale sans jargon technique.',
    nav: {
      pillars: 'Capacités',
      audiences: 'Publics',
      simulator: 'Simulateur',
      evidence: 'Registre de Preuves',
      comparison: 'Comparaison',
      launchWorkspace: 'Ouvrir Cockpit',
      requestDemo: 'Demander Démo',
    },
    hero: {
      ctaPrimary: 'Essayer le Simulateur',
      ctaSecondary: 'Accéder au Cockpit',
      stats1: '100% Anti-Hallucination',
      stats1sub: 'Chaque conclusion ancrée dans les pièces probatoires',
      stats2: '0.04s Vérification d’Intégrité',
      stats2sub: 'Hachage SHA-256 conforme ISO/IEC 27037',
      stats3: 'Chronologie Bitemporelle',
      stats3sub: 'Dissociation du temps réel et de l’enregistrement',
    },
    audiences: {
      title: 'Conçu pour Deux Mondes Complémentaires',
      desc: 'Un écosystème unifié appliquant la rigueur procédurale pour le conseil juridique tout en offrant une clarté sereine pour le justiciable.',
      tabLawyers: 'Avocats & Cabinets',
      tabClients: 'Entreprises & Justiciables',
      lawyers: {
        heading: 'Poste de Commandement Stratégique pour Avocats',
        points: [
          {
            title: 'Structuration Immédiate des Dossiers Volumineux',
            desc: 'Synthèse de centaines de pièces en un exposé des faits clair, étayé et immédiatement recevable.',
          },
          {
            title: 'Immunisation Contre les Pièges Procéduraux',
            desc: 'Contrôle continu des délais de forclusion, de prescription et de la recevabilité de chaque pièce.',
          },
          {
            title: 'Évaluation Rigoureuse du Fardeau de la Preuve',
            desc: 'Cartographie des obligations probatoires et détection instantanée des failles adverses.',
          },
          {
            title: 'Secret Professionnel & Confidentialité Absolue',
            desc: 'Isolation complète, aucun transfert de données vers des modèles publics.',
          },
        ],
      },
      clients: {
        heading: 'Votre Navigateur de Confiance Face au Droit',
        points: [
          {
            title: 'Évaluation Objective des Chances de Succès',
            desc: 'Compréhension limpide des perspectives du litige avant d’engager des frais conséquents.',
          },
          {
            title: 'Dossier Structuré Prêt pour Votre Avocat',
            desc: 'Jusqu’à 60% d’économies sur les honoraires initiaux grâce à un dossier chronologiquement ordonné.',
          },
          {
            title: 'Visibilité et Contrôle Procédural',
            desc: 'Suivez chaque étape et comprenez exactement les fondements de votre défense.',
          },
          {
            title: 'Protection Préventive de Bonne Foi',
            desc: 'Sécurisation des transactions et immunisation du tiers de bonne foi dès l’acquisition.',
          },
        ],
      },
    },
    pillars: {
      title: 'Capacités Fondamentales d’Aequitas AI',
      subtitle: 'Six systèmes coordonnés transformant la dispersion probatoire en rigueur judiciaire inébranlable.',
      items: [
        {
          index: '01',
          title: 'Registre Cryptographique des Preuves',
          desc: 'Protection inviolable de chaque document, enregistrement et expertise avec hachage SHA-256 (ISO/IEC 27037).',
          badge: 'Intégrité',
        },
        {
          index: '02',
          title: 'Chronologie Bitemporelle',
          desc: 'Dissociation nette entre la survenance réelle de l’événement et sa consignation formelle.',
          badge: 'Chronologie',
        },
        {
          index: '03',
          title: 'Graphe des Sujets et Relations',
          desc: 'Topologie interactive des parties, contrats, devoirs réciproques et chaînes de droits.',
          badge: 'Topologie',
        },
        {
          index: '04',
          title: 'Radar de Position & Risque',
          desc: 'Confrontation des faits aux bases légales et calcul dynamique de l’équilibre probatoire.',
          badge: 'Analyse',
        },
        {
          index: '05',
          title: 'Moteur d’Écritures Judiciaires',
          desc: 'Rédaction d’actes, requêtes et mémoires avec liens hyper-vérifiés aux pièces probantes.',
          badge: 'Actes',
        },
        {
          index: '06',
          title: 'Audit de Bonne Foi & Immunités',
          desc: 'Vérification de la protection de l’acquéreur de bonne foi et prévention des abus de droit.',
          badge: 'Protection',
        },
      ],
    },
    simulator: {
      title: 'Simulateur d’Analyse Juridique',
      subtitle: 'Choisissez une situation type ou renseignez votre litige pour visualiser l’analyse structurée instantanée.',
      presets: [
        {
          id: 'commercial',
          name: 'Rupture Commerciale',
          scenario: 'Un fournisseur retarde la livraison de machines de 45 jours suite à un blocage douanier. L’acheteur applique 20% de pénalité et menace de résiliation unilatérale.',
        },
        {
          id: 'property',
          name: 'Bouclier de Bonne Foi',
          scenario: 'Un acquéreur achète un véhicule au prix du marché chez un concessionnaire agréé. 6 mois plus tard, le propriétaire initial revendique le bien comme volé.',
        },
        {
          id: 'procedural',
          name: 'Vice de Procédure',
          scenario: 'Lors d’une perquisition, les enquêteurs ont saisi les serveurs d’une société sans mandat judiciaire valide et sans expert informatique indépendant.',
        },
      ],
      runButton: 'Lancer l’Analyse Structurée',
      analyzing: 'Analyse des faits et des bases légales en cours...',
      outputTitle: 'Restitution de l’Analyse Structurée',
      tabFacts: 'Faits Établis',
      tabNorms: 'Bases Légales',
      tabRisk: 'Radar de Risque',
      tabStrategy: 'Feuille de Route',
    },
    evidence: {
      title: 'Démonstrateur du Registre des Preuves',
      subtitle: 'Chaque élément probatoire est scellé cryptographiquement et relié aux faits juridiques.',
      searchPlaceholder: 'Rechercher par nom ou empreinte SHA-256...',
    },
    comparison: {
      title: 'Pourquoi les IA Généralistes Échouent au Tribunal',
      subtitle: 'Comparaison entre les modèles conversationnels standards et la rigueur d’Aequitas AI.',
      headers: ['Critère', 'IA Conversationnelle Standard', 'Aequitas AI'],
      rows: [
        {
          criterion: 'Fiabilité & Absence d’Hallucination',
          general: 'Invente des jurisprudences et des articles fictifs',
          aequitas: '100% ancré dans les textes et les pièces vérifiées',
        },
        {
          criterion: 'Gestion de la Bitemporalité',
          general: 'Mélange l’ordre des événements et leur enregistrement',
          aequitas: 'Séparation mathématique temps de l’acte / temps de saisie',
        },
        {
          criterion: 'Chaîne de Conservation (ISO 27037)',
          general: 'Inexistante, simple texte non certifiable',
          aequitas: 'Empreinte SHA-256 inviolable pour chaque artefact',
        },
        {
          criterion: 'Secret Professionnel',
          general: 'Risque de recyclage des données dans les modèles',
          aequitas: 'Enclave fermée, zéro fuite, liste blanche stricte',
        },
        {
          criterion: 'Fardeau de la Preuve',
          general: 'Conseils vagues sans articulation procédurale',
          aequitas: 'Distribution matricielle stricte des charges probatoires',
        },
      ],
    },
    ctaFooter: {
      title: 'Prêt à Découvrir la Clarté Juridique Augmentée ?',
      subtitle: 'Accédez au cockpit souverain d’avocat ou sollicitez une présentation dédiée avec nos experts.',
      buttonCockpit: 'Ouvrir le Cockpit Avocat',
      buttonDocs: 'Consulter la Documentation',
    },
  },
  de: {
    badge: 'Universelle Rechts-KI-Plattform',
    brand: 'Aequitas AI',
    slogan: 'Intelligente Rechtsklarheit. Leistungsstarker Assistent für Anwälte, verlässlicher Navigator für alle.',
    subSlogan: 'Automatisierte Sachverhaltsstrukturierung, kryptografische Beweisintegrität, Beziehungsgraphen und prozessuale Risikoevaluation ohne technischen Jargon.',
    nav: {
      pillars: 'Funktionen',
      audiences: 'Zielgruppen',
      simulator: 'Fall-Simulator',
      evidence: 'Beweisregister',
      comparison: 'Vergleich',
      launchWorkspace: 'Cockpit Starten',
      requestDemo: 'Demo Anfragen',
    },
    hero: {
      ctaPrimary: 'Simulator Ausprobieren',
      ctaSecondary: 'Souveränes Cockpit Öffnen',
      stats1: '100% Halluzinationssicher',
      stats1sub: 'Jede Schlussfolgerung stützt sich auf Primärbeweise',
      stats2: '0.04s Integritätsprüfung',
      stats2sub: 'SHA-256 Hashing nach ISO/IEC 27037',
      stats3: 'Bitemporale Chronologie',
      stats3sub: 'Trennung von Ereigniszeit und Registrierungszeit',
    },
    audiences: {
      title: 'Für Zwei Sich Ergänzende Welten Entwickelt',
      desc: 'Einheitliches System, das für Rechtsanwälte prozessuale Präzision liefert und Mandanten klare, verständliche Orientierung schenkt.',
      tabLawyers: 'Für Anwälte & Kanzleien',
      tabClients: 'Für Unternehmen & Bürger',
      lawyers: {
        heading: 'Analytischer Führungsstab für die Prozessführung',
        points: [
          {
            title: 'Sekundenschnelle Strukturierung von Großakten',
            desc: 'Synthese hunderter Seiten von Akten und Protokollen in einen schlüssigen, gerichtsverwertbaren Sachverhalt.',
          },
          {
            title: 'Schutz vor Verfahrensfallen',
            desc: 'Automatische Überwachung von Verjährungsfristen, Zuständigkeiten und Beweisverwertungsverboten.',
          },
          {
            title: 'Exakte Beweislastverteilung',
            desc: 'Matrix der materiellen und prozessualen Beweislast mit sofortiger Erkennung gegnerischer Beweisnot.',
          },
          {
            title: 'Anwaltliches Berufsgeheimnis & Datenschutz',
            desc: 'Komplett isolierte Umgebung ohne Datenübertragung an öffentliche Modelle.',
          },
        ],
      },
      clients: {
        heading: 'Ihr Zuverlässiger Kompass im Rechtsstreit',
        points: [
          {
            title: 'Objektive Einschätzung der Prozesschancen',
            desc: 'Verständliche Analyse Ihrer Rechtslage vor dem Entstehen hoher Honorarkosten.',
          },
          {
            title: 'Perfekt vorbereitete Akte für Ihren Anwalt',
            desc: 'Bis zu 60% Ersparnis bei den Vorbereitungskosten durch strukturierte Faktenaufbereitung.',
          },
          {
            title: 'Transparenz in jedem Verfahrensschritt',
            desc: 'Voller Überblick über Schriftsätze, Beweismittel und Strategien.',
          },
          {
            title: 'Gutglaubensschutz und Rechtssicherheit',
            desc: 'Schutz als gutgläubiger Erwerber und Abwehr unberechtigter Herausgabeansprüche.',
          },
        ],
      },
    },
    pillars: {
      title: 'Kernkompetenzen von Aequitas AI',
      subtitle: 'Sechs koordinierte Systeme verwandeln unübersichtliche Fakten in ein unanfechtbares Gerichtsfundament.',
      items: [
        {
          index: '01',
          title: 'Unveränderliches Beweisregister',
          desc: 'Kryptografische Absicherung aller Urkunden, Audios und Gutachten mit SHA-256 nach ISO/IEC 27037.',
          badge: 'Integrität',
        },
        {
          index: '02',
          title: 'Bitemporale Sachverhaltschronologie',
          desc: 'Strikte Trennung von tatsächlicher Tatzeit und Registrierungszeit verhindert nachträgliche Manipulationen.',
          badge: 'Chronologie',
        },
        {
          index: '03',
          title: 'Rechtlicher Beziehungsgraph',
          desc: 'Interaktive Topologie von Parteien, Verträgen, Pflichten, Anspruchsgrundlagen und Vollmachten.',
          badge: 'Topologie',
        },
        {
          index: '04',
          title: 'Anspruchs- & Risikoradar',
          desc: 'Abgleich von Sachverhaltselementen mit Tatbestandsmerkmalen und Berechnung der Beweiswahrscheinlichkeit.',
          badge: 'Analyse',
        },
        {
          index: '05',
          title: 'Schriftsatzgenerator',
          desc: 'Erstellung von Klageschriften, Erwiderungen und Rechtsmitteln mit direkter Verlinkung zu Primärbeweisen.',
          badge: 'Schriftsätze',
        },
        {
          index: '06',
          title: 'Gutglaubens- & Immunitätsprüfung',
          desc: 'Spezifische Module zur Absicherung gutgläubiger Dritter und Schutz vor rechtsmissbräuchlicher Verfolgung.',
          badge: 'Rechtsschutz',
        },
      ],
    },
    simulator: {
      title: 'Interaktiver Fall-Simulator',
      subtitle: 'Wählen Sie einen Beispielfall oder geben Sie Ihren eigenen Sachverhalt ein, um die Analyse live zu erleben.',
      presets: [
        {
          id: 'commercial',
          name: 'Lieferverzug & Vertragsstrafe',
          scenario: 'Lieferant verzögert Lieferung um 45 Tage wegen Zollprüfung. Käufer fordert 20% Konventionalstrafe und droht mit Kündigung.',
        },
        {
          id: 'property',
          name: 'Gutgläubiger Erwerb',
          scenario: 'Käufer erwirbt Fahrzeug zum Marktpreis bei Fachhändler. 6 Monate später fordert Vorbesitzer Herausgabe als vermeintlich gestohlen.',
        },
        {
          id: 'procedural',
          name: 'Beweisverwertungsverbot',
          scenario: 'Ermittler beschlagnahmen Firmen-Backups ohne richterlichen Durchsuchungsbeschluss und ohne IT-Sachverständigen.',
        },
      ],
      runButton: 'Strukturierte Rechtsanalyse Starten',
      analyzing: 'Prüfung von Tatbestand und Beweiskette läuft...',
      outputTitle: 'Ergebnis der Strukturanalyse',
      tabFacts: 'Festgestellte Fakten',
      tabNorms: 'Rechtsgrundlagen',
      tabRisk: 'Risiko-Radar',
      tabStrategy: 'Handlungsempfehlung',
    },
    evidence: {
      title: 'Kryptografisches Beweisregister',
      subtitle: 'Jedes Beweismittel wird unveränderlich mit SHA-256 gesichert und mit Tatbeständen verknüpft.',
      searchPlaceholder: 'Nach Dateiname oder SHA-256 Hash suchen...',
    },
    comparison: {
      title: 'Warum Standard-Chatbots vor Gericht Versagen',
      subtitle: 'Vergleich zwischen herkömmlicher generativer KI und der Architektur von Aequitas AI.',
      headers: ['Kriterium', 'Generische KI-Modelle', 'Aequitas AI'],
      rows: [
        {
          criterion: 'Verlässlichkeit & Halluzinationsfreiheit',
          general: 'Erfindet Gerichtsurteile und Paragrafen',
          aequitas: '100% belegt durch Primärquellen und nachweisbare Dokumente',
        },
        {
          criterion: 'Bitemporale Zeitrechnung',
          general: 'Verwechselt Tatzeitpunkt mit Einreichungszeitpunkt',
          aequitas: 'Präzise getrennte Valid Time und Transaction Time',
        },
        {
          criterion: 'Beweisketten-Integrität (ISO 27037)',
          general: 'Keine; reiner ungeschützter Rohtext',
          aequitas: 'Kryptografischer SHA-256 Fingerabdruck für jede Akte',
        },
        {
          criterion: 'Berufsgeheimnis & Datenschutz',
          general: 'Gefahr des Einfließens in öffentliche Trainingsdaten',
          aequitas: 'Abgeschotteter Sovereign-Bereich, Zero-Leakage-Architektur',
        },
        {
          criterion: 'Subsumtion & Beweislastverteilung',
          general: 'Oberflächlicher Text ohne juristische Dogmatik',
          aequitas: 'Strikte logische Verknüpfung von Beweis und Tatbestandsmerkmal',
        },
      ],
    },
    ctaFooter: {
      title: 'Bereit für Präzise Rechtsintelligenz?',
      subtitle: 'Starten Sie das geschützte Anwalts-Cockpit oder vereinbaren Sie einen persönlichen Termin.',
      buttonCockpit: 'Anwalts-Cockpit Starten',
      buttonDocs: 'Dokumentation Lesen',
    },
  },
};

// Verified sample evidence items for the demo registry
const SAMPLE_EVIDENCE = [
  {
    id: 'EVD-01',
    name: 'Contrat_Vente_Machines_Signe.pdf',
    type: 'Договір купівлі-продажу',
    timestamp: '2024-03-12 14:32:00',
    hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    relevance: '98%',
    custody: 'Верифіковано нотаріальним депозитарієм',
    status: 'Validé',
  },
  {
    id: 'EVD-02',
    name: 'Avis_Dedouanement_Officiel_Transit.pdf',
    type: 'Митна декларація & Акт затримки',
    timestamp: '2024-04-05 09:15:22',
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    relevance: '94%',
    custody: 'Офіційний сертифікат митного органу',
    status: 'Validé',
  },
  {
    id: 'EVD-03',
    name: 'Rapport_Expertise_Technique_Conformite.pdf',
    type: 'Висновок судового експерта',
    timestamp: '2024-05-18 16:45:10',
    hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    relevance: '99%',
    custody: 'Внесено до судового реєстру експертиз',
    status: 'Validé',
  },
  {
    id: 'EVD-04',
    name: 'Preuve_Paiement_Bancaire_SWIFT.pdf',
    type: 'Банківське підтвердження розрахунку',
    timestamp: '2024-03-14 11:20:00',
    hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    relevance: '95%',
    custody: 'Виписка з електронним підписом банку',
    status: 'Validé',
  },
];

export const AequitasLandingPage: React.FC = () => {
  const [lang, setLang] = useState<LandingLang>('uk');
  const [activeAudience, setActiveAudience] = useState<'lawyers' | 'clients'>('lawyers');
  const [selectedPreset, setSelectedPreset] = useState<string>('commercial');
  const [customScenario, setCustomScenario] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [hasSimulated, setHasSimulated] = useState<boolean>(false);
  const [activeSimTab, setActiveSimTab] = useState<'facts' | 'norms' | 'risk' | 'strategy'>('facts');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('');
  const [graphActiveNode, setGraphActiveNode] = useState<string>('buyer');

  const t = I18N[lang] || I18N.uk;

  // Check if user is already authenticated in session
  const activeSession = getCurrentAuthSession();

  // Handle preset selection
  const handleSelectPreset = (id: string) => {
    setSelectedPreset(id);
    const preset = t.simulator.presets.find((p) => p.id === id);
    if (preset) {
      setCustomScenario(preset.scenario);
      setHasSimulated(true);
    }
  };

  // Run simulation handler
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
    }, 600);
  };

  // Filtered evidence items
  const filteredEvidence = SAMPLE_EVIDENCE.filter(
    (item) =>
      item.name.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
      item.type.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
      item.hash.toLowerCase().includes(evidenceFilter.toLowerCase())
  );

  return (
    <div className="h-screen w-screen overflow-y-auto overflow-x-hidden bg-[#0A0F1D] text-[#F8FAFC] font-sans selection:bg-[#38BDF8]/30 selection:text-white">
      {/* 1. TOP GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#0A0F1D]/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Brand Logo: Balance Scales & Synapse Monoline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#141E33] to-[#0A0F1D] border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)] group transition-all">
            <svg
              className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Balance pillar & beam */}
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="5" y1="7" x2="19" y2="7" />
              {/* Neural Synapse nodes */}
              <circle cx="5" cy="7" r="1.5" className="text-[#38BDF8] fill-[#38BDF8]" />
              <circle cx="19" cy="7" r="1.5" className="text-[#38BDF8] fill-[#38BDF8]" />
              <circle cx="12" cy="3" r="1.75" className="text-[#D4AF37] fill-[#D4AF37]" />
              {/* Scales */}
              <path d="M2.5 12l2.5-5 2.5 5a2.5 2.5 0 0 1-5 0z" />
              <path d="M16.5 12l2.5-5 2.5 5a2.5 2.5 0 0 1-5 0z" />
              {/* Base */}
              <path d="M8 21h8" />
            </svg>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Aequitas <span className="text-[#38BDF8] font-mono text-sm font-semibold">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              Universal Legal Intelligence
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium text-slate-300">
          <a href="#capabilities" className="hover:text-white transition-colors">
            {t.nav.pillars}
          </a>
          <a href="#audiences" className="hover:text-white transition-colors">
            {t.nav.audiences}
          </a>
          <a href="#simulator" className="hover:text-white transition-colors">
            {t.nav.simulator}
          </a>
          <a href="#evidence" className="hover:text-white transition-colors">
            {t.nav.evidence}
          </a>
          <a href="#comparison" className="hover:text-white transition-colors">
            {t.nav.comparison}
          </a>
        </nav>

        {/* Right Action: Language Selector & Workspace Switcher */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#141E33] border border-slate-700/60 rounded-lg p-0.5 text-[11px] font-mono">
            {(['uk', 'en', 'fr', 'de'] as LandingLang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  lang === l
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Launch Cockpit Button */}
          <a
            href="/cockpit"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37]/90 to-[#E5C05B]/90 hover:from-[#D4AF37] hover:to-[#E5C05B] text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer group"
          >
            <Scale className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>{activeSession ? 'Робочий Cockpit' : t.nav.launchWorkspace}</span>
            <ArrowRight className="w-3 h-3 text-slate-950/80 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-[#38BDF8]/10 via-[#D4AF37]/8 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Clean Unboxed Kicker */}
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#38BDF8] tracking-wider uppercase mb-5">
          <span>{t.badge}</span>
          <span aria-hidden="true">·</span>
          <span>Zero-Hallucination Legal Tech</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] text-balance">
          {t.slogan}
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance">
          {t.subSlogan}
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <a
            href="#simulator"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#38BDF8] hover:bg-[#38BDF8]/90 active:scale-[0.98] text-[#0A0F1D] font-bold text-sm transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#0A0F1D]" />
            <span>{t.hero.ctaPrimary}</span>
          </a>

          <a
            href="/cockpit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#141E33] hover:bg-[#1C2B49] active:scale-[0.98] border border-slate-700/80 text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 group"
          >
            <Lock className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
            <span>{t.hero.ctaSecondary}</span>
          </a>
        </div>

        {/* Metrics & Guarantees without decorative pills */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-800/80 text-left">
          <div className="p-4 rounded-xl bg-[#141E33]/40 border border-slate-800/60">
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{t.hero.stats1}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-normal">{t.hero.stats1sub}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141E33]/40 border border-slate-800/60">
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
              <span>{t.hero.stats2}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-normal">{t.hero.stats2sub}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141E33]/40 border border-slate-800/60">
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <span>{t.hero.stats3}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400 leading-normal">{t.hero.stats3sub}</p>
          </div>
        </div>
      </section>

      {/* 3. DUAL AUDIENCE VALUE PROPOSITION */}
      <section id="audiences" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-2">
            Dual-Perspective Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.audiences.title}</h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">{t.audiences.desc}</p>

          {/* Interactive Audience Switcher Tabs */}
          <div className="mt-6 inline-flex p-1 bg-[#141E33] border border-slate-700/80 rounded-xl">
            <button
              onClick={() => setActiveAudience('lawyers')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeAudience === 'lawyers'
                  ? 'bg-[#38BDF8] text-[#0A0F1D] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t.audiences.tabLawyers}</span>
            </button>
            <button
              onClick={() => setActiveAudience('clients')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeAudience === 'clients'
                  ? 'bg-[#38BDF8] text-[#0A0F1D] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.audiences.tabClients}</span>
            </button>
          </div>
        </div>

        {/* Audience Content Display */}
        <div className="bg-[#141E33]/70 border border-slate-700/70 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-700/60">
            <h3 className="text-lg font-bold text-white">
              {activeAudience === 'lawyers' ? t.audiences.lawyers.heading : t.audiences.clients.heading}
            </h3>
            <span className="text-xs font-mono text-[#D4AF37]">
              {activeAudience === 'lawyers' ? 'Court & Litigation Rigor' : 'Client Navigation & Clarity'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(activeAudience === 'lawyers' ? t.audiences.lawyers.points : t.audiences.clients.points).map(
              (point, idx) => (
                <div key={idx} className="flex items-start space-x-3.5">
                  <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#38BDF8] font-mono text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{point.title}</h4>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">{point.desc}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 4. CORE CAPABILITIES (NO JARGON PILLARS) */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider mb-2">
            Systemic Integrity
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.pillars.title}</h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">{t.pillars.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.pillars.items.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#141E33]/60 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-0.5 shadow-sm group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-[#D4AF37]">{item.index}</span>
                <span className="text-[11px] font-mono text-slate-400">{item.badge}</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE LEGAL CASE SIMULATOR */}
      <section id="simulator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-2">
            Live Interactive Workbench
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.simulator.title}</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{t.simulator.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Preset selection & scenario input */}
          <div className="lg:col-span-5 bg-[#141E33]/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              01. Оберіть типову ситуацію:
            </span>

            <div className="space-y-2">
              {t.simulator.presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all border cursor-pointer ${
                    selectedPreset === preset.id
                      ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-white shadow-sm'
                      : 'bg-[#0A0F1D]/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{preset.name}</span>
                    {selectedPreset === preset.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.scenario}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                02. Фабула справи для аналізу:
              </span>
              <textarea
                value={
                  customScenario ||
                  t.simulator.presets.find((p) => p.id === selectedPreset)?.scenario ||
                  ''
                }
                onChange={(e) => setCustomScenario(e.target.value)}
                rows={4}
                className="w-full bg-[#0A0F1D] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#38BDF8] font-sans resize-none leading-relaxed"
                placeholder="Опишіть ситуацію, дати, дії сторін та спірні обставини..."
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-blue-600 hover:from-[#38BDF8]/90 hover:to-blue-500 active:scale-[0.98] text-[#0A0F1D] font-bold text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 text-[#0A0F1D]" />
              <span>{isSimulating ? t.simulator.analyzing : t.simulator.runButton}</span>
            </button>
          </div>

          {/* Right Column: Structured AI Output */}
          <div className="lg:col-span-7 bg-[#0A0F1D] border border-slate-800 rounded-2xl p-5 shadow-xl relative min-h-[420px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Radar className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-bold text-white">{t.simulator.outputTitle}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified Model</span>
              </span>
            </div>

            {/* Output Sub-Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-[#141E33] rounded-lg mb-4 text-xs font-medium">
              <button
                onClick={() => setActiveSimTab('facts')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeSimTab === 'facts' ? 'bg-[#38BDF8] text-[#0A0F1D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.simulator.tabFacts}
              </button>
              <button
                onClick={() => setActiveSimTab('norms')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeSimTab === 'norms' ? 'bg-[#38BDF8] text-[#0A0F1D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.simulator.tabNorms}
              </button>
              <button
                onClick={() => setActiveSimTab('risk')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeSimTab === 'risk' ? 'bg-[#38BDF8] text-[#0A0F1D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.simulator.tabRisk}
              </button>
              <button
                onClick={() => setActiveSimTab('strategy')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeSimTab === 'strategy' ? 'bg-[#38BDF8] text-[#0A0F1D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.simulator.tabStrategy}
              </button>
            </div>

            {/* Sub-tab Content Area */}
            <div className="flex-1 text-xs text-slate-300 leading-relaxed overflow-y-auto space-y-3">
              {activeSimTab === 'facts' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#141E33]/40 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Факт №1 · Первинне виникнення зобов'язання</span>
                      <span className="text-[#38BDF8]">Tv: 2024-03-12</span>
                    </div>
                    <p className="text-white font-medium">Укладення та повна оплата контракту стороною замовника.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Доказ: SWIFT платіжне доручення №4810 (SHA-256 scellé).</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141E33]/40 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Факт №2 · Порушення строку або конфліктний інцидент</span>
                      <span className="text-amber-400">Tv: 2024-04-05</span>
                    </div>
                    <p className="text-white font-medium">Прострочення виконання понад 30 календарних днів.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Оцінка: Відсутність своєчасного офіційного повідомлення про форс-мажор.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141E33]/40 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Факт №3 · Набуття статусу добросовісної сторони</span>
                      <span className="text-emerald-400">Зафіксовано</span>
                    </div>
                    <p className="text-white font-medium">Позивач діяв із належною обачністю, перевірив реєстри та сплатив ринкову вартість.</p>
                  </div>
                </div>
              )}

              {activeSimTab === 'norms' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#141E33]/40 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#D4AF37] mb-1">
                      <span>Матеріальне право · Відповідальність за прострочення</span>
                      <span>Art. 102 CO / Art. 933 CC</span>
                    </div>
                    <p className="text-white font-medium">Обов'язок відшкодування збитків та сплата неустойки у разі невиправданої затримки.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Вимога: Формальне надіслання вимоги про виконання зобов'язання (mise en demeure).</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#141E33]/40 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#D4AF37] mb-1">
                      <span>Процесуальне право · Тягар доказування</span>
                      <span>Art. 8 CC / Art. 168 CPC</span>
                    </div>
                    <p className="text-white font-medium">Кожна сторона повинна довести обставини, на які вона спирається як на підставу своїх вимог.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Статус доказів: 100% допустимість, відсутність дефектів збирання.</p>
                  </div>
                </div>
              )}

              {activeSimTab === 'risk' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white font-medium">Ймовірність судового задоволення вимоги</span>
                      <span className="font-mono text-emerald-400 font-bold">88% (Висока)</span>
                    </div>
                    <div className="w-full bg-[#141E33] h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full w-[88%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white font-medium">Ризик зустрічного заперечення (Форс-мажор)</span>
                      <span className="font-mono text-amber-400 font-bold">32% (Помірний)</span>
                    </div>
                    <div className="w-full bg-[#141E33] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full w-[32%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-white font-medium">Повнота доказової бази первинними документами</span>
                      <span className="font-mono text-[#38BDF8] font-bold">96% (Бездоганна)</span>
                    </div>
                    <div className="w-full bg-[#141E33] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#38BDF8] h-full rounded-full w-[96%]" />
                    </div>
                  </div>
                </div>
              )}

              {activeSimTab === 'strategy' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/40">
                    <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider block">
                      Крок 1. Досудове врегулювання
                    </span>
                    <p className="text-white font-medium text-xs mt-1">
                      Надіслати структуровану претензію з додатком криптографічного реєстру доказів та встановленим 10-денним строком для добровільного виконання.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/40">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">
                      Крок 2. Превентивне забезпечення позову
                    </span>
                    <p className="text-white font-medium text-xs mt-1">
                      Подати заяву про накладення арешту на рахунки боржника для унеможливлення виведення ліквідних активів до відкриття слухання.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. IMMUTABLE EVIDENCE LEDGER DEMO */}
      <section id="evidence" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider mb-2">
            Chain of Custody Standard
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.evidence.title}</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{t.evidence.subtitle}</p>
        </div>

        {/* Search input for evidence */}
        <div className="mb-4 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            placeholder={t.evidence.searchPlaceholder}
            className="w-full bg-[#141E33] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8] transition-colors"
          />
        </div>

        {/* Evidence Table */}
        <div className="bg-[#141E33]/70 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1D]/80 border-b border-slate-700/80 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Ідентифікатор</th>
                  <th className="py-3 px-4 font-semibold">Назва файлу / Доказ</th>
                  <th className="py-3 px-4 font-semibold">Юридична категорія</th>
                  <th className="py-3 px-4 font-semibold">Криптографічний хеш SHA-256</th>
                  <th className="py-3 px-4 font-semibold text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredEvidence.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#D4AF37]">{item.id}</td>
                    <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{item.type}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[220px]">
                      {item.hash}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. COMPARISON TABLE: Aequitas AI vs Generic LLMs */}
      <section id="comparison" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-2">
            Zero-Hallucination Discipline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.comparison.title}</h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{t.comparison.subtitle}</p>
        </div>

        <div className="bg-[#141E33]/70 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0F1D] border-b border-slate-700/80 font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-5 text-slate-400 font-semibold w-1/3">{t.comparison.headers[0]}</th>
                  <th className="py-3.5 px-5 text-rose-400/90 font-semibold w-1/3">{t.comparison.headers[1]}</th>
                  <th className="py-3.5 px-5 text-[#38BDF8] font-bold w-1/3">{t.comparison.headers[2]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {t.comparison.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-semibold text-white">{row.criterion}</td>
                    <td className="py-4 px-5 text-rose-300/80 leading-relaxed">{row.general}</td>
                    <td className="py-4 px-5 text-emerald-300 font-medium leading-relaxed flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{row.aequitas}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION & FOOTER */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-[#070B14]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t.ctaFooter.title}</h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.ctaFooter.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="/cockpit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C05B] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-105 transition-all flex items-center space-x-2"
            >
              <Scale className="w-4 h-4 text-slate-950" />
              <span>{t.ctaFooter.buttonCockpit}</span>
            </a>

            <a
              href="/docs"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign('/cockpit');
              }}
              className="px-6 py-3 rounded-xl bg-[#141E33] hover:bg-[#1C2B49] border border-slate-700 text-white font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>{t.ctaFooter.buttonDocs}</span>
            </a>
          </div>

          <div className="pt-10 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-400">Aequitas AI</span>
              <span>·</span>
              <span>Sovereign Legal Intelligence Platform</span>
            </div>
            <div className="mt-3 sm:mt-0 font-mono text-[11px]">
              Confidentiality Standard: Art. 73 CPP · ISO/IEC 27037 Compliant
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
