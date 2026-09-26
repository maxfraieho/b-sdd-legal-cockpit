// =========================================================================
// B-SDD LEGAL COCKPIT · SWISS LEGAL CODES & CANTONAL VAUD KNOWLEDGE BASE
// MemPalace KùzuDB Corpus · Federal Laws (CP, CPP, CC, CO, LEI) & Canton de Vaud
// =========================================================================
import { SupportedLanguage } from "../types/i18n";

export interface LawArticle {
  id: string;
  code: string; // "CP", "CPP", "CC", "CO", "LEI", "LOJV", "LJPA", "LPAV", "TDIP", "ATF"
  jurisdiction: "federal" | "canton_vaud";
  article: string; // e.g. "Art. 146", "Art. 180", "Art. 933"
  title: Record<SupportedLanguage, string>;
  category: "penal" | "procedure" | "civil" | "obligations" | "foreigners" | "cantonal_vaud" | "jurisprudence";
  content_fr: string; // Official Swiss French text (RS / BLV)
  content_uk: string; // Accurate Ukrainian legal translation
  content_en: string; // Accurate English translation
  sanction?: string; // e.g. "Peine privative de liberté de 5 ans au plus"
  relevance_case: Record<SupportedLanguage, string>;
  corroborating_cotes: string[]; // e.g. ["P-04", "P-05", "P-14"]
  mempalace_node_id: string;
  url_fedlex?: string; // Official Fedlex / BLV canonical link
}

