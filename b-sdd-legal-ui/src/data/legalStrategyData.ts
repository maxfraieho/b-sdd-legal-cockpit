// =========================================================================
// B-SDD LEGAL COCKPIT · ЮРИДИЧНИЙ МЕМОРАНДУМ ТА СТРАТЕГІЯ ПРАВОВОГО ЗАХИСТУ
// Доктрина, норми LLCA, CO, CPP, LAVI та офіційні шаблони процесуальних документів
// =========================================================================

export interface LegalDocumentTemplate {
  id: string;
  titleUk: string;
  titleFr: string;
  category: 'pitch' | 'lavi' | 'contract';
  descriptionUk: string;
  descriptionFr: string;
  contentFr: string;
  contentUk: string;
}

export const LEGAL_STRATEGY_MEMORANDUM = {
  version: "2.6.0 (Édition Vaud / LLCA-LAVI Compliance)",
  jurisdiction: "Canton de Vaud, Confédération Suisse",
  caseReference: "Ministère public du canton de Vaud · PE24.014624-SBA",
  updatedAt: "2026-09-27",

  // Sections
  sections: [
    {
      id: "doctrine_llca_co",
      titleUk: "1. Правовий аналіз структури партнерства (LLCA, CO, CPP)",
      titleFr: "1. Analyse juridique du partenariat (LLCA, CO, CPP)",
      contentUk: `
### Заборона pactum de quota litis (ст. 12 lit. e LLCA) та межі pactum de palmario
Відповідно до ст. 12 lit. e LLCA, адвокат зобов'язаний утримуватися від укладення до завершення спору будь-якої угоди, за якою його винагорода визначається пропорційно результату судового процесу (pactum de quota litis). Швейцарський законодавець імперативно забороняє відмову адвоката від оплати праці або її зменшення у разі програшу справи, оскільки це створює пряму фінансову залежність судового повіреного від успіху судового процесу.
Судова практика Федерального суду Швейцарії (ATF 143 III 600, ATF 135 III 259) встановлює три критерії чинності угоди про успіх (pactum de palmario):
1. Базовий гонорар адвоката повинен покривати фактичні виробничі витрати бюро та забезпечувати розумну мінімальну винагороду (honoraires appropriés) незалежно від результату;
2. Надбавка за успіх повинна бути помірною (не перевищує 20–30% від базової вартості послуг);
3. Угода може бути укладена лише на початку правовідносин або після остаточного закриття провадження, проте за жодних обставин не в процесі судового розгляду (pendente lite, ст. 12 lit. i LLCA).

### Легітимна комбінація: залік зустрічних однорідних вимог (ст. 120 CO)
Єдиною бездоганною правовою моделлю, яка витримує дисциплінарний контроль Палати адвокатів кантону Во (Ordre des avocats vaudois, OAV), є поділ правовідносин на два автономні контракти з припиненням зобов'язань заліком:
1. **Контракт на надання IT-послуг та ліцензування (ст. 363 / 394 CO)** між інженером-розробником та адвокатським бюро. Предмет: встановлення B-SDD Legal Workbench, налаштування інваріантів ISO/IEC 27037 (L-01–L-05), бітемпорального графа та WORM-сховища. Вартість фіксується у твердій грошовій сумі в CHF.
2. **Угода про надання правової допомоги (ст. 394 CO)** між адвокатським бюро та повнолітнім сином (потерпілим). Батько виступає третьою особою-платником (tiers payeur).
3. Припинення вимог здійснюється шляхом переведення боргу (ст. 175–176 CO) та наступного зарахування зустрічних однорідних вимог (compensation) за ст. 120–126 CO.

### Несумісність безоплатної правової допомоги (LAVI / ст. 136 CPP) з отриманням IT-активів
При призначенні адвоката державою за ст. 136 CPP або через фонд LAVI послуги оплачуються виключно державною скарбницею за публічним тарифом (180 CHF/год для адвоката, 110 CHF/год для стажера за Регламентом RAJ/VD). Відповідно до ATF 149 IV 91, призначений представник не має права приймати будь-яку приватну винагороду чи блага. Тому співпраця розвивається або в комерційній площині із заліком за ст. 120 CO, або через державні субсидії без будь-яких зобов'язань бюро щодо IT-продукту.
      `,
      contentFr: `
### Proscription du pactum de quota litis (art. 12 let. e LLCA) et limites du pactum de palmario
En vertu de l'art. 12 let. e LLCA, l'avocat doit s'abstenir de conclure avant l'issue du litige toute convention par laquelle ses honoraires dépendraient du résultat du procès (pactum de quota litis). Le Tribunal fédéral (ATF 143 III 600, ATF 135 III 259) retient trois conditions cumulatives de validité du pactum de palmario :
1. Un honoraire de base approprié couvrant les frais effectifs et assurant une rentabilité minimale ;
2. Une prime de succès modérée (n'excédant pas 20 à 30 % du montant de base) ;
3. Une convention passée ab initio ou post numeratum, mais jamais pendente lite (art. 12 let. i LLCA).

### Combinaison contractuelle licite : extinction par compensation (art. 120 CO)
La structure validée devant l'Ordre des Avocats Vaudois (OAV) consiste à scinder l'opération en deux relations juridiques étanches :
1. **Contrat de prestations informatiques et de licence (art. 363 / 394 CO)** pour le déploiement du B-SDD Workbench (ISO/IEC 27037, WORM, graphe bitemporel) à prix fixe convenu ;
2. **Mandat d'assistance judiciaire (art. 394 CO)** pour la défense de la partie plaignante, tarifié au taux horaire usuel ;
3. Reprise de dette (art. 175-176 CO) par le tiers payeur et extinction périodique par compensation conventionnelle (art. 120 CO).
      `,
    },
    {
      id: "lavi_aid_strategy",
      titleUk: "2. Стратегія державної допомоги жертвам (LAVI та ст. 136 CPP)",
      titleFr: "2. Stratégie de soutien étatique aux victimes (LAVI et art. 136 CPP)",
      contentUk: `
### Процесуальний алгоритм звернення до Centre LAVI Vaud (Лозанна)
- **Підстава**: Закон LAVI (RS 312.5). Психічна травма внаслідок погроз (ст. 180 CP), примусу (ст. 181 CP) та порушення недоторканності житла (ст. 186 CP). Згідно з прецедентом Федерального суду **ATF 150 II 465 (TF 1C_653/2022 від 03.06.2024)**, системне залякування завдає шкоди психічній цілісності (atteinte à l'intégrité psychique), породжуючи статус жертви за LAVI.
- **Адреса звернення**: **Centre LAVI Lausanne (Fondation PROFA), Rue du Grand-Pont 2bis, 1003 Lausanne** (тел: +41 21 631 03 00).
- **Кроки**:
  1. Невідкладна допомога (aide immédiate, ст. 13 al. 1 LAVI) — надається без оцінки матеріального стану (консультації та первинний адвокат);
  2. Довгострокова правова підтримка (aide à plus long terme, ст. 13 al. 2 LAVI) — компенсація витрат на адвоката для кримінального провадження PE24.014624-SBA та цивільного позову (ст. 49 CO).

### Призначення офіційного представника за ст. 136 CPP та доведення незабезпеченості (indigence)
- Згідно зі ст. 136 CPP прокурор призначає безоплатного представника потерпілого за наявності: (1) статусу цивільного позивача (ст. 118 CPP) із заявленими вимогами; (2) стану незабезпеченості (indigence); (3) позов не є завідомо безнадійним.
- **Автономія 26-річного сина**: Відповідно до ст. 277 CC обов'язок батьків щодо утримання припиняється у 18 років (або після первинної освіти). У віці 26 років матеріальний стан сина оцінюється судом автономно, без витребування документів батьків з України (ATF 144 IV 285).
- Довідка міграційної служби EVAM (виплати статусу S) безпосередньо підтверджує стан indigence згідно з нормами швейцарського виконавчого провадження (LP).
      `,
      contentFr: `
### Démarches auprès du Centre LAVI Vaud (Fondation PROFA, Rue du Grand-Pont 2bis, Lausanne)
- En application de l'arrêt **ATF 150 II 465**, les actes réitérés de contrainte (art. 181 CP) et menaces (art. 180 CP) constituent une atteinte directe à l'intégrité psychique justifiant le statut de victime (art. 1 al. 1 LAVI).
- L'aide immédiate (art. 13 al. 1 LAVI) est allouée sans égard aux ressources. L'aide à plus long terme (art. 13 al. 2 LAVI) permet la prise en charge des honoraires d'avocat breveté.
- **Indigence autonome (ATF 144 IV 285)** : À l'âge de 26 ans, l'obligation d'entretien des parents (art. 277 CC) est caduque. L'indigence est appréciée exclusivement au regard de la situation du fils domicilié dans le canton de Vaud (attestation EVAM / aide sociale).
      `,
    },
    {
      id: "procedural_roadmap",
      titleUk: "3. Маршрут звернень та запобігання відмові (ст. 310 CPP)",
      titleFr: "3. Trajectoire procédurale et prévention du classement (art. 310 CPP)",
      contentUk: `
### Чому не можна подавати заяву до прокурора без адвоката?
Подання скарги безпосередньо загрожує винесенням постанови про відмову у порушенні справи (**Ordonnance de non-entrée en matière, ст. 310 al. 1 let. a CPP**) через зведення фактів шахрайства до звичайного цивільного спору (litige civil) за відсутністю ознак витонченого обману (astuce, ATF 143 IV 302). Також існує небезпека пропуску 3-місячного строку скарги (délai de 3 mois, ст. 31 CP) за статтями 180 та 186 CP.

### Покрокова інституційна траєкторія:
1. **Permanence juridique OAV (Палац правосуддя Монбенон, Лозанна)**: 20-хвилинна кваліфікована орієнтація адвоката за 50 CHF;
2. **Centre Social Protestant (CSP Vaud, служба «La Fraternité», Place Arlaud 2, Lausanne)**: безоплатні юридичні консультації для осіб із статусом S;
3. **Centre LAVI Lausanne**: фіксація статусу жертви та призначення фінансування адвоката;
4. **Таємниця слідства (ст. 73 CPP / ст. 293 CP)**: суворе дотримання конфіденційності. Будь-які контакти зі ЗМІ (24 heures, Le Temps, RTS) дозволені лише в деперсоналізованій формі через правозахисні органи (OSAR / CSP) після погодження з адвокатом.
      `,
      contentFr: `
### Prévention de l'ordonnance de non-entrée en matière (art. 310 CPP)
La saisine directe sans conseil expose au risque d'un classement sommaire pour défaut d'astuce dans l'escroquerie (ATF 143 IV 302) et à la péremption du délai de 3 mois (art. 31 CP).
Recours préalable impératif :
1. Permanence de l'Ordre des Avocats Vaudois (Montbenon, 50 CHF) ;
2. Centre Social Protestant (CSP Vaud - La Fraternité) ;
3. Centre LAVI (Rue du Grand-Pont 2bis, Lausanne) ;
4. Respect absolu du secret de l'instruction (art. 73 CPP, art. 293 CP).
      `,
    },
  ],
};

export const LEGAL_TEMPLATES: LegalDocumentTemplate[] = [
  {
    id: "pitch_law_firm",
    titleUk: "Документ 1: Лист-пропозиція швейцарському адвокату (Pitch & Partnership)",
    titleFr: "Document 1 : Proposition de partenariat LegalTech et mandat judiciaire",
    category: "pitch",
    descriptionUk: "Офіційний лист-звернення до адвокатського бюро в кантоні Во із пропозицією надання ліцензії B-SDD в обмін на представництво інтересів із заліком за ст. 120 CO.",
    descriptionFr: "Proposition de collaboration technologique et juridique adressée à une Étude d'avocats vaudoise, conforme à l'art. 12 let. e LLCA.",
    contentFr: `OBJET : Proposition de partenariat d'ingénierie LegalTech et mandat d'assistance judiciaire
RÉFÉRENCE CAUSE : Procédure pénale vaudoise MP réf. PE24.014624-SBA

Maître,

En ma qualité d'architecte logiciel et concepteur du système de gouvernance et d'analyse probatoire « B-SDD Legal Advocate Cockpit », je me permets d'attirer votre attention sur une opportunité de collaboration technologique et juridique avec votre Étude.

Face à la complexité croissante des volumétries numériques dans le contentieux pénal moderne, j'ai développé une solution logicielle sur site (on-premise) conçue pour répondre strictement aux exigences de souveraineté des données et du secret professionnel de l'avocat (art. 13 LLCA et 321 CP).

La plateforme B-SDD Legal Workbench garantit :
1. Une traçabilité bitemporelle absolue des faits et la reconstruction dynamique du graphe causal de l'instruction ;
2. La certification des éléments probatoires selon les normes forensiques ISO/IEC 27037, avec empreintes cryptographiques SHA-256 stockées sur architecture WORM inaltérable ;
3. La génération instantanée de faisceaux probatoires sous format PDF/A strictement chapitré avec signets dynamiques, complétée d'un export optimisé pour liseuses d'audience (Kindle / EPUB 3.0) ;
4. Un agent d'intelligence artificielle locale (Private RAG), opérant hors ligne, dédié à la détection contradictoire des discordances au sein des procès-verbaux d'audition.

Je sollicite par la présente la représentation légale de mon fils, âgé de 26 ans et résidant dans le canton de Vaud, actuellement constitué en qualité de partie plaignante dans la cause PE24.014624-SBA instruite pour des chefs d'escroquerie (art. 146 CP), de menaces (art. 180 CP), de contrainte (art. 181 CP) et de violation de domicile (art. 186 CP).

Afin de respecter scrupuleusement l'art. 12 let. e LLCA proscrivant le pactum de quota litis :
- Mon entreprise concède à votre Étude une licence d'exploitation complète du système B-SDD, accompagnée des prestations d'intégration et de maintenance, facturées à prix fixe selon la législation sur le contrat d'entreprise (art. 363 CO) ;
- Votre Étude assure la conduite du mandat judiciaire au tarif horaire usuel régissant votre pratique (art. 394 CO), avec décompte scrupuleux de vos opérations ;
- Le règlement de vos notes d'honoraires s'effectuera par le mécanisme d'une reprise de dette et d'une convention de compensation de créances réciproques certaines, liquides et exigibles (art. 120 CO).

L'ensemble des pièces relatives à la cause PE24.014624-SBA a d'ores et déjà été traité, chronologiquement indexé et certifié sous notre environnement, offrant à votre Étude un bundle d'instruction exhaustif prêt à l'emploi.

Je me tiens à votre entière disposition pour une démonstration technique sécurisée de 20 minutes.

En vous remerciant de l'attention portée à cette proposition, je vous prie d'agréer, Maître, l'assurance de mes sentiments distingués.`,
    contentUk: `ТЕМА: Пропозиція партнерства в сфері LegalTech та мандат на правовий захист
ПРОЦЕСУАЛЬНИЙ НОМЕР: Кримінальне провадження кантону Во MP PE24.014624-SBA

Шановний пане адвокате,

Як розробник та архітектор системи аналізу цифрових доказів та досудового розслідування «B-SDD Legal Advocate Cockpit», звертаюся до Вас із пропозицією взаємовигідного технологічного та юридичного співробітництва.

Зважаючи на складність обробки значних масивів даних у сучасному кримінальному процесі, мною створено локальне програмне рішення (on-premise), орієнтоване на абсолютне збереження адвокатської таємниці та суверенітету клієнтських даних (ст. 13 LLCA та ст. 321 CP).

Система B-SDD Legal Workbench забезпечує:
1. Бітемпоральну фіксацію подій та динамічну візуалізацію графа причинно-наслідкових зв'язків розслідування;
2. Сертифікацію електронних доказів відповідно до міжнародного криміналістичного стандарту ISO/IEC 27037 із криптографічними хеш-сумами SHA-256 у незмінному сховищі WORM;
3. Миттєву компіляцію процесуальних пакетів документів у формат PDF/A з інтерактивною структурою та закладками, а також адаптацію для цифрових пристроїв судового засідання (Kindle / EPUB 3.0);
4. Локальний штучний інтелект (Private RAG), що функціонує в замкненому контурі для виявлення суперечностей та невідповідностей у протоколах допитів без загрози витоку даних.

Метою мого звернення є захист прав мого 26-річного сина, який проживає у кантоні Во та виступає потерпілим у провадженні PE24.014624-SBA за фактами шахрайства (ст. 146 CP), погроз (ст. 180 CP), примусу (ст. 181 CP) та порушення недоторканності житла (ст. 186 CP).

Для безумовного дотримання ст. 12 lit. e LLCA щодо заборони pactum de quota litis пропонується така структура:
- Наше підприємство надає Вашому бюро ліцензію на використання B-SDD з установкою під ключ та технічним супроводом за твердою договірною вартістю на засадах договору підряду (ст. 363 CO);
- Ваше бюро здійснює представництво інтересів клієнта за стандартною погодинною ставкою відповідно до норм про договір доручення (ст. 394 CO) з помісячним наданням тайм-шитів;
- Оплата юридичних рахунків відбувається шляхом оформлення переведення боргу та заліку зустрічних однорідних безспірних вимог (ст. 120 CO).

Уся доказова база у справі PE24.014624-SBA вже верифікована та структурована за допомогою B-SDD, що дозволить Вашому бюро розпочати процес без часових втрат.

Готовий узгодити зручний час для проведення короткої 20-хвилинної онлайн-демонстрації роботи комплексу.

З повагою та щирою вдячністю за Вашу увагу.`,
  },
  {
    id: "lavi_application",
    titleUk: "Документ 2: Заява до Centre LAVI Vaud (Лозанна)",
    titleFr: "Document 2 : Demande formelle d'aide au Centre LAVI Vaud",
    category: "lavi",
    descriptionUk: "Офіційне клопотання потерпілого про надання негайної допомоги та довгострокового фінансування послуг адвоката за рахунок державних коштів кантону Во.",
    descriptionFr: "Requête formelle fondée sur les art. 13 et 16 LAVI et la jurisprudence ATF 150 II 465 (atteinte à l'intégrité psychique).",
    contentFr: `À l'attention du :
Centre d'aide aux victimes d'infractions (LAVI)
Fondation PROFA - Antenne de Lausanne
Rue du Grand-Pont 2bis, 1003 Lausanne

OBJET : Demande formelle d'aide d'urgence et d'assistance juridique à long terme (art. 13 LAVI)
RÉFÉRENCE DU DOSSIER PÉNAL : Ministère public du canton de Vaud, cause PE24.014624-SBA

Madame, Monsieur,

Je soussigné, [Prénom et NOM du requérant], né le [Date de naissance], originaire d'Ukraine, titulaire du permis de protection S, domicilié à [Adresse complète dans le Canton de Vaud],

ai l'honneur de solliciter l'octroi des prestations de soutien et la prise en charge de mon assistance juridique fondées sur les art. 1, 13 et 16 de la Loi fédérale sur l'aide aux victimes d'infractions (LAVI ; RS 312.5).

1. Circonstances de fait et infractions dénoncées
Je suis la victime directe d'agissements illicites continus perpétrés par [Identité de la partie adverse], ayant conduit au dépôt d'une plainte pénale instruite actuellement sous la référence PE24.014624-SBA. Les prévenus ont commis à mon détriment des infractions intentionnelles graves réprimées par les dispositions suivantes :
- Menaces réitérées et alarmantes portant sur mon intégrité (art. 180 CP) ;
- Contrainte physique et psychologique exercée pour vicier ma volonté (art. 181 CP) ;
- Violation de domicile (art. 186 CP) ;
- Escroquerie méthodique ayant engendré une spoliation de mes ressources (art. 146 CP).

2. Réalisation de l'atteinte directe à l'intégrité psychique
Conformément aux principes énoncés par le Tribunal fédéral dans son arrêt ATF 150 II 465, des actes persistants de contrainte et des menaces graves sont de nature à causer une atteinte notable à l'intégrité psychique justifiant l'application de l'art. 1 al. 1 LAVI.
Le climat de terreur, d'intimidation et d'insécurité généré par les auteurs a entraîné chez moi un choc émotionnel durable, caractérisé par un état d'angoisse permanent et des manifestations de stress post-traumatique, corroborés par les pièces médicales produites en annexe. Le lien de causalité naturelle et adéquate entre les infractions pénales et cette atteinte est établi au degré de la vraisemblance prépondérante.

3. Situation d'indigence et précarité
Âgé de 26 ans, vivant isolé sur le territoire helvétique, je ne bénéficie d'aucun soutien financier familial. Mes ressources sont strictement limitées aux montants d'assistance minimale alloués par l'EVAM, me plaçant dans une incapacité matérielle complète de pourvoir aux frais d'un avocat pour assurer la défense de mes droits civils et pénaux devant les autorités d'instruction (art. 118 et 122 CPP).

4. Conclusions
Par ces motifs, je conclus à ce qu'il plaise au Centre LAVI de bien vouloir :
1. Reconnaître formellement ma qualité de victime au sens de l'art. 1 al. 1 LAVI ;
2. M'octroyer le bénéfice de l'aide immédiate en matière de soutien psychologique et juridique d'urgence (art. 13 al. 1 LAVI) ;
3. Statuer sur l'octroi d'une aide à plus long terme (art. 13 al. 2 LAVI) par la prise en charge financière des frais d'intervention d'un avocat breveté pour le suivi de la cause PE24.014624-SBA et la formulation de mes conclusions civiles (art. 49 CO).

Lieu et date : Lausanne, le [Date]
Signature du requérant : ___________________

Annexes produites :
- Copie de la pièce d'identité et du permis S
- Attestation de perception de l'aide sociale d'urgence (EVAM)
- Copie du récépissé de dépôt de plainte / avis de cause pénale PE24.014624-SBA
- Attestation médicale / certificat de suivi psychologique`,
    contentUk: `До:
Центру допомоги жертвам правопорушень (LAVI)
Фонд PROFA - Відділення в м. Лозанна
Rue du Grand-Pont 2bis, 1003 Lausanne

ТЕМА: Офіційна заява про надання екстреної допомоги та довгострокового юридичного супроводу (ст. 13 LAVI)
ПРОЦЕСУАЛЬНИЙ НОМЕР СПРАВИ: Прокуратура кантону Во, справа PE24.014624-SBA

Шановні панове,

Я, [Ім'я та Прізвище заявника], народився [Дата народження], громадянин України, власник статусу тимчасового захисту S, проживаю за адресою: [Повна адреса у кантоні Во],

маю честь звернутися до Вас із клопотанням про надання державної підтримки та покриття витрат на кваліфікованого адвоката відповідно до ст. 1, 13 та 16 Федерального закону про допомогу жертвам кримінальних правопорушень (LAVI; RS 312.5).

1. Фактичні обставини та склад правопорушень
Я став безпосередньою жертвою системних кримінальних посягань, вчинених [Дані протиправних осіб], що стало предметом провадження у прокуратурі під номером PE24.014624-SBA. Правопорушники умисно вчинили щодо мене такі діяння:
- Систематичні погрози життю та безпеці (ст. 180 CP);
- Фізичний та психологічний примус (ст. 181 CP);
- Порушення недоторканності житла (ст. 186 CP);
- Шахрайство, що спричинило суттєву матеріальну шкоду (ст. 146 CP).

2. Безпосереднє порушення психічної цілісності
Відповідно до практики Федерального суду Швейцарії (зокрема постанови ATF 150 II 465), систематичний примус і погрози заподіюють відчутну шкоду психічному здоров'ю особи, що породжує статус жертви за змістом ст. 1 ч. 1 LAVI.
Вчинені діяння призвели до глибокого травматичного стану, постійної тривожності та розладів здоров'я, що підтверджується доданим медичним висновком. Причинно-наслідковий зв'язок між правопорушеннями та шкодою здоров'ю доведений на рівні об'єктивної правдоподібності.

3. Матеріальна незабезпеченість
У віці 26 років я проживаю в Швейцарії самостійно, без жодної матеріальної підтримки з боку батьків. Мій рівень життя забезпечується виключно мінімальними виплатами міграційної служби EVAM, через що я позбавлений будь-якої можливості самостійно оплатити роботу адвоката для захисту цивільних та кримінальних прав (ст. 118, 122 CPP).

4. Прохальна частина
На підставі викладеного прошу Centre LAVI:
1. Визнати мій статус потерпілого у розумінні ст. 1 al. 1 LAVI;
2. Надати невідкладну первинну медико-психологічну та правову допомогу (ст. 13 al. 1 LAVI);
3. Прийняти рішення про довгострокову підтримку (ст. 13 al. 2 LAVI) шляхом фінансування послуг адвоката для супроводу кримінального провадження PE24.014624-SBA та пред'явлення цивільного позову (ст. 49 CO).

Лозанна, [Дата]
Підпис заявника: ___________________

Додатки:
- Копія документа, що посвідчує особу, та посвідки S
- Довідка про перебування на соціальному забезпеченні EVAM
- Копія витягу з матеріалів справи прокуратури PE24.014624-SBA
- Медичний висновок щодо психологічного стану`,
  },
  {
    id: "framework_contract",
    titleUk: "Документ 3: Рамковий договір про IT-послуги та взаємозалік (ст. 120 CO)",
    titleFr: "Document 3 : Contrat-cadre de prestations informatiques avec compensation",
    category: "contract",
    descriptionUk: "Тристороння угода (Розробник - Адвокатське бюро - Клієнт) із переведенням боргу та заліком зустрічних однорідних вимог без порушення ст. 12 lit. e LLCA.",
    descriptionFr: "Convention tripartite conforme aux art. 120 et 175 CO et aux règles déontologiques de l'Ordre des Avocats Vaudois.",
    contentFr: `CONTRAT CADRE DE PRESTATIONS INFORMATIQUES ET DE MANDAT D'ASSISTANCE JUDICIAIRE

ENTRE LES SOUSSIGNÉS :
1. M. [Nom du Concepteur IT], domicilié en Ukraine, ci-après dénommé « le Prestataire IT »,
D'une part,
ET
2. L'Étude d'avocats [Nom de l'Étude], sise à [Lausanne / Vevey], représentée par Me [Nom de l'avocat], avocat inscrit au Barreau vaudois, ci-après dénommée « l'Étude »,
D'autre part,
ET
3. M. [Nom du Client / Fils], domicilié dans le canton de Vaud, ci-après dénommé « le Client »,
Intervenant en qualité de mandant principal,

PRÉAMBULE
- Le Prestataire IT est l'auteur exclusif de la plateforme logicielle forensique « B-SDD Legal Workbench ».
- Le Client requiert les services d'un avocat pour sauvegarder ses droits de partie plaignante dans la procédure pénale PE24.014624-SBA pendante devant le Ministère public cantonal.
- L'Étude dispose des compétences pour assumer ce mandat et manifeste son intérêt pour l'acquisition et le déploiement de l'infrastructure logicielle B-SDD.
- Les parties entendent se conformer rigoureusement aux dispositions des art. 12 let. e LLCA et 20 CO en excluant expressément tout accord de quota litis.

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

Article 1 : Prestations d'ingénierie informatique (art. 363 et 394 CO)
1.1 Le Prestataire IT concède à l'Étude une licence d'utilisation professionnelle de la suite logicielle B-SDD Workbench et s'engage à exécuter son déploiement sur les serveurs locaux sécurisés de l'Étude.
1.2 Le Prestataire IT réalise le calibrage du graphe bitemporel, l'implémentation de la chaîne de conservation ISO/IEC 27037 (WORM) et la configuration du module d'exportation PDF/A.
1.3 Ces prestations informatiques sont facturées à l'Étude pour un montant fixe et indépendant de [Montant, ex. 7'500 CHF] pour la phase de livraison, complété d'une redevance de support technique fixée à [Montant, ex. 1'000 CHF] par mois.

Article 2 : Mandat d'assistance juridique (art. 394 ss CO)
2.1 L'Étude accepte d'assurer la représentation du Client dans la conduite de la procédure PE24.014624-SBA et d'exercer toutes démarches utiles à la défense de ses intérêts civils et pénaux.
2.2 Les prestations de l'Étude sont rétribuées sur la base d'un tarif horaire conventionnel de [ex. 350 CHF] par heure, hors taxes. L'Étude s'engage à tenir un état de frais et un décompte d'heures régulier adressé mensuellement au Client.
2.3 Les honoraires sont dus indépendamment de l'issue du litige et ne constituent en aucun cas une rémunération subordonnée au résultat.

Article 3 : Reprise de dette et extinction des créances par compensation (art. 120 et 175 CO)
3.1 Par la signature des présentes, le Prestataire IT déclare reprendre solidairement la dette du Client née des notes d'honoraires de l'Étude relatives à la cause susmentionnée.
3.2 À due concurrence, la créance de l'Étude en paiement de ses honoraires s'éteint au terme de chaque période mensuelle par compensation conventionnelle au sens de l'art. 120 CO avec la créance du Prestataire IT portant sur les prestations d'ingénierie informatique fournies.

Article 4 : Indépendance professionnelle et résiliation (art. 12 let. b LLCA et 404 CO)
L'Étude conserve une indépendance déontologique absolue dans la direction de la stratégie judiciaire. Chacune des parties conserve le droit de révoquer le mandat de représentation conformément à l'art. 404 CO sans que cela n'entraîne la résiliation des accords de licence logicielle, dont les créances résiduelles deviendraient alors exigibles selon les modalités du droit commun.

Fait à Lausanne, en trois exemplaires originaux, le [Date]

Pour le Prestataire IT : _______________
Pour l'Étude : _______________
Pour le Client : _______________`,
    contentUk: `РАМКОВИЙ ДОГОВІР ПРО НАДАННЯ IT-ПОСЛУГ ТА МАНДАТ НА ЮРИДИЧНУ ДОПОМОГУ

СТОРОНИ ДОГОВОРУ:
1. Пан [Ім'я та Прізвище розробника], місце проживання: Україна, надалі — «IT-Виконавець»,
2. Адвокатське бюро [Назва Бюро], адреса: Кантон Во, Швейцарія, в особі адвоката [Прізвище, Ім'я], члена Реєстру адвокатів кантону Во, надалі — «Бюро»,
3. Пан [Ім'я та Прізвище клієнта / Сина], місце проживання: Кантон Во, надалі — «Клієнт»,

ПРЕАМБУЛА
- IT-Виконавець є автором спеціалізованого програмного комплексу криміналістичного аналізу доказів «B-SDD Legal Workbench».
- Клієнт потребує правничої допомоги у справі PE24.014624-SBA, що перебуває у провадженні прокуратури кантону Во.
- Бюро зацікавлене у придбанні та впровадженні зазначеного програмного продукту на власній інфраструктурі.
- Сторони суворо керуються вимогами ст. 12 lit. e LLCA та ст. 20 CO, виключаючи будь-які домовленості про гонорар успіху (pactum de quota litis).

ПРЕДМЕТ ДОГОВОРУ:

Стаття 1: Надання IT-послуг (ст. 363 та 394 CO)
1.1 IT-Виконавець надає Бюро професійну ліцензію на використання B-SDD Workbench та забезпечує його розгортання на захищених локальних серверах Бюро.
1.2 IT-Виконавець виконує налаштування бітемпорального графа, стандарту ISO/IEC 27037 (WORM) та модуля генерації процесуальних файлів PDF/A.
1.3 Послуги приймаються за твердою вартістю: [7 500 CHF] за розгортання комплексу та [1 000 CHF] щомісячно за підтримку.

Стаття 2: Мандат на юридичну допомогу (ст. 394 CO)
2.1 Бюро представляє інтереси Клієнта у кримінальній справі PE24.014624-SBA перед судово-слідчими органами.
2.2 Робота адвоката оплачується за фіксованою погодинною ставкою в розмірі [350 CHF] за годину, без урахування податків, на основі деталізованих щомісячних звітів.
2.3 Оплата праці адвоката не залежить від фінального результату розгляду кримінальної справи.

Стаття 3: Переведення боргу та припинення вимог заліком (ст. 120 та 175 CO)
3.1 IT-Виконавець солідарно бере на себе обов'язок щодо сплати рахунків за юридичну допомогу, виставлених Клієнту.
3.2 Щомісячно грошові зобов'язання Бюро з оплати IT-послуг та зобов'язання з оплати юридичної допомоги припиняються заліком зустрічних вимог на підставі ст. 120 CO.

Стаття 4: Професійна незалежність (ст. 12 lit. b LLCA та ст. 404 CO)
Бюро діє абсолютно незалежно у виборі лінії захисту. Дострокове розірвання мандата на представництво (ст. 404 CO) не тягне автоматичного припинення дії IT-ліцензії.

Лозанна, [Дата]

IT-Виконавець: _______________
Бюро: _______________
Клієнт: _______________`,
  },
];