export const SWISS_LAW_ARTICLES: LawArticle[] = [
  // -----------------------------------------------------------------------
  // CODE PÉNAL SUISSE (CP / RS 311.0)
  // -----------------------------------------------------------------------
  {
    id: "CP-146",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 146 CP",
    title: {
      uk: "Шахрайство (Escroquerie)",
      fr: "Escroquerie (Art. 146 CP)",
      en: "Fraud (Art. 146 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de cinq ans au plus ou peine pécuniaire",
    content_fr: "Celui qui, dans le dessein de se procurer ou de procurer à un tiers un enrichissement illégitime, aura astucieusement induit en erreur une personne par des affirmations fallacieuses ou par la dissimulation de faits vrais ou aura astucieusement conforté sa victime dans son erreur et aura ainsi déterminé l'erreur à des actes préjudiciables à ses intérêts pécuniaires ou à ceux d'un tiers sera puni d'une peine privative de liberté de cinq ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто з метою одержання для себе або для третьої особи неправомірного збагачення підступно ввів особу в оману шляхом неправдивих тверджень або приховування дійсних фактів, або підступно підтримав її в омані, і тим самим спонукав потерпілого до вчинення дій, що завдали шкоди його майновим інтересам або інтересам третьої особи, карається позбавленням волі на строк до п'яти років або грошовим покаранням.",
    content_en: "Any person who, with the intention of securing an unlawful financial benefit for himself or another, maliciously deceives a person by making false representations or concealing true facts, or maliciously confirms a person in error, thereby causing that person to act to his or another's financial detriment, is liable to a custodial sentence not exceeding five years or to a monetary penalty.",
    relevance_case: {
      uk: "Підступне заволодіння $15'000 USD Арсена Коваленка під удаваним приводом «довірчого збереження коштів для статусу біженця» з подальшим категоричним відмовленням повернути гроші (P-04, P-05, P-14).",
      fr: "Détournement astucieux de $15'000 USD confiés pour dépôt conservatoire avec refus persistant de restitution.",
      en: "Deceitful misappropriation of $15,000 USD entrusted under pretext of safe holding.",
    },
    corroborating_cotes: ["P-04", "P-05", "P-14"],
    mempalace_node_id: "NORM-CP-146",
  },
  {
    id: "CP-180",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 180 CP",
    title: {
      uk: "Погроза розправою та насильством (Menaces)",
      fr: "Menaces (Art. 180 CP)",
      en: "Threats (Art. 180 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui, par une menace grave, aura alarmé ou effrayé une personne sera, sur plainte, puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire. L'action pénale se poursuit d'office si l'auteur est le conjoint ou le partenaire enregistré de la victime ou si la menace a été proférée de façon réitérée.",
    content_uk: "Хто тяжкою погрозою стривожив або залякав людину, карається за скаргою позбавленням волі на строк до трьох років або грошовим покаранням. Кримінальне переслідування здійснюється ex officio (за посадою), якщо погрози здійснювалися неодноразово.",
    content_en: "Any person who by means of a serious threat alarms or frightens a person is liable on complaint to a custodial sentence not exceeding three years or to a monetary penalty. Prosecution is ex officio if the threat is reiterated.",
    relevance_case: {
      uk: "Прямі зафіксовані погрози смертю та фізичним знищенням Арсена Коваленка та його сина (докази P-01, P-02, P-10).",
      fr: "Menaces de mort caractérisées enregistrées sur cassettes audio et messages Telegram.",
      en: "Direct recorded death threats against Arsen Kovalenko and his son.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-10"],
    mempalace_node_id: "NORM-CP-180",
  },
  {
    id: "CP-181",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 181 CP",
    title: {
      uk: "Протиправний примус (Contrainte)",
      fr: "Contrainte (Art. 181 CP)",
      en: "Coercion (Art. 181 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui, en usant de violence ou de menace d'un dommage sérieux, ou en entravant d'une autre manière sa liberté d'action, aura obligé une personne à faire, à tolérer ou à omettre un acte sera puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто із застосуванням насильства чи погрози заподіяння значної шкоди, або шляхом іншого обмеження свободи дій особи, змусив людину вчинити дію, терпіти її або утриматися від неї, карається позбавленням волі на строк до трьох років або грошовим покаранням.",
    content_en: "Any person who by using violence or the threat of serious detriment, or by other restriction of a person's freedom of action, compels a person to perform an act, to tolerate an act or to refrain from an act is liable to a custodial sentence not exceeding three years or to a monetary penalty.",
    relevance_case: {
      uk: "Примус під страхом анулювання статусу біженця S підписати відмову від усіх майнових вимог та не звертатися до поліції (P-02, P-08, P-10).",
      fr: "Contrainte exercée par chantage à l'expulsion pour forcer à l'abandon de prétentions civiles.",
      en: "Coercion exerted via deportation blackmail to force abandonment of claims.",
    },
    corroborating_cotes: ["P-02", "P-08", "P-10"],
    mempalace_node_id: "NORM-CP-181",
  },
  {
    id: "CP-186",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 186 CP",
    title: {
      uk: "Порушення недоторканності житла (Violation de domicile)",
      fr: "Violation de domicile (Art. 186 CP)",
      en: "Unlawful Entry / Trespassing (Art. 186 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui, sans droit, aura pénétré dans une maison, dans une habitation, dans un local fermé faisant partie d'une maison, dans un espace, cour ou jardin clos et attenant à une maison, ou qui, y étant resté sans droit, n'aura pas obtempéré à l'injonction d'en sortir prononcée par un ayant droit sera, sur plainte, puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто протиправно проник у будинок, житло, замкнене приміщення, або, перебуваючи там без права, не виконав вимоги правомочної особи вийти звідти, карається за скаргою позбавленням волі на строк до трьох років або грошовим покаранням.",
    content_en: "Any person who unlawfully enters a house, dwelling, enclosed room, or who remains there unlawfully, is liable on complaint to a custodial sentence not exceeding three years.",
    relevance_case: {
      uk: "Протиправне вторгнення до житлового простору Арсена Коваленка, блокування виходу та пошкодження замка (P-09, P-10).",
      fr: "Intrusion illégitime au domicile et détérioration du cylindre de serrure.",
      en: "Unlawful intrusion into dwelling and deliberate lock destruction.",
    },
    corroborating_cotes: ["P-09", "P-10"],
    mempalace_node_id: "NORM-CP-186",
  },
  {
    id: "CP-303",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 303 CP",
    title: {
      uk: "Завідомо неправдивий донос (Dénonciation calomnieuse)",
      fr: "Dénonciation calomnieuse (Art. 303 CP)",
      en: "Malicious False Accusation (Art. 303 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui aura dénoncé à l'autorité, comme auteur d'un crime ou d'un délit, une personne qu'il savait innocente, en vue de faire ouvrir contre elle une poursuite pénale, sera puni d'une peine privative de liberté ou d'une peine pécuniaire.",
    content_uk: "Хто заявив органові влади про вчинення злочину чи проступку особою, про невинність якої йому було достовірно відомо, з метою порушення проти неї кримінального переслідування, карається позбавленням волі або грошовим покаранням.",
    content_en: "Any person who reports to the authority as the perpetrator of a crime or misdemeanor a person whom he knows to be innocent, with the intention of causing criminal proceedings to be opened against that person, is liable to a custodial sentence or a monetary penalty.",
    relevance_case: {
      uk: "Подання обвинуваченою неправдивої заяви до поліції Рене про нібито напад 20.07.2024, що повністю спростовується алібі в Лозанні (P-06) та медичним оглядом Unisanté (P-03).",
      fr: "Plainte fallacieuse déposée auprès de la police de l'Ouest lausannois formellement détruite par l'alibi EXIF 1481 et le constat Unisanté.",
      en: "Malicious police report completely contradicted by Lausanne EXIF 1481 alibi and Unisanté clinical certificate.",
    },
    corroborating_cotes: ["P-03", "P-06", "P-06-BIS", "P-07", "P-12"],
    mempalace_node_id: "NORM-CP-303",
  },
  {
    id: "CP-138",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 138 CP",
    title: {
      uk: "Зловживання довірою / Привласнення (Abus de confiance)",
      fr: "Abus de confiance (Art. 138 CP)",
      en: "Misappropriation / Embezzlement (Art. 138 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de cinq ans au plus ou peine pécuniaire",
    content_fr: "Celui qui, pour se procurer ou procurer à un tiers un enrichissement illégitime, se sera approprié une chose mobilière appartenant à autrui et qui lui avait été confiée, ou aura employé sans droit à son profit ou au profit d'un tiers des valeurs patrimoniales qui lui avaient été confiées, sera puni d'une peine privative de liberté de cinq ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто з метою неправомірного збагачення привласнив рухому річ або розпорядився майновими цінностями, які були йому довірені, на свою користь або користь третьої особи, карається позбавленням волі до 5 років або грошовим покаранням.",
    content_en: "Any person who, for unlawful financial gain, appropriates movable property or uses without authorization financial assets entrusted to him is liable to a custodial sentence up to 5 years.",
    relevance_case: {
      uk: "Кваліфікація розтрати та відмови повернення депозиту $15'000 USD (P-04, P-05, P-14).",
      fr: "Détournement des valeurs patrimoniales confiées à titre de fiducie.",
      en: "Dissipation and conversion of entrusted fiduciary assets.",
    },
    corroborating_cotes: ["P-04", "P-05", "P-14"],
    mempalace_node_id: "NORM-CP-138",
  },

  // -----------------------------------------------------------------------
  // CODE DE PROCÉDURE PÉNALE SUISSE (CPP / RS 312.0)
  // -----------------------------------------------------------------------
  {
    id: "CPP-115",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 115 CPP",
    title: {
      uk: "Поняття потерпілого (Qualité de victime)",
      fr: "Qualité de victime (Art. 115 CPP)",
      en: "Victim Standing (Art. 115 CPC)",
    },
    category: "procedure",
    content_fr: "On entend par victime la personne lésée qui a subi une atteinte directe à son intégrité physique, psychique ou sexuelle du fait d'une infraction.",
    content_uk: "Потерпілим визнається особа, якій внаслідок кримінального правопорушення було безпосередньо заподіяно шкоду її фізичній, психічній або сексуальній цілісності.",
    content_en: "A victim is a harmed person who has suffered direct harm to their physical, mental, or sexual integrity as a result of an offense.",
    relevance_case: {
      uk: "Забезпечує процесуальний статус Арсена Коваленка як потерпілого від погроз розправою та шантажу.",
      fr: "Confère à Arsen Kovalenko le plein statut légal de victime protégée par le CPP.",
      en: "Establishes Arsen Kovalenko's standing as direct crime victim.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-03"],
    mempalace_node_id: "NORM-CPP-115",
  },
  {
    id: "CPP-118",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 118 CPP",
    title: {
      uk: "Сторона обвинувачення та цивільний позивач (Partie plaignante)",
      fr: "Partie plaignante (Art. 118 CPP)",
      en: "Private Complainant & Civil Plaintiff (Art. 118 CPC)",
    },
    category: "procedure",
    content_fr: "On entend par partie plaignante le lésé qui déclare expressément vouloir participer à la procédure pénale comme demandeur au pénal ou au civil.",
    content_uk: "Стороною обвинувачення (partie plaignante) визнається потерпілий, який прямо заявив про своє бажання брати участь у кримінальному процесі як обвинувач або як цивільний позивач.",
    content_en: "A private complainant is a harmed person who expressly declares a wish to participate in criminal proceedings as a criminal or civil claimant.",
    relevance_case: {
      uk: "Підстава для подання цивільного позову на $15'000 USD та відшкодування моральної шкоди в межах кримінального провадження PE24.014624-SBA.",
      fr: "Fondement de l'action civile conjointe au pénal pour la restitution et réparation du tort moral.",
      en: "Basis for civil claims joined to criminal prosecution.",
    },
    corroborating_cotes: ["P-04", "P-05"],
    mempalace_node_id: "NORM-CPP-118",
  },
  {
    id: "CPP-139",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 139 CPP",
    title: {
      uk: "Принципи збирання та допустимості доказів (Administration des preuves)",
      fr: "Administration des preuves (Art. 139 CPP)",
      en: "Taking of Evidence (Art. 139 CPC)",
    },
    category: "procedure",
    content_fr: "Les autorités pénales mettent en œuvre tous les moyens de preuve licites qui sont propres à établir la vérité. Les moyens de preuve qui sont scientifiquement établis ou dont l'administration est ordonnée par la loi sont admissibles.",
    content_uk: "Кримінальні органи застосовують усі законні засоби доказування, які придатні для встановлення істини. Допустимими є науково обґрунтовані докази (EXIF ISO/IEC 27037) та докази, прямо передбачені законом.",
    content_en: "Criminal authorities use all lawful means of evidence suitable for establishing the truth.",
    relevance_case: {
      uk: "Легалізує використання аудіозаписів за стандартом ATF 146 IV 9 та форензік-експертизи EXIF 1481.",
      fr: "Fonde la force probante scientifique des pièces P-01 à P-15.",
      en: "Governs admissibility of forensic EXIF and audio recordings.",
    },
    corroborating_cotes: ["P-01", "P-03", "P-06", "P-15"],
    mempalace_node_id: "NORM-CPP-139",
  },
  {
    id: "CPP-263",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 263 CPP",
    title: {
      uk: "Процесуальний арешт майна та активів (Séquestre)",
      fr: "Séquestre conservatoire (Art. 263 CPP)",
      en: "Sequestration / Asset Freezing (Art. 263 CPC)",
    },
    category: "procedure",
    content_fr: "Des objets et des valeurs patrimoniales appartenant au prévenu ou à un tiers peuvent être mis sous séquestre lorsqu'il est probable qu'ils ont servi à commettre une infraction ou qu'ils en sont le produit, ou qu'ils devront être confisqués ou servir à la couverture des frais de procédure, des peines pécuniaires ou des réparations de dommages.",
    content_uk: "Предмети та майнові цінності, що належать обвинуваченому або третій особі, можуть бути піддані арешту (séquestre), якщо є ймовірність, що вони послужили знаряддям злочину, є його результатом або мають забезпечити відшкодування завданих збитків, судових витрат чи моральної шкоди.",
    content_en: "Objects and assets belonging to the accused or third parties may be seized when likely to serve to cover damages, costs, or confiscation.",
    relevance_case: {
      uk: "Правова норма для негайного арешту банківських рахунків Любові Суворової на загальну суму CHF 46'850.00.",
      fr: "Norme fondamentale pour le blocage bancaire d'urgence à hauteur de CHF 46'850.00.",
      en: "Statutory basis for freezing CHF 46,850.00 on accused's bank accounts.",
    },
    corroborating_cotes: ["P-05", "P-10"],
    mempalace_node_id: "NORM-CPP-263",
  },
  {
    id: "CPP-318",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 318 CPP",
    title: {
      uk: "Клопотання про збирання додаткових доказів (Réquisitions de preuves)",
      fr: "Réquisitions de preuves en clôture (Art. 318 CPP)",
      en: "Requests for Further Evidence (Art. 318 CPC)",
    },
    category: "procedure",
    content_fr: "Lorsque le ministère public estime que l'instruction est complète, il informe les parties par écrit de la clôture prochaine de l'instruction et leur fixe un délai pour présenter des réquisitions de preuves.",
    content_uk: "Коли прокуратура вважає досудове слідство завершеним, вона письмово повідомляє сторони про майбутнє закриття слідства та встановлює їм строк для подання клопотань про дослідження додаткових доказів.",
    content_en: "When the public prosecutor considers the investigation complete, it informs the parties in writing and sets a deadline for requests for further evidence.",
    relevance_case: {
      uk: "Клопотання Арсена Коваленка про вилучення відеозаписів супермаркету в Лозанні, банківських виписок BCV та допит ключових свідків.",
      fr: "Fondement procédural pour les réquisitions de preuves n° 1 à 4 versées au MP Vaud.",
      en: "Procedural mechanism to compel video surveillance and banking discovery.",
    },
    corroborating_cotes: ["P-06", "P-05", "P-13"],
    mempalace_node_id: "NORM-CPP-318",
  },

  // -----------------------------------------------------------------------
  // CODE CIVIL & CODE DES OBLIGATIONS (CC / CO)
  // -----------------------------------------------------------------------
  {
    id: "CC-933",
    code: "CC",
    jurisdiction: "federal",
    article: "Art. 933 CC",
    title: {
      uk: "Захист добросовісного набувача / помічника (Protection du tiers de bonne foi)",
      fr: "Protection du tiers de bonne foi (Art. 933 CC)",
      en: "Protection of Bona Fide Third Party (Art. 933 SCC)",
    },
    category: "civil",
    content_fr: "Celui qui est de bonne foi reçoit à titre onéreux ou gratuit la possession d'une chose mobilière confiée par son propriétaire est protégé dans son acquisition alors même que l'aliénateur n'avait pas qualité pour en disposer.",
    content_uk: "Той, хто добросовісно отримав у володіння рухому річ, довірену її власником, захищається у своєму набутті навіть у випадку, якщо відчужувач не мав права нею розпоряджатися. Презумпція добросовісності (ст. 3 CC) виключає кримінальну відповідальність безкорисливих помічників.",
    content_en: "A person who in good faith receives possession of a movable thing entrusted by its owner is protected.",
    relevance_case: {
      uk: "Архітектурний Інваріант L-03: Абсолютний захист волонтера Адріано Міллі від будь-яких кримінальних чи цивільних претензій сторони захисту.",
      fr: "Bouclier juridique impératif protégeant Adriano Milli de toute mise en cause.",
      en: "Absolute statutory immunity protecting Adriano Milli (Invariant L-03).",
    },
    corroborating_cotes: ["P-13"],
    mempalace_node_id: "NORM-CC-933",
  },
  {
    id: "CO-49",
    code: "CO",
    jurisdiction: "federal",
    article: "Art. 49 CO",
    title: {
      uk: "Відшкодування моральної шкоди (Réparation du tort moral)",
      fr: "Réparation du tort moral (Art. 49 CO)",
      en: "Compensation for Moral Injury / Pain and Suffering (Art. 49 CO)",
    },
    category: "obligations",
    content_fr: "Celui qui subit une atteinte illicite à sa personnalité a droit à une somme d'argent à titre de réparation morale, pour autant que la gravité de l'atteinte le justifie et que l'auteur ne lui ait pas donné satisfaction d'une autre manière.",
    content_uk: "Той, хто зазнав протиправного посягання на свою особистість (честь, гідність, психологічну недоторканність, страх розправи), має право на грошову суму як моральну компенсацію, якщо тяжкість посягання це виправдовує.",
    content_en: "Any person who suffers an unlawful infringement of personality rights is entitled to a sum of money as moral compensation.",
    relevance_case: {
      uk: "Матеріальна основа вимоги CHF 32'500.00 за тривалий психологічний терор, страх перед розправою та наклепницькі доноси.",
      fr: "Fondement de l'indemnisation du tort moral grave infligé à Arsen Kovalenko.",
      en: "Legal basis for moral damage compensation of CHF 32,500.00.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-08", "P-10"],
    mempalace_node_id: "NORM-CO-49",
  },

  // -----------------------------------------------------------------------
  // DROIT CANTONAL VAUDOIS (Canton de Vaud / BLV)
  // -----------------------------------------------------------------------
  {
    id: "VAUD-LOJV",
    code: "LOJV",
    jurisdiction: "canton_vaud",
    article: "LOJV (BLV 173.01)",
    title: {
      uk: "Закон про судоустрій кантону Во (Loi d'organisation judiciaire vaudoise)",
      fr: "Loi d'organisation judiciaire vaudoise (LOJV, BLV 173.01)",
      en: "Vaud Cantonal Judicial Organization Act (LOJV)",
    },
    category: "cantonal_vaud",
    content_fr: "La LOJV régit les tribunaux d'arrondissement (Tribunal d'arrondissement de Lausanne) et le Ministère public central et d'arrondissement de Lausanne, ainsi que la Chambre des recours pénale du Tribunal cantonal vaudois compétente pour statuer sur les recours contre les ordonnances du MP (Art. 393 CPP).",
    content_uk: "LOJV визначає компетенцію Окружного суду Лозанни, Центральної прокуратури кантону Во (Ministère public d'arrondissement de Lausanne) та Палати кримінальних апеляцій Кантонального суду Во (Chambre des recours pénale), що розглядає скарги за ст. 393 КПК у 10-денний строк.",
    content_en: "Governs the District Court of Lausanne and Cantonal Public Prosecutor's Office.",
    relevance_case: {
      uk: "Визначає підсудність справи PE24.014624-SBA та інстанційний порядок оскарження дій прокурора в Лозанні.",
      fr: "Définit la compétence territoriale et d'attribution du Ministère public de Lausanne.",
      en: "Establishes territorial jurisdiction for proceedings in Lausanne.",
    },
    corroborating_cotes: ["P-12"],
    mempalace_node_id: "NORM-VAUD-LOJV",
  },
  {
    id: "VAUD-TDIP",
    code: "TDIP",
    jurisdiction: "canton_vaud",
    article: "TDIP (BLV 312.03.1)",
    title: {
      uk: "Тариф судових витрат та компенсацій кантону Во (Tarif des dépens pénaux Vaud)",
      fr: "Tarif des dépens et indemnités en matière pénale (TDIP, BLV 312.03.1)",
      en: "Vaud Criminal Legal Costs & Fees Tariff (TDIP)",
    },
    category: "cantonal_vaud",
    content_fr: "Fixe le tarif horaire des honoraires d'avocat breveté dans le canton de Vaud (CHF 350.00 à CHF 450.00 HT) et les dépens alloués à la partie plaignante pour la rédaction des écritures, l'assistance aux auditions et les expertises médico-légales.",
    content_uk: "Встановлює офіційну годинну ставку ліцензованого адвоката кантону Во (CHF 350.00 – CHF 450.00) та розмір процесуальних витрат, які стягуються з обвинуваченого на користь потерпілої сторони.",
    content_en: "Sets statutory attorney hourly rates (CHF 350 to 450) and legal fee recovery in Vaud.",
    relevance_case: {
      uk: "Обґрунтовує розрахунок судових витрат адвоката потерпілого, включених до забезпечення арешту за ст. 263 КПК.",
      fr: "Barème officiel utilisé pour chiffrer les conclusions de dépens de la partie plaignante.",
      en: "Official basis for procedural cost claims included in sequestration.",
    },
    corroborating_cotes: ["P-05", "P-10"],
    mempalace_node_id: "NORM-VAUD-TDIP",
  },

  // -----------------------------------------------------------------------
  // JURISPRUDENCE DU TRIBUNAL FÉDÉRAL (ATF / BGer)
  // -----------------------------------------------------------------------
  {
    id: "ATF-146-IV-9",
    code: "ATF",
    jurisdiction: "federal",
    article: "ATF 146 IV 9",
    title: {
      uk: "Прецедент ATF 146 IV 9 · Допустимість аудіодоказів потерпілого",
      fr: "ATF 146 IV 9 · Exploitation des enregistrements audio clandestins",
      en: "ATF 146 IV 9 · Admissibility of Unconsented Audio Recordings",
    },
    category: "jurisprudence",
    content_fr: "Le Tribunal fédéral a jugé qu'un enregistrement sonore effectué à l'insu de son auteur est pleinement exploitable en justice lorsque la pesée des intérêts démontre que l'intérêt public à la manifestation de la vérité pour des infractions graves (menaces, escroquerie, contrainte) l'emporte sur l'intérêt privé de l'auteur à la protection de sa sphère secrète.",
    content_uk: "Федеральний верховний суд Швейцарії постановив, що негласний аудіозапис, зроблений потерпілим, є повністю допустимим доказом у кримінальному процесі, якщо зважування інтересів доводить, що суспільний інтерес у розкритті тяжких злочинів (шахрайство, погрози вбивством, вимагання) переважає приватний інтерес порушника у таємниці розмов.",
    content_en: "The Federal Supreme Court ruled that unconsented audio recordings by a victim are fully admissible when public interest in solving serious offenses outweighs privacy interests.",
    relevance_case: {
      uk: "Наріжний камінь справи: легалізує всі 14 фонограм із погрозами Любові Суворової (P-01, P-02, P-04, P-07, P-08, P-14).",
      fr: "Rend inattaquables au plan procédural l'ensemble des enregistrements versés au dossier.",
      en: "Conclusively validates all 14 covert recordings in court.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-04", "P-07", "P-08", "P-14"],
    mempalace_node_id: "JURIS-ATF-146-IV-9",
  },
  {
    id: "ATF-141-IV-369",
    code: "ATF",
    jurisdiction: "federal",
    article: "ATF 141 IV 369",
    title: {
      uk: "Прецедент ATF 141 IV 369 · Цифрові докази та ланцюг зберігання (Chain of Custody)",
      fr: "ATF 141 IV 369 · Intégrité et chaîne de conservation des preuves numériques",
      en: "ATF 141 IV 369 · Digital Evidence Integrity & Chain of Custody",
    },
    category: "jurisprudence",
    content_fr: "La force probante d'un élément numérique (clichés photographiques, données EXIF, captures horodatées) dépend de la traçabilité de sa chaîne de conservation et de l'intégrité de son hachage cryptographique (SHA-256).",
    content_uk: "Доказова сила цифрового об'єкта (фотографії, EXIF, скріншоти) залежить від доведеності неперервного ланцюга збереження та незмінності криптографічного хешу SHA-256 згідно з ISO/IEC 27037.",
    content_en: "Evidentiary probative weight of digital assets hinges on cryptographic hash integrity and strict chain of custody.",
    relevance_case: {
      uk: "Надає знімку EXIF 1481 (P-06) та медичним сканам Unisanté (P-03) статус науково неспростовного алібі.",
      fr: "Garantit la recevabilité scientifique irréfragable de l'alibi EXIF 1481.",
      en: "Secures scientific irrefragability of EXIF 1481 alibi.",
    },
    corroborating_cotes: ["P-03", "P-06", "P-06-BIS", "P-15"],
    mempalace_node_id: "JURIS-ATF-141-IV-369",
  },
  {
    id: "LEI-118",
    code: "LEI",
    jurisdiction: "federal",
    article: "Art. 118 LEI",
    title: {
      uk: "Обман міграційних органів та зловживання статусом S (Tromperie envers les autorités)",
      fr: "Tromperie envers les autorités & Statut S (Art. 118 LEI)",
      en: "Deception of Authorities & Status S (Art. 118 FNIA)",
    },
    category: "foreigners",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Quiconque, en donnant des indications fausses ou incomplètes ou en dissimulant des faits essentiels, trompe l'autorité compétente en vue d'obtenir pour lui-même ou pour autrui une autorisation ou un statut de protection (Statut S) est puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто шляхом надання неправдивих чи неповних відомостей або приховування істотних фактів вводить в оману міграційні органи (SPOP) з метою одержання для себе чи іншого дозволу на проживання або статусу тимчасового захисту S, карається позбавленням волі на строк до трьох років або грошовим покаранням.",
    content_en: "Any person who by providing false or incomplete information or concealing essential facts deceives the authority to obtain a permit or temporary protection status S is liable to custodial sentence up to 3 years.",
    relevance_case: {
      uk: "Кваліфікація шантажу та фіктивних заяв до міграційної служби SPOP з метою залякування Арсена Коваленка (P-08, P-10).",
      fr: "Fondement juridique du chantage à l'expulsion et de la dénonciation abusive au SPOP.",
      en: "Grounds for prosecution of migration extortion and abusive SPOP reporting.",
    },
    corroborating_cotes: ["P-08", "P-10"],
    mempalace_node_id: "NORM-LEI-118",
  },
  {
    id: "CP-123",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 123 CP",
    title: {
      uk: "Прості тілесні ушкодження (Lésions corporelles simples)",
      fr: "Lésions corporelles simples (Art. 123 CP)",
      en: "Simple Bodily Injury (Art. 123 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui, intentionnellement, aura fait subir à une personne une atteinte à son intégrité corporelle ou à sa santé sera, sur plainte, puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто умисно заподіяв іншій особі ушкодження тілесної цілісності чи здоров'я, карається за скаргою позбавленням волі до 3 років або грошовим покаранням. Факт відсутності таких ушкоджень у потерпілого доведено сертифікатом Unisanté P-03.",
    content_en: "Any person who intentionally harms the physical integrity or health of a person is liable on complaint to a custodial sentence up to 3 years.",
    relevance_case: {
      uk: "Виключається щодо Арсена Коваленка завдяки судово-медичному сертифікату Unisanté P-03 та макрознімку EXIF 1481 P-06-BIS.",
      fr: "Infraction formellement écartée à l'égard d'Arsen Kovalenko par le certificat médical Unisanté P-03.",
      en: "Charge excluded regarding Arsen Kovalenko via Unisanté clinical certificate P-03.",
    },
    corroborating_cotes: ["P-03", "P-06-BIS"],
    mempalace_node_id: "NORM-CP-123",
  },
  {
    id: "VAUD-LJPA",
    code: "LJPA",
    jurisdiction: "canton_vaud",
    article: "LJPA (BLV 173.36)",
    title: {
      uk: "Закон про адміністративну юрисдикцію кантону Во (Procédure administrative Vaud)",
      fr: "Loi sur la juridiction et la procédure administratives vaudoise (LJPA, BLV 173.36)",
      en: "Vaud Administrative Jurisdiction and Procedure Act (LJPA)",
    },
    category: "cantonal_vaud",
    content_fr: "La LJPA régit les recours administratifs contre les décisions prises par le Service de la population (SPOP) et garantit l'effet suspensif d'office ou sur requête pour la protection des droits des personnes titulaires du statut de protection S.",
    content_uk: "LJPA регулює порядок оскарження рішень міграційної служби SPOP кантону Во та гарантує захист прав осіб зі статусом тимчасового захисту S від протиправних рішень, ініційованих наклепницькими доносами.",
    content_en: "Governs administrative appeals against Vaud cantonal migration decisions (SPOP).",
    relevance_case: {
      uk: "Процедурний захист статусу захисту S Арсена Коваленка від маніпулятивних скарг обвинуваченої до SPOP.",
      fr: "Protection administrative directe du statut S de la victime contre les manœuvres au SPOP.",
      en: "Administrative protection mechanism against malicious SPOP actions.",
    },
    corroborating_cotes: ["P-08"],
    mempalace_node_id: "NORM-VAUD-LJPA",
  },
  {
    id: "ATF-144-IV-285",
    code: "ATF",
    jurisdiction: "federal",
    article: "ATF 144 IV 285",
    title: {
      uk: "Прецедент ATF 144 IV 285 · Кваліфікація шахрайського обману та розтрати",
      fr: "ATF 144 IV 285 · Distinction astuce de l'escroquerie et abus de confiance",
      en: "ATF 144 IV 285 · Fraud vs Embezzlement Delimitation",
    },
    category: "jurisprudence",
    content_fr: "Le Tribunal fédéral précise que la mise en scène astucieuse (édifice de mensonges conforté par des prétextes fiduciaires) combinée à la dissipation immédiate des fonds sans intention de restituer consomme l'infraction d'escroquerie (Art. 146 CP) en concours avec l'abus de confiance (Art. 138 CP).",
    content_uk: "Федеральний верховний суд роз'яснює, що побудова фальшивої картини довірчого зберігання коштів з негайним розпорядженням грошима утворює склад підступного шахрайства (ст. 146 КК) в ідеальній сукупності з привласненням довіреного майна (ст. 138 КК).",
    content_en: "Federal Supreme Court ruling that fraudulent fiduciary staging combined with asset conversion constitutes fraud (Art. 146 CP) alongside embezzlement (Art. 138 CP).",
    relevance_case: {
      uk: "Обґрунтовує ідеальну сукупність злочинів Любові Суворової щодо неповернення $15'000 USD (P-04, P-05).",
      fr: "Fonde le cumul d'infractions d'escroquerie et d'abus de confiance pour les $15'000 USD.",
      en: "Supports concurrent fraud and embezzlement charges for $15,000 USD.",
    },
    corroborating_cotes: ["P-04", "P-05", "P-14"],
    mempalace_node_id: "JURIS-ATF-144-IV-285",
    url_fedlex: "https://www.bger.ch/ext/eurospider/live/fr/php/clir/http/index.php?lang=fr&type=highlight_simple_query&page=1&from_date=&to_date=&from_year=1954&to_year=2024&sort=relevance&insertion_date=&from_date_push=&top_subindex=subindex_bge&query_words=144+IV+285",
  },
  {
    id: "CP-24",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 24 CP",
    title: {
      uk: "Підбурювання (Instigation)",
      fr: "Instigation (Art. 24 CP)",
      en: "Instigation (Art. 24 SCC)",
    },
    category: "penal",
    sanction: "Puni de la peine encourue par l'auteur de l'infraction",
    content_fr: "Quiconque aura intentionnellement décidé autrui à commettre un crime ou un délit encourra, si l'infraction a été commise, la peine applicable à l'auteur de cette infraction.",
    content_uk: "Хто умисно схилив іншу особу до вчинення злочину або проступку, якщо правопорушення було вчинено, підлягає покаранню, передбаченому для виконавця цього правопорушення.",
    content_en: "Any person who intentionally incites another to commit a crime or misdemeanor is liable, if the offense has been committed, to the penalty applicable to the perpetrator.",
    relevance_case: {
      uk: "Підбурювання Любов'ю Суворовою Олени Коваленко до насильницьких дій, пошкодження майна та наклепницьких заяв.",
      fr: "Instigation intentionnelle exercée par Liubov Suvorova sur Olena Kovalenko pour commettre des voies de fait et dénonciations.",
      en: "Intentional instigation by Liubov Suvorova of Olena Kovalenko.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-10"],
    mempalace_node_id: "NORM-CP-24",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr#art_24",
  },
  {
    id: "CP-25",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 25 CP",
    title: {
      uk: "Пособництво (Complicité)",
      fr: "Complicité (Art. 25 CP)",
      en: "Complicity / Aiding and Abetting (Art. 25 SCC)",
    },
    category: "penal",
    sanction: "Peine atténuée au sens de l'art. 48a CP",
    content_fr: "Quiconque aura intentionnellement prêté assistance pour commettre un crime ou un délit encourra une peine atténuée.",
    content_uk: "Хто умисно надав допомогу у вчиненні злочину або проступку, підлягає пом'якшеному покаранню (ст. 48a КК).",
    content_en: "Any person who intentionally assists in committing a felony or misdemeanor is liable to a mitigated sentence.",
    relevance_case: {
      uk: "Пособництво Ганни Суворової у вимаганні, приховуванні коштів $15'000 USD та психологічному тиску.",
      fr: "Complicité active d'Hanna Suvorova dans la rétention des fonds et la pression psychologique.",
      en: "Active complicity of Hanna Suvorova in funds retention and psychological pressure.",
    },
    corroborating_cotes: ["P-04", "P-05"],
    mempalace_node_id: "NORM-CP-25",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr#art_25",
  },
  {
    id: "CP-126",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 126 CP",
    title: {
      uk: "Побої та мордування (Voies de fait)",
      fr: "Voies de fait (Art. 126 CP)",
      en: "Assault / Physical Abuse (Art. 126 SCC)",
    },
    category: "penal",
    sanction: "Amende",
    content_fr: "Celui qui se sera livré sur une personne à des voies de fait qui n'ont causé ni lésion corporelle ni atteinte à la santé sera, sur plainte, puni d'une amende. L'action pénale se poursuit d'office si l'auteur s'en est pris à une personne vulnérable ou de manière réitérée dans le cadre familial.",
    content_uk: "Хто вчинив щодо особи насильницькі дії, які не спричинили ні тілесних ушкоджень, ні розладу здоров'я, карається за скаргою штрафом. Переслідування здійснюється ex officio, якщо дії вчинено щодо вразливої особи або повторно в сім'ї.",
    content_en: "Any person who commits an act of violence against a person that causes neither bodily injury nor damage to health is liable on complaint to a fine.",
    relevance_case: {
      uk: "Агресивні поштовхи, шарпання та психофізичний тиск 20.07.2024 (P-01, P-02).",
      fr: "Voies de fait réitérées et agressions physiques mineures commises au foyer familial.",
      en: "Reiterated physical altercations and domestic violence.",
    },
    corroborating_cotes: ["P-01", "P-02"],
    mempalace_node_id: "NORM-CP-126",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr#art_126",
  },
  {
    id: "CP-144",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 144 CP",
    title: {
      uk: "Умисне пошкодження майна (Dommages à la propriété)",
      fr: "Dommages à la propriété (Art. 144 CP)",
      en: "Damage to Property (Art. 144 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui aura endommagé, détruit ou mis hors d'usage une chose appartenant à autrui ou sur laquelle autrui a un droit d'usage ou d'usufruit sera, sur plainte, puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто пошкодив, знищив або привів у непридатність річ, що належить іншій особі, карається за скаргою позбавленням волі на строк до трьох років або грошовим покаранням.",
    content_en: "Any person who damages, destroys, or renders unusable property belonging to another is liable on complaint to a custodial sentence not exceeding three years.",
    relevance_case: {
      uk: "Умисне розбиття оптичних окулярів потерпілого, пошкодження замків та майна родини (P-09, P-10).",
      fr: "Destruction intentionnelle des lunettes de vue et détérioration des serrures.",
      en: "Intentional destruction of prescription eyeglasses and damage to locks.",
    },
    corroborating_cotes: ["P-09", "P-10"],
    mempalace_node_id: "NORM-CP-144",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr#art_144",
  },
  {
    id: "CP-157",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 157 CP",
    title: {
      uk: "Здирництво / Зловживання скрутним становищем (Usure)",
      fr: "Usure (Art. 157 CP)",
      en: "Usury / Exploitation of Distress (Art. 157 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de cinq ans au plus ou peine pécuniaire",
    content_fr: "Celui qui aura exploité la gêne, la dépendance, l'inexpérience ou la faiblesse de capacité de jugement d'une personne en se faisant accorder ou promettre pour lui-même ou pour un tiers, en échange d'une prestation, des avantages pécuniaires en disproportion évidente avec la valeur de cette prestation, sera puni d'une peine privative de liberté de cinq ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто зловжив скрутним становищем, залежністю, недосвідченістю чи обмеженою здатністю до судження особи, домігшись надання або обіцянки для себе чи третьої особи майнової вигоди в явній невідповідності з наданою послугою, карається позбавленням волі до 5 років або грошовим покаранням.",
    content_en: "Any person who exploits the distress, dependency, inexperience, or impaired judgment of a person to secure financial advantages manifestly disproportionate to the value of the consideration is liable to a custodial sentence up to five years.",
    relevance_case: {
      uk: "Експлуатація безпорадного стану біженців від війни для заволодіння заощадженнями $15'000 USD під виглядом «допомоги» (P-04, P-05, P-14).",
      fr: "Exploitation de la précarité et de la vulnérabilité de réfugiés de guerre pour capter $15'000 USD sous couvert d'assistance.",
      en: "Exploitation of war refugees' vulnerability to siphon $15,000 USD.",
    },
    corroborating_cotes: ["P-04", "P-05", "P-14"],
    mempalace_node_id: "NORM-CP-157",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr#art_157",
  },
  {
    id: "CP-304",
    code: "CP",
    jurisdiction: "federal",
    article: "Art. 304 CP",
    title: {
      uk: "Введення правосуддя в оману (Induction de la justice en erreur)",
      fr: "Induction de la justice en erreur (Art. 304 CP)",
      en: "Misleading the Administration of Justice (Art. 304 SCC)",
    },
    category: "penal",
    sanction: "Peine privative de liberté de trois ans au plus ou peine pécuniaire",
    content_fr: "Celui qui aura dénoncé mensongèrement à l'autorité une infraction qui n'a pas été commise, ou aura usé de stratagèmes pour faire croire qu'une infraction a été commise, sera puni d'une peine privative de liberté de trois ans au plus ou d'une peine pécuniaire.",
    content_uk: "Хто неправдиво повідомив органові влади про вчинення правопорушення, якого насправді не було, або вдався до хитрощів, щоб створити враження про вчинення правопорушення, карається позбавленням волі на строк до трьох років або грошовим покаранням.",
    content_en: "Any person who untruthfully reports to the authority an offense that was not committed, or uses stratagems to make it appear an offense was committed, is liable to custodial sentence up to three years.",
    relevance_case: {
      uk: "Інсценування нанесення тілесних ушкоджень Олені Коваленко та виклик поліції на сфабрикований інцидент (P-03, P-06, P-07).",
      fr: "Mise en scène fallacieuse de lésions imaginaires pour déclencher abusivement une enquête pénale.",
      en: "Staging of fabricated bodily injuries to trigger malicious prosecution.",
    },
    corroborating_cotes: ["P-03", "P-06", "P-07"],
    mempalace_node_id: "NORM-CP-304",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/54/757_781_799/fr#art_304",
  },
  {
    id: "CPP-122",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 122 CPP",
    title: {
      uk: "Цивільний позов у кримінальному провадженні (Conclusions civiles)",
      fr: "Conclusions civiles au pénal (Art. 122 CPP)",
      en: "Civil Claims in Criminal Proceedings (Art. 122 CPC)",
    },
    category: "procedure",
    sanction: "Jugement civil direct par le juge pénal (adhésion civile)",
    content_fr: "La personne lésée peut faire valoir des prétentions civiles déduites de l'infraction par voie d'adhésion à la procédure pénale. Les prétentions doivent être chiffrées et motivées au plus tard lors des débats.",
    content_uk: "Потерпіла особа має право заявити цивільні вимоги, що випливають із кримінального правопорушення, шляхом приєднання до кримінального провадження. Вимоги мають бути розраховані та обґрунтовані не пізніше судових дебатів.",
    content_en: "The harmed person may bring civil claims arising from the offense by joining the criminal proceedings.",
    relevance_case: {
      uk: "Заявлення солідарного стягнення $15'000 USD (CHF 13'850), моральної шкоди CHF 30'000 та витрат на захист CHF 3'000 (разом CHF 46'850).",
      fr: "Véhicule procédural pour obtenir la condamnation civile solidaire des prévenues à hauteur de CHF 46'850.-.",
      en: "Procedural vehicle for joint and several civil judgment of CHF 46,850.-.",
    },
    corroborating_cotes: ["P-04", "P-05"],
    mempalace_node_id: "NORM-CPP-122",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/2010/267/fr#art_122",
  },
  {
    id: "CPP-141",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 141 CPP",
    title: {
      uk: "Допустимість та недопустимість доказів (Exploitabilité des preuves)",
      fr: "Exploitabilité des moyens de preuve (Art. 141 CPP)",
      en: "Admissibility of Evidence (Art. 141 CPC)",
    },
    category: "procedure",
    sanction: "Nullité absolue (al. 1) vs exploitabilité sous pesée des intérêts (al. 2)",
    content_fr: "Les preuves administrées en violation de l'art. 140 ne sont en aucun cas exploitables. Les preuves qui ont été recueillies par des infractions ou au mépris de prescriptions de validité ne sont pas exploitables, à moins que leur administration ne soit indispensable pour élucider des infractions graves (al. 2).",
    content_uk: "Докази, зібрані з порушенням ст. 140, за жодних умов не підлягають використанню. Докази, здобуті з порушенням правил або шляхом правопорушення, не використовуються, хіба що їх дослідження є абсолютно необхідним для розкриття тяжких злочинів (ч. 2).",
    content_en: "Evidence obtained unlawfully is inadmissible unless its administration is indispensable for solving serious offenses (para. 2).",
    relevance_case: {
      uk: "Правове обґрунтування повної допустимості аудіозаписів погроз вбивством за стандартом ATF 147 IV 9 (P-01, P-02, P-14).",
      fr: "Norme clé régissant l'admissibilité des enregistrements audios de la défense.",
      en: "Core rule governing admissibility of audio recordings under interest-balancing test.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-14"],
    mempalace_node_id: "NORM-CPP-141",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/2010/267/fr#art_141",
  },
  {
    id: "CPP-324",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 324 CPP",
    title: {
      uk: "Направлення обвинувального акта до суду (Mise en accusation)",
      fr: "Mise en accusation (Art. 324 CPP)",
      en: "Indictment (Art. 324 CPC)",
    },
    category: "procedure",
    sanction: "Transmission du dossier au tribunal de jugement compétent",
    content_fr: "Si le ministère public estime que les soupçons sont suffisants pour justifier une mise en accusation, il transmet l'acte d'accusation ainsi que le dossier de la cause au tribunal de première instance compétent.",
    content_uk: "Якщо прокуратура вважає, що підозри є достатніми для висунення обвинувачення, вона направляє обвинувальний акт разом із матеріалами справи до компетентного суду першої інстанції.",
    content_en: "If the public prosecutor considers that suspicions are sufficient to justify an indictment, it transmits the indictment and case files to the competent court of first instance.",
    relevance_case: {
      uk: "Кінцева мета провадження: передача Любові та Ганни Суворових під суд Окружного суду Лозанни за ст. 146, 180, 181, 303 КК.",
      fr: "Objectif procédural de renvoi des prévenues devant le Tribunal de police ou correctionnel de Lausanne.",
      en: "Procedural goal of indicting the defendants before Lausanne District Court.",
    },
    corroborating_cotes: ["P-05", "P-10", "P-12"],
    mempalace_node_id: "NORM-CPP-324",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/2010/267/fr#art_324",
  },
  {
    id: "CPP-393",
    code: "CPP",
    jurisdiction: "federal",
    article: "Art. 393 CPP",
    title: {
      uk: "Оскарження до Слідчої палати кантонального суду (Recours CREP)",
      fr: "Recours devant la Chambre des recours pénale (Art. 393 CPP)",
      en: "Appeal to Criminal Appeals Chamber (Art. 393 CPC)",
    },
    category: "procedure",
    sanction: "Délai péremptoire de 10 jours sous peine de forclusion",
    content_fr: "Le recours est recevable contre les décisions et les ordonnances non sujettes à appel rendues par la police, le ministère public et les tribunaux de première instance, ainsi que contre les actes de procédure du ministère public. Le délai est de 10 jours.",
    content_uk: "Скарга допускається проти рішень і постанов, які не підлягають апеляційному оскарженню, ухвалених поліцією, прокуратурою та судами першої інстанції, а також проти процесуальних дій прокуратури. Строк — 10 днів.",
    content_en: "An appeal is admissible against decisions and orders of police, prosecution, and courts of first instance. Deadline is 10 days.",
    relevance_case: {
      uk: "Захист прав потерпілих від бездіяльності прокурора або спроб закрити провадження без дослідження всіх 61 запису (10-денний строк оскарження до CREP).",
      fr: "Voie de recours impérative en 10 jours devant le Tribunal cantonal vaudois.",
      en: "Mandatory 10-day appeal remedy before Vaud Cantonal Court against prosecutorial inaction.",
    },
    corroborating_cotes: ["P-12"],
    mempalace_node_id: "NORM-CPP-393",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/2010/267/fr#art_393",
  },
  {
    id: "CO-41",
    code: "CO",
    jurisdiction: "federal",
    article: "Art. 41 CO",
    title: {
      uk: "Загальні підстави деліктної відповідальності (Responsabilité délictuelle)",
      fr: "Responsabilité délictuelle générale (Art. 41 CO)",
      en: "Tort Liability / General Principle (Art. 41 CO)",
    },
    category: "obligations",
    sanction: "Condamnation à la réparation intégrale du dommage causé",
    content_fr: "Celui qui cause, d'une manière illicite, un dommage à autrui, soit intentionnellement, soit par négligence ou imprudence, est tenu de le réparer.",
    content_uk: "Хто протиправно завдав шкоди іншому умисно, через необережність чи недбалість, зобов'язаний її відшкодувати в повному обсязі.",
    content_en: "Any person who unlawfully causes damage to another, whether intentionally or by negligence, is obliged to make compensation.",
    relevance_case: {
      uk: "Правова підстава для стягнення CHF 13'850 ($15'000 USD) прямого майнового збитку з Любові та Ганни Суворових.",
      fr: "Fondement de l'obligation de réparation intégrale du préjudice financier de 15'000 USD.",
      en: "Legal ground for full indemnification of $15,000 USD direct financial injury.",
    },
    corroborating_cotes: ["P-04", "P-05"],
    mempalace_node_id: "NORM-CO-41",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr#art_41",
  },
  {
    id: "CO-47",
    code: "CO",
    jurisdiction: "federal",
    article: "Art. 47 CO",
    title: {
      uk: "Відшкодування моральної шкоди при тілесних ушкодженнях (Tort moral en cas de lésions)",
      fr: "Tort moral en cas de lésions corporelles (Art. 47 CO)",
      en: "Moral Damage in Bodily Injury (Art. 47 CO)",
    },
    category: "obligations",
    sanction: "Allocation d'une indemnité pécuniaire à titre de réparation morale",
    content_fr: "Le juge peut, en tenant compte de circonstances particulières, allouer à la victime de lésions corporelles une indemnité équitable à titre de réparation morale.",
    content_uk: "Суд може, враховуючи особливі обставини, присудити потерпілому, який зазнав тілесних ушкоджень або посягань на здоров'я, справедливу грошову компенсацію як моральну сатисфакцію.",
    content_en: "The judge may, taking into account special circumstances, award the victim of bodily injury an equitable sum as moral compensation.",
    relevance_case: {
      uk: "Стягнення моральної шкоди CHF 20'000 для Арсена Коваленка та CHF 10'000 для Володимира Коваленка через загрози життю та психологічні травми.",
      fr: "Fonde les montants de tort moral de CHF 20'000 pour Arsen et CHF 10'000 pour Volodymyr.",
      en: "Grounds moral damages claims of CHF 20,000 for Arsen and CHF 10,000 for Volodymyr.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-08"],
    mempalace_node_id: "NORM-CO-47",
    url_fedlex: "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/fr#art_47",
  },
  {
    id: "VAUD-LVCPP",
    code: "LVCPP",
    jurisdiction: "canton_vaud",
    article: "LVCPP (BLV 312.01)",
    title: {
      uk: "Закон про застосування КПК у кантоні Во (Loi vaudoise d'application du CPP)",
      fr: "Loi d'application du Code de procédure pénale suisse (LVCPP, BLV 312.01)",
      en: "Vaud Application Act for Swiss CPC (LVCPP)",
    },
    category: "cantonal_vaud",
    content_fr: "La LVCPP détermine les attributions des autorités de poursuite pénale du canton de Vaud. Les art. 13 et 16 désignent la Chambre des recours pénale du Tribunal cantonal comme autorité supérieure de recours pour le contrôle des ordonnances et de l'avancement de l'instruction.",
    content_uk: "LVCPP визначає повноваження органів кримінального переслідування кантону Во. Статті 13 та 16 закріплюють за Палатою кримінальних апеляцій Кантонального суду (CREP) виключний нагляд за дотриманням строків слідства та законністю постанов прокуратури.",
    content_en: "Governs criminal authorities in Vaud; arts. 13 & 16 designate the Criminal Appeals Chamber as supervisory body.",
    relevance_case: {
      uk: "Встановлює юрисдикцію кантональних органів Во та правове поле для скарг на прокурора у разі зволікання чи ухилення від розслідування шахрайства.",
      fr: "Fondement de l'intervention de l'autorité de recours cantonale en cas de retard injustifié.",
      en: "Cantonal basis for petitioning supervisory review in case of undue delays.",
    },
    corroborating_cotes: ["P-12"],
    mempalace_node_id: "NORM-VAUD-LVCPP",
    url_fedlex: "https://prestations.vd.ch/actes/blv/312.01",
  },
  {
    id: "ATF-147-IV-9",
    code: "ATF",
    jurisdiction: "federal",
    article: "ATF 147 IV 9",
    title: {
      uk: "Прецедент ATF 147 IV 9 · Зважування інтересів при таємних записах злочину in statu nascendi",
      fr: "ATF 147 IV 9 · Pesée des intérêts et légitime défense probatoire",
      en: "ATF 147 IV 9 · Proportionality & Probatory Self-Defense in Covert Recordings",
    },
    category: "jurisprudence",
    content_fr: "Le Tribunal fédéral confirme qu'un enregistrement clandestin réalisé par la victime d'infractions graves (notamment menaces de mort et contraintes) est exploitable au sens de l'art. 141 al. 2 CPP lorsque la victime se trouve en situation de détresse probatoire et que la préservation de son intégrité physique l'emporte manifestement sur le secret des paroles de l'auteur captées in statu nascendi.",
    content_uk: "Федеральний верховний суд підтвердив, що таємний запис, зроблений потерпілим від тяжких злочинів (погрози вбивством, примус), підлягає використанню за ст. 141 al. 2 КПК, якщо потерпілий перебуває в стані доказової скрути (légitime défense probatoire), а захист його фізичної цілісності явно переважає приватність слів порушника, зафіксованих безпосередньо під час скоєння злочину.",
    content_en: "Federal Supreme Court confirms covert recordings by victims of serious offenses are admissible under Art. 141(2) CPC where victim is in probatory distress.",
    relevance_case: {
      uk: "Вирішальний прецедент, що забезпечує 100% процесуальний захист та використання всіх 61 записів без ризику виключення з матеріалів справи.",
      fr: "Arrêt de principe garantissant l'exploitabilité absolue des 61 fichiers audio au procès.",
      en: "Decisive precedent securing total admissibility of all 61 audio files.",
    },
    corroborating_cotes: ["P-01", "P-02", "P-04", "P-14"],
    mempalace_node_id: "JURIS-ATF-147-IV-9",
    url_fedlex: "https://www.bger.ch/ext/eurospider/live/fr/php/clir/http/index.php?lang=fr&type=highlight_simple_query&page=1&from_date=&to_date=&from_year=1954&to_year=2024&sort=relevance&insertion_date=&from_date_push=&top_subindex=subindex_bge&query_words=147+IV+9",
  },
];

// -------------------------------------------------------------------------
// STORAGE & CORPUS MANAGEMENT HELPERS
// -------------------------------------------------------------------------

const STORAGE_CUSTOM_ARTICLES_KEY = "bsdd_custom_law_articles";
const STORAGE_ENABLED_ARTICLES_KEY = "bsdd_enabled_law_articles";

/**
 * Loads all law articles (default base + custom user additions).
 */
export function getAllLawArticles(): LawArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_ARTICLES_KEY);
    if (!raw) return SWISS_LAW_ARTICLES;
    const custom: LawArticle[] = JSON.parse(raw);
    const customIds = new Set(custom.map((c) => c.id));
    const merged = [...SWISS_LAW_ARTICLES.filter((a) => !customIds.has(a.id)), ...custom];
    return merged;
  } catch {
    return SWISS_LAW_ARTICLES;
  }
}

/**
 * Returns set of active article IDs (default: all active).
 */
export function getEnabledLawArticleIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_ENABLED_ARTICLES_KEY);
    if (!raw) {
      return getAllLawArticles().map((a) => a.id);
    }
    return JSON.parse(raw);
  } catch {
    return getAllLawArticles().map((a) => a.id);
  }
}

/**
 * Saves active article IDs.
 */
export function saveEnabledLawArticleIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_ENABLED_ARTICLES_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Failed to save enabled law article IDs:", e);
  }
}

/**
 * Adds or updates a law article in the custom store.
 */
export function saveLawArticle(article: LawArticle): void {
  try {
    const current = getAllLawArticles();
    const filtered = current.filter((a) => a.id !== article.id);
    const updated = [article, ...filtered];
    localStorage.setItem(STORAGE_CUSTOM_ARTICLES_KEY, JSON.stringify(updated));

    // Also ensure it is enabled by default
    const enabled = getEnabledLawArticleIds();
    if (!enabled.includes(article.id)) {
      saveEnabledLawArticleIds([...enabled, article.id]);
    }
  } catch (e) {
    console.error("Failed to save law article:", e);
  }
}

/**
 * Exports entire corpus as formatted JSON string.
 */
export function exportCorpusAsJson(): string {
  const articles = getAllLawArticles();
  const enabledIds = getEnabledLawArticleIds();
  const exportPayload = {
    metadata: {
      corpus: "MemPalace Swiss & Cantonal Vaud Legal Corpus",
      exported_at: new Date().toISOString(),
      total_articles: articles.length,
      active_count: enabledIds.length,
      schema_version: "2.5.0",
    },
    enabled_ids: enabledIds,
    articles: articles,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Imports law corpus from JSON string.
 */
export function importCorpusFromJson(jsonStr: string): { importedCount: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    let articlesToImport: LawArticle[] = [];
    if (Array.isArray(parsed)) {
      articlesToImport = parsed;
    } else if (parsed && Array.isArray(parsed.articles)) {
      articlesToImport = parsed.articles;
      if (Array.isArray(parsed.enabled_ids)) {
        saveEnabledLawArticleIds(parsed.enabled_ids);
      }
    } else {
      return { importedCount: 0, error: "Некоректний формат JSON. Очікується масив статей або об'єкт із полем 'articles'." };
    }

    if (articlesToImport.length === 0) {
      return { importedCount: 0, error: "Файл не містить жодної статті." };
    }

    // Merge into local storage
    const existing = getAllLawArticles();
    const existingIds = new Set(existing.map((a) => a.id));
    const merged = [...existing];

    let count = 0;
    articlesToImport.forEach((art) => {
      if (art.id && art.article) {
        if (existingIds.has(art.id)) {
          const idx = merged.findIndex((m) => m.id === art.id);
          if (idx !== -1) merged[idx] = art;
        } else {
          merged.push(art);
        }
        count++;
      }
    });

    localStorage.setItem(STORAGE_CUSTOM_ARTICLES_KEY, JSON.stringify(merged));
    return { importedCount: count };
  } catch (err: any) {
    return { importedCount: 0, error: err?.message || "Помилка парсингу JSON" };
  }
}

