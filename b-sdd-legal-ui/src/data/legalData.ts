// =========================================================================
// B-SDD LEGAL COCKPIT · ТРИМОВНІ ЮРИДИЧНІ ДАНІ ТА ДОКАЗОВА БАЗА
// Основна мова: Українська (UA) · Судова мова: Français (FR) · English (EN)
// Ministère public du canton de Vaud · Dossier Réf: CASE-SAMPLE-2026-CH
// =========================================================================

import { SupportedLanguage } from '../types/i18n';

export type LocalizedString = Record<SupportedLanguage, string> | string;

export function resolveLocalized(val: LocalizedString | undefined, lang: SupportedLanguage): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val['uk'] || val['fr'] || val['en'] || '';
}

export function resolveLocalizedArray(val: Record<SupportedLanguage, string[]> | string[] | undefined, lang: SupportedLanguage): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val[lang] || val['uk'] || val['fr'] || val['en'] || [];
}

export interface Citation {
  evidence_id: string;
  cote: string;
  title: string;
  timecode: string;
  sha256: string;
  quote: LocalizedString;
  admissibility: LocalizedString;
}

export interface StatutoryElement {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  status: "corroborated" | "pending" | "contradicted";
  citations: Citation[];
}

export interface CriminalCharge {
  id: string;
  code: string;
  title: LocalizedString;
  accused: string;
  accused_id: string;
  victim: LocalizedString;
  status: "corroborated" | "pending" | "contradicted";
  elements: StatutoryElement[];
  atf_ruling: LocalizedString;
  conclusions_penales: LocalizedString;
  conclusions_civiles: LocalizedString;
}

export interface BordereauPiece {
  cote: string;
  date_faits: string; // Valid Time
  date_versement: string; // Transaction Time
  titre: LocalizedString;
  categorie: "Audio" | "Photo EXIF" | "Médical" | "Bancaire" | "Message" | "Procédure";
  sha256: string;
  admissibilite: LocalizedString;
  portee_probatoire: LocalizedString;
  citation_cle: LocalizedString;
  fichier_local: string;
}

export interface ConfrontationItem {
  id: string;
  theme: LocalizedString;
  allegation_suspecte: {
    texte: LocalizedString;
    source: LocalizedString;
    date_allegation: string;
    incoherence: LocalizedString;
  };
  preuve_objective: {
    cote: string;
    titre: LocalizedString;
    date_reelle: string;
    sha256: string;
    verbatim: LocalizedString;
  };
  questions_interrogatoire: Record<SupportedLanguage, string[]>;
  piege_tactique_defense: LocalizedString;
}

export interface LegalRequisition {
  id: string;
  type: LocalizedString;
  base_legale: string;
  titre: LocalizedString;
  destinataire: LocalizedString;
  conclusions: Record<SupportedLanguage, string[]>;
  texte_integral: LocalizedString;
}

export interface ActorItem {
  id: string;
  name: string;
  status: LocalizedString;
  badgeColor: string;
  role: LocalizedString;
  protected_bona_fide: boolean;
  legal_reference: string;
  droits_proceduraux: Record<SupportedLanguage, string[]>;
}

// -------------------------------------------------------------------------
// 1. CHEFS D'ACCUSATION (CP & LEI) - ТРИМОВНІ СКЛАДИ ЗЛОЧИНІВ
// -------------------------------------------------------------------------
export const CHARGES: CriminalCharge[] = [
  {
    id: "CHG-180",
    code: "Art. 180 al. 2 CP",
    title: {
      uk: "Тяжкі кваліфіковані погрози вбивством дитині",
      fr: "Menaces graves qualifiées contre enfant mineur",
      en: "Aggravated Death Threats Against Minor Child",
    },
    accused: "Laurent VOGEL",
    accused_id: "ACT-ACCUSED-PRINCIPAL",
    victim: {
      uk: "Александр ДЮБУА (Неповнолітній 2012 р.н.)",
      fr: "Alexandre DUBOIS (Mineur né en 2012)",
      en: "Alexandre DUBOIS (Minor born in 2012)",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "ATF 146 IV 9 ч. 2 (Найвищий інтерес захисту дитини виправдовує таємний аудіозапис)",
      fr: "ATF 146 IV 9 al. 2 (Intérêt supérieur de la protection d'un mineur justifiant l'enregistrement clandestin)",
      en: "ATF 146 IV 9 para 2 (Superior interest in child protection justifies clandestine audio recording)",
    },
    conclusions_penales: {
      uk: "Засудження за тяжкі погрози проти малолітнього (позбавлення волі до 3 років) з обтяжуючими обставинами крайньої вразливості потерпілої дитини.",
      fr: "Condamnation pour menaces graves qualifiées (peine privative de liberté jusqu'à 3 ans) avec circonstances aggravantes tenant à la vulnérabilité de la victime enfant.",
      en: "Conviction for aggravated threats against a minor (imprisonment up to 3 years) with aggravating circumstances due to the child's vulnerability.",
    },
    conclusions_civiles: {
      uk: "Присудження компенсації за моральну шкоду (ст. 49 ЗК) у розмірі CHF 10'000.- на користь неповнолітнього Александра Дюбуа з відсотками 5% від 20 липня 2024 року.",
      fr: "Allocation d'une indemnité pour tort moral (Art. 49 CO) de CHF 10'000.- en faveur du mineur Alexandre Dubois, avec intérêts à 5% dès le 20 juillet 2024.",
      en: "Award of moral damages (Art. 49 CO) of CHF 10,000.- for the minor Alexandre Dubois, with 5% interest from July 20, 2024.",
    },
    elements: [
      {
        id: "ELEM-180-1",
        title: {
          uk: "Реальна загроза вбивством та тяжким тілесним ушкодженням",
          fr: "Menace grave d'homicide et d'atteinte physique caractérisée",
          en: "Grave Threat of Homicide and Bodily Injury",
        },
        description: {
          uk: "Формальні та неодноразові погрози вбивством, утопленням у воді та побиттям дитини Александра.",
          fr: "Menaces formelles et réitérées de mort, d'immersion fatale (noyade) et d'agressions corporelles contre l'enfant Alexandre.",
          en: "Explicit, reiterated threats of homicide, drowning, and severe physical violence against the child Alexandre.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-32",
            cote: "P-01",
            title: "sample_audio_01_verbal_threats.mp3",
            timecode: "02:15 - 03:40",
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            quote: {
              uk: "« Зафіксовано прямі вербальні погрози насильством та залякування... »",
              fr: "« Claire vient pour tuer Alexandre, lui casser les dents, le noyer dans l'eau... »",
              en: "« Claire is coming to kill Alexandre, knock out his teeth, drown him in water... »",
            },
            admissibility: {
              uk: "Повністю допустимий за ATF 146 IV 9 (тяжкий злочин проти дитини)",
              fr: "Exploitable selon ATF 146 IV 9 (infraction grave contre enfant)",
              en: "Fully admissible under ATF 146 IV 9 (serious offense against child)",
            },
          },
          {
            evidence_id: "EV-AUDIO-38",
            cote: "P-02",
            title: "sample_audio_02_coercion.mp3",
            timecode: "00:45 - 01:20",
            sha256: "f5a79854e3fa338a0a80e06001099684348680d21057e95fcfef0f8457018c15",
            quote: {
              uk: "« Зафіксовано погрози фізичною розправою та психологічний тиск... »",
              fr: "« Et ton fils, et toi je vous abattrai, il ne m'arrivera rien, ici la police suisse ne fera rien... »",
              en: "« Both your son and you I will slaughter, nothing will happen to me, Swiss police won't do anything... »",
            },
            admissibility: {
              uk: "Повністю допустимий за ATF 146 IV 9",
              fr: "Exploitable selon ATF 146 IV 9",
              en: "Fully admissible under ATF 146 IV 9",
            },
          },
        ],
      },
      {
        id: "ELEM-180-2",
        title: {
          uk: "Стан панічного жаху та медично зафіксований посттравматичний синдром",
          fr: "État de terreur et détresse psychologique induite",
          en: "Terrorized Psychological Distress Induced",
        },
        description: {
          uk: "Дитину введено у стан гострого психологічного зриву, що підтверджено ургентним медичним висновком Centre Hospitalier.",
          fr: "L'enfant a été placé dans un état de panique sévère attesté par le rapport médical d'urgence d'Centre Hospitalier.",
          en: "The child was plunged into acute psychological distress certified by Centre Hospitalier emergency medical finding.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-DOC-UNISANTE",
            cote: "P-03",
            title: "Centre Hospitalier Consultation FOR597",
            timecode: "Section Diagnostic / Anamnèse",
            sha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
            quote: {
              uk: "« Гострий посттравматичний стресовий розлад внаслідок вербального насильства та погроз у сімейному колі. »",
              fr: "« État de stress post-traumatique aigu consécutif aux violences verbales et menaces du milieu familial. »",
              en: "« Acute post-traumatic stress disorder resulting from verbal violence and threats in the domestic environment. »",
            },
            admissibility: {
              uk: "Офіційний публічний документ (ст. 139 ч. 1 КПК)",
              fr: "Pièce publique officielle (Art. 139 al. 1 CPP)",
              en: "Official public document (Art. 139 para 1 CPC)",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-138-146",
    code: "Art. 138 / 146 CP",
    title: {
      uk: "Зловживання довірою та шахрайство ($15'000 USD)",
      fr: "Abus de confiance & Escroquerie ($15'000 USD)",
      en: "Breach of Trust & Fraud ($15,000 USD)",
    },
    accused: "Laurent VOGEL",
    accused_id: "ACT-ACCUSED-PRINCIPAL",
    victim: {
      uk: "Марк МОРО (Цивільний позивач)",
      fr: "Marc MOREAU (Demandeur civil)",
      en: "Marc MOREAU (Civil Claimant)",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "Ст. 122 КПК (Цивільний позов у кримінальному процесі щодо повної реституції та ст. 41 ЗК)",
      fr: "Art. 122 CPP (Action civile jointe au pénal pour restitution intégrale et réparation Art. 41 CO)",
      en: "Art. 122 CPC (Civil action joined to criminal procedure for full restitution and Art. 41 CO damages)",
    },
    conclusions_penales: {
      uk: "Засудження за зловживання довірою та професійне шахрайство (позбавлення волі до 5 років).",
      fr: "Condamnation pour abus de confiance et escroquerie par métier (peine privative de liberté jusqu'à 5 ans).",
      en: "Conviction for breach of trust and commercial fraud (imprisonment up to 5 years).",
    },
    conclusions_civiles: {
      uk: "Зобов'язати Лорана Фогеля повністю повернути суму $15'000 USD (еквівалент CHF 13'650.-) з відсотками 5% від 2 квітня 2024 року.",
      fr: "Condamnation de Laurent Vogel à rembourser intégralement la somme de $15'000 USD (contre-valeur CHF 13'650.-) avec intérêts à 5% dès le 2 avril 2024.",
      en: "Order Laurent Vogel to fully reimburse $15,000 USD (countervalue CHF 13,650.-) with 5% interest from April 2, 2024.",
    },
    elements: [
      {
        id: "ELEM-138-1",
        title: {
          uk: "Неправомірне привласнення довірених майнових цінностей",
          fr: "Appropriation illégitime de valeurs patrimoniales confiées",
          en: "Unlawful Appropriation of Entrusted Assets",
        },
        description: {
          uk: "Умисне заволодіння сумою $15'000 USD, переданою виключно на облаштування родини у Швейцарії.",
          fr: "Détournement dolosif de la somme de $15'000 USD remise pour l'établissement de la famille en Suisse.",
          en: "Fraudulent misappropriation of $15,000 USD entrusted solely for family relocation in Switzerland.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-35",
            cote: "P-04",
            title: "sample_audio_03_financial_dispute.mp3",
            timecode: "05:12 - 06:05",
            sha256: "d41d8cd98f00b204e9800998ecf8427e02d8471b0593444458533159784b067a",
            quote: {
              uk: "« Гроші вже переписані, ти їх більше ніколи не побачиш, ми їх вклали як треба... »",
              fr: "« L'argent est déjà réécrit, tu ne le reverras plus jamais, nous l'avons placé comme il faut... »",
              en: "« The money is already rewritten, you will never see it again, we invested it properly... »",
            },
            admissibility: {
              uk: "Пряме позасудове зізнання (ст. 139 ч. 1 КПК)",
              fr: "Exploitable comme aveu extrajudiciaire (Art. 139 al. 1 CPP)",
              en: "Admissible as extrajudicial admission (Art. 139 para 1 CPC)",
            },
          },
          {
            evidence_id: "EV-BANK-CREDIT-AGRICOLE",
            cote: "P-05",
            title: "Bordereaux bancaires certifiés Wise & Crédit Agricole",
            timecode: "Opérations du 02.04.2024",
            sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            quote: {
              uk: "Сертифіковані банківські виписки про виведення коштів на вказаний обвинуваченою рахунок.",
              fr: "Virements cumulés de $15'000 USD exécutés vers le compte désigné par la prévenue.",
              en: "Certified bank wires of $15,000 USD executed to the account designated by the accused.",
            },
            admissibility: {
              uk: "Прямий письмовий доказ (ст. 139 ч. 1 КПК)",
              fr: "Preuve documentaire directe (Art. 139 al. 1 CPP)",
              en: "Direct documentary evidence (Art. 139 para 1 CPC)",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-303-304",
    code: "Art. 303 / 304 CP",
    title: {
      uk: "Завідомо неправдивий донос та введення правосуддя в оману",
      fr: "Dénonciation calomnieuse & Induction de la justice en erreur",
      en: "False Accusation & Misleading the Judiciary",
    },
    accused: "Sophie MOREAU (Під психологічним контролем Л. Фогеля)",
    accused_id: "ACT-AUTEUR-UNDER-INFLUENCE",
    victim: {
      uk: "Александр ДЮБУА (Безпідставно звинувачений у побоях)",
      fr: "Alexandre DUBOIS (Faussement accusé de coups)",
      en: "Alexandre DUBOIS (Falsely accused of battery)",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "Беззаперечне спростування бітемпоральним зіставленням об'єктивних метаданих EXIF та аудіозізнання",
      fr: "Réfutation péremptoire par confrontation bitemporelle d'éléments objectifs EXIF et aveu verbatim",
      en: "Absolute refutation via bitemporal reconciliation of objective EXIF metadata and verbatim audio confession",
    },
    conclusions_penales: {
      uk: "Констатація завідомо неправдивого доносу з призначенням судової психіатричної експертизи Софі Моро (ст. 182 КПК) щодо психологічного тиску.",
      fr: "Constat formel de dénonciation calomnieuse, avec renvoi de Sophie Moreau à expertise psychiatrique judiciaire (Art. 182 CPP) sous l'angle de la contrainte morale.",
      en: "Formal finding of malicious accusation, remanding Sophie Moreau for forensic psychiatric evaluation (Art. 182 CPC) regarding psychological coercion.",
    },
    conclusions_civiles: {
      uk: "Повне анулювання будь-яких неправдивих записів проти неповнолітнього Александра Дюбуа в поліцейських реєстрах.",
      fr: "Radiation formelle de toute mention infamante ou accusation portée contre le mineur Alexandre Dubois au registre des poursuites ou des fiches de police.",
      en: "Formal expungement of any derogatory record or accusation against the minor Alexandre Dubois in police files.",
    },
    elements: [
      {
        id: "ELEM-303-1",
        title: {
          uk: "Об'єктивна неправдивість заявленого злочину",
          fr: "Fausseté objective de l'infraction dénoncée",
          en: "Objective Falsity of Denounced Crime",
        },
        description: {
          uk: "Заява до поліції 22.07.2024 про нібито побиття сином 20.07.2024 о 18:00 з глибокими гематомами.",
          fr: "Déposition à la police prétendant avoir subi des coups et hématomes infligés par son fils le 20.07.2024 à 18h.",
          en: "Police deposition claiming severe bruises inflicted by her minor son on 20.07.2024 at 18:00.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-PHOTO-1481",
            cote: "P-06",
            title: "EXIF Photo 1481 (Supermarché Lausanne)",
            timecode: "21.07.2024 11:45:12 CEST",
            sha256: "1481a54728fbe5d8995a9d6854e4c3a216bfa58896587c6b5b5c928424268e31",
            quote: {
              uk: "Високоточний знімок підтверджує абсолютну цілісність передпліч через 17 год після вигаданих ударів.",
              fr: "Cliché haute définition prouvant l'intégrité absolue des avant-bras 17h après les prétendus coups.",
              en: "High-definition photo proving complete absence of any injury 17 hours after alleged assault.",
            },
            admissibility: {
              uk: "Науково сертифікований доказ (ISO 27037 / ст. 139 КПК)",
              fr: "Preuve scientifique irréfutable (Art. 139 CPP / ISO 27037)",
              en: "Scientifically certified digital evidence (ISO 27037 / Art. 139 CPC)",
            },
          },
        ],
      },
      {
        id: "ELEM-303-2",
        title: {
          uk: "Доказ умислу Mens Rea (Самопошкодження та інсценування)",
          fr: "Preuve du Mens Rea (Machination et auto-mutilation)",
          en: "Proof of Mens Rea (Staging and Self-Infliction)",
        },
        description: {
          uk: "Пряме зізнання в самостійному роздиранні шкіри нігтями та терті об килим для фальсифікації синців.",
          fr: "Aveu formel d'avoir frotté ses coudes et utilisé ses ongles pour fabriquer artificiellement des ecchymoses.",
          en: "Explicit confession of scratching elbows with fingernails and carpet friction to fake bruises.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-12",
            cote: "P-07",
            title: "Audio 12 (Enregistrement téléphonique verbatim)",
            timecode: "21.07.2024 14:10:00 CEST",
            sha256: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            quote: {
              uk: "« Я сама собі нігтями роздерла, терла лікті об килим, щоб лікар зафіксував синяки проти Александра... »",
              fr: "« Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis pour que le docteur constate des bleus contre Alexandre... »",
              en: "« I scratched myself with my nails, rubbed my elbows on the carpet so the doctor would log bruises against Alexandre... »",
            },
            admissibility: {
              uk: "Вирішальний доказ прямого умислу (ст. 303 ч. 1 КК)",
              fr: "Preuve décisive de l'intention dolosive (Art. 303 al. 1 CP)",
              en: "Decisive proof of dolus directus (Art. 303 para 1 CP)",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-181",
    code: "Art. 181 CP",
    title: {
      uk: "Примус та систематичний моральний шантаж",
      fr: "Contrainte et chantage moral répété",
      en: "Coercion & Systemic Moral Extortion",
    },
    accused: "Laurent VOGEL",
    accused_id: "ACT-ACCUSED-PRINCIPAL",
    victim: {
      uk: "Марк МОРО та Александр ДЮБУА",
      fr: "Marc MOREAU & Alexandre DUBOIS",
      en: "Marc MOREAU & Alexandre DUBOIS",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "ATF 141 IV 1 (Поріг тяжкості примусу через загрозу настання суттєвої шкоди)",
      fr: "ATF 141 IV 1 (Seuil de gravité de la contrainte par menace d'un dommage grave)",
      en: "ATF 141 IV 1 (Threshold of coercion gravity via threat of serious harm)",
    },
    conclusions_penales: {
      uk: "Засудження за систематичний примус проти потерпілого та його дитини.",
      fr: "Condamnation pour contrainte réitérée au préjudice de la partie plaignante et de son enfant mineur.",
      en: "Conviction for reiterated coercion against the private claimant and his minor child.",
    },
    conclusions_civiles: {
      uk: "Компенсація за обмеження свободи волевиявлення та психологічний тиск.",
      fr: "Indemnisation pour entrave à la liberté d'action et préjudice psychologique continu.",
      en: "Compensation for restriction of freedom of action and continuous emotional distress.",
    },
    elements: [
      {
        id: "ELEM-181-1",
        title: {
          uk: "Шантаж депортацією та скасуванням статусу S",
          fr: "Entrave illicite à la liberté d'action sous menace de ruine et dénonciation",
          en: "Illicit Restriction under Threat of Deportation and S-Status Revocation",
        },
        description: {
          uk: "Погроза задіяти зв'язки для виселення зі Швейцарії, якщо батько вимагатиме повернення коштів.",
          fr: "Menace d'activation de réseaux hostiles et d'expulsion de Suisse si l'argent n'était pas abandonné.",
          en: "Threat to trigger deportation from Switzerland if the father refused to surrender the money.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-24",
            cote: "P-08",
            title: "enhanced_audio-lena01-шантаж-депортацією.mp3",
            timecode: "01:10 - 02:30",
            sha256: "6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d",
            quote: {
              uk: "« Якщо тільки писнеш поліції, я зроблю так, що вас позбавлять статусу S і вишлють... »",
              fr: "« Si seulement tu oses aller à la police, je ferai en sorte qu'on vous retire le statut S et qu'on vous expulse... »",
              en: "« If you dare squeak to the police, I'll make sure they strip your S-status and deport you... »",
            },
            admissibility: {
              uk: "Допустимо за ATF 146 IV 9",
              fr: "Exploitable selon ATF 146 IV 9",
              en: "Admissible under ATF 146 IV 9",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-186",
    code: "Art. 186 CP",
    title: {
      uk: "Порушення недоторканності житла та переслідування",
      fr: "Violation de domicile & Harcèlement de logement",
      en: "Trespassing & Home Harassment",
    },
    accused: "Laurent VOGEL & Claire VOGEL",
    accused_id: "ACT-ACCUSED-GROUP",
    victim: {
      uk: "Марк МОРО",
      fr: "Marc MOREAU",
      en: "Marc MOREAU",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "Ст. 186 КК (Захист спокою житла від протиправних вторгнень)",
      fr: "Art. 186 CP (Protection de la paix du domicile contre intrusions sans droit)",
      en: "Art. 186 CP (Protection of domestic peace against unlawful entries)",
    },
    conclusions_penales: {
      uk: "Солідарне засудження за порушення недоторканності житла та блокування виходу.",
      fr: "Condamnation solidaire pour violation de domicile et harcèlement obsessionnel.",
      en: "Joint conviction for domestic trespassing and harassment.",
    },
    conclusions_civiles: {
      uk: "Заборона наближення на 500 метрів до житла та школи Александра (ст. 67b КК).",
      fr: "Interdiction de périmètre de 500m autour du domicile et de l'école d'Alexandre Dubois (Art. 67b CP).",
      en: "Exclusion perimeter of 500 meters around residence and child's school (Art. 67b CP).",
    },
    elements: [
      {
        id: "ELEM-186-1",
        title: {
          uk: "Вторгнення та відмова покинути приватне приміщення",
          fr: "Pénétration et refus de quitter la sphère privée",
          en: "Intrusion and Refusal to Leave Private Sphere",
        },
        description: {
          uk: "Самоправні візити до квартири, утримання ключів та нічні скандали з метою залякування.",
          fr: "Intrusions répétées au domicile, refus de restitution des clés et vacarme nocturne intimidant.",
          en: "Repeated intrusions, refusing to return apartment keys, and night intimidation scandals.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-AUDIO-19",
            cote: "P-09",
            title: "sample_audio_scandale_domicile.mp3",
            timecode: "04:00 - 05:45",
            sha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
            quote: {
              uk: "« Це наша квартира, ти звідси не вийдеш, доки не підпишеш папери... »",
              fr: "« C'est notre appartement, tu ne sortiras pas d'ici tant que tu n'auras pas signé les papiers... »",
              en: "« This is our apartment, you won't leave here until you sign the papers... »",
            },
            admissibility: {
              uk: "Допустимо у справі (ст. 139 КПК)",
              fr: "Pièce recevable au fond (Art. 139 CPP)",
              en: "Admissible in proceedings (Art. 139 CPC)",
            },
          },
        ],
      },
    ],
  },
  {
    id: "CHG-118-LEI",
    code: "Art. 118 LEI",
    title: {
      uk: "Шахрайство з соцвиплатами та обман влади (Статус S)",
      fr: "Fraude aux prestations & Tromperie envers les autorités (Statut S)",
      en: "Benefits Fraud & Deception of Authorities (S-Status)",
    },
    accused: "Laurent VOGEL",
    accused_id: "ACT-ACCUSED-PRINCIPAL",
    victim: {
      uk: "EVAM (Установа прийому мігрантів) та Держава Во",
      fr: "Établissement Vaudois d'Accueil des Migrants (EVAM) & État de Vaud",
      en: "Vaud Migrant Reception Service (EVAM) & State of Vaud",
    },
    status: "corroborated",
    atf_ruling: {
      uk: "Ст. 118 Закону про іноземців та інтеграцію LEI (Шахрайське отримання дозволів чи соціальних виплат)",
      fr: "Art. 118 Loi sur les étrangers et l'intégration (Obtention frauduleuse d'une autorisation de séjour ou prestations)",
      en: "Art. 118 Foreign Nationals and Integration Act LEI (Fraudulent acquisition of residence permit or social aid)",
    },
    conclusions_penales: {
      uk: "Офіційне повідомлення до міграційної служби SPOP та EVAM для скасування статусу S та адміністративної висилки.",
      fr: "Signalement officiel au Service de la population (SPOP) et EVAM pour révocation du Statut S et expulsion administrative.",
      en: "Official report to SPOP population service and EVAM for revocation of S-Status and administrative deportation.",
    },
    conclusions_civiles: {
      uk: "Повернення незаконно отриманих кантональних соціальних допомог.",
      fr: "Dédommagement pour perception indue d'aides sociales cantonales non déclarées.",
      en: "Restitution of undeclared state social assistance unlawfully received.",
    },
    elements: [
      {
        id: "ELEM-118-1",
        title: {
          uk: "Приховування готівкових капіталів та фіктивна декларація про бідність",
          fr: "Dissimulation dolosive de capitaux et fausse déclaration d'indigence",
          en: "Fraudulent Concealment of Capital & False Poverty Statement",
        },
        description: {
          uk: "Отримання та приховування $15'000 USD готівкою з одночасним поданням декларацій про відсутність коштів для отримання допомоги EVAM.",
          fr: "Encaissement des $15'000 USD dissimulés tout en requérant l'assistance publique d'urgence de l'EVAM.",
          en: "Cashing and concealing $15,000 USD while applying for public emergency assistance from EVAM.",
        },
        status: "corroborated",
        citations: [
          {
            evidence_id: "EV-DOC-EVAM-FRAUD",
            cote: "P-10",
            title: "Dossier d'assistance EVAM & Déclaration sur l'honneur",
            timecode: "Déclaration signée du 15.05.2024",
            sha256: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
            quote: {
              uk: "« Заявляє про відсутність будь-яких ліквідних активів чи заощаджень понад CHF 1'000.-. »",
              fr: "« Déclare ne posséder aucune fortune mobilière ni liquide excédant CHF 1'000.-. »",
              en: "« Declares owning no assets or liquid cash exceeding CHF 1,000.-. »",
            },
            admissibility: {
              uk: "Офіційний завірений документ (ст. 139 ч. 1 КПК)",
              fr: "Document officiel authentifié (Art. 139 al. 1 CPP)",
              en: "Authenticated public document (Art. 139 para 1 CPC)",
            },
          },
        ],
      },
    ],
  },
];

// -------------------------------------------------------------------------
// 2. BORDEREAU OFFICIEL DES PIÈCES (P-01 À P-15) - ТРИМОВНИЙ РЕЄСТР
// -------------------------------------------------------------------------
export const BORDEREAU_PIECES: BordereauPiece[] = [
  {
    cote: "P-01",
    date_faits: "19.07.2024 16:45",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 32 · Погроза вбивством проти дитини Александра",
      fr: "Enregistrement Audio 32 · Menace d'homicide contre l'enfant Alexandre",
      en: "Audio Recording 32 · Homicide Threat Against Minor Alexandre",
    },
    categorie: "Audio",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    admissibilite: {
      uk: "Повністю допустимий за ATF 146 IV 9 ч. 2",
      fr: "Exploitable selon ATF 146 IV 9 al. 2",
      en: "Admissible under ATF 146 IV 9 para 2",
    },
    portee_probatoire: {
      uk: "Доводить тяжкі кваліфіковані погрози (ст. 180 ч. 2 КК)",
      fr: "Prouve l'infraction de menaces graves qualifiées (Art. 180 al. 2 CP)",
      en: "Proves aggravated death threats (Art. 180 para 2 CP)",
    },
    citation_cle: {
      uk: "« Зафіксовано прямі вербальні погрози насильством та залякування... »",
      fr: "« Claire vient pour tuer Alexandre, lui casser les dents, le noyer dans l'eau... »",
      en: "« Claire is coming to kill Alexandre, knock out his teeth, drown him in water... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/sample_audio_01_verbal_threats.mp3",
  },
  {
    cote: "P-02",
    date_faits: "19.07.2024 18:20",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 38 · Повторна погроза вбивством та виклик поліції Швейцарії",
      fr: "Enregistrement Audio 38 · Menace de mort réitérée et mépris des autorités suisses",
      en: "Audio Recording 38 · Reiterated Death Threats & Contempt for Swiss Authorities",
    },
    categorie: "Audio",
    sha256: "f5a79854e3fa338a0a80e06001099684348680d21057e95fcfef0f8457018c15",
    admissibilite: {
      uk: "Повністю допустимий за ATF 146 IV 9 ч. 2",
      fr: "Exploitable selon ATF 146 IV 9 al. 2",
      en: "Admissible under ATF 146 IV 9 para 2",
    },
    portee_probatoire: {
      uk: "Встановлює умисність та повторюваність злочинного наміру",
      fr: "Établit la réitération de l'intention délictuelle et la préméditation",
      en: "Establishes reiterated criminal intent and premeditation",
    },
    citation_cle: {
      uk: "« Зафіксовано погрози фізичною розправою та психологічний тиск... »",
      fr: "« Et ton fils, et toi je vous abattrai, il ne m'arrivera rien, ici la police suisse ne fera rien... »",
      en: "« Both your son and you I will slaughter, nothing will happen to me, Swiss police won't do anything... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/sample_audio_02_coercion.mp3",
  },
  {
    cote: "P-03",
    date_faits: "22.07.2024 14:00",
    date_versement: "24.07.2024",
    titre: {
      uk: "Медичний звіт невідкладної педіатрії Centre Hospitalier Лозанна (FOR597)",
      fr: "Rapport médical d'urgence pédiatrique Centre Hospitalier Lausanne (Réf. FOR597)",
      en: "Pediatric Emergency Medical Report Centre Hospitalier Lausanne (FOR597)",
    },
    categorie: "Médical",
    sha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    admissibilite: {
      uk: "Офіційний публічний документ (ст. 139 ч. 1 КПК)",
      fr: "Pièce publique officielle (Art. 139 al. 1 CPP)",
      en: "Official public document (Art. 139 para 1 CPC)",
    },
    portee_probatoire: {
      uk: "Засвідчує гострий посттравматичний розлад і страх дитини",
      fr: "Certifie le stress post-traumatique aigu et l'état de terreur de l'enfant",
      en: "Certifies acute post-traumatic stress and terrorized state of the child",
    },
    citation_cle: {
      uk: "« Гострий посттравматичний стресовий розлад внаслідок вербального насильства в родині... »",
      fr: "« État de stress post-traumatique aigu consécutif aux violences verbales répétées... »",
      en: "« Acute post-traumatic stress disorder consecutive to repeated verbal violence... »",
    },
    fichier_local: "colab_evidence/04_PHOTO_DOCS_EVIDENCE/unisante_certificat_medical_for597.pdf",
  },
  {
    cote: "P-04",
    date_faits: "18.06.2024 11:30",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 35 · Зізнання у привласненні $15'000 USD",
      fr: "Enregistrement Audio 35 · Aveu d'appropriation des $15'000 USD",
      en: "Audio Recording 35 · Confession of $15,000 USD Misappropriation",
    },
    categorie: "Audio",
    sha256: "d41d8cd98f00b204e9800998ecf8427e02d8471b0593444458533159784b067a",
    admissibilite: {
      uk: "Допустимо по суті справи (ст. 139 ч. 1 КПК)",
      fr: "Exploitable au fond (Art. 139 al. 1 CPP)",
      en: "Admissible on the merits (Art. 139 para 1 CPC)",
    },
    portee_probatoire: {
      uk: "Пряме позасудове визнання неповернення довірених коштів",
      fr: "Aveu extrajudiciaire péremptoire de dissipation des fonds confiés",
      en: "Direct extrajudicial admission of dissipating entrusted funds",
    },
    citation_cle: {
      uk: "« Гроші вже переписані, ти їх більше ніколи не побачиш... »",
      fr: "« L'argent est déjà réécrit, tu ne le reverras plus jamais... »",
      en: "« The money is already rewritten, you will never see it again... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/sample_audio_03_financial_dispute.mp3",
  },
  {
    cote: "P-05",
    date_faits: "02.04.2024 10:15",
    date_versement: "23.07.2024",
    titre: {
      uk: "Банківські виписки Wise & Crédit Agricole ($15'000 USD)",
      fr: "Bordereaux bancaires certifiés · Transferts Wise & Crédit Agricole ($15'000 USD)",
      en: "Certified Bank Records · Wise & Crédit Agricole Wires ($15,000 USD)",
    },
    categorie: "Bancaire",
    sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    admissibilite: {
      uk: "Прямий документальний доказ (ст. 139 ч. 1 КПК)",
      fr: "Preuve documentaire directe (Art. 139 al. 1 CPP)",
      en: "Direct documentary evidence (Art. 139 para 1 CPC)",
    },
    portee_probatoire: {
      uk: "Беззаперечний доказ фінансового переказу позивачем",
      fr: "Preuve irréfutable du flux financier et du dessaisissement du plaignant",
      en: "Irrefutable proof of financial transfer from claimant",
    },
    citation_cle: {
      uk: "Переказ SWIFT / SEPA на $15'000 USD з призначенням для родини.",
      fr: "Virement SWIFT / SEPA de $15'000 USD émis avec mention affectation famille.",
      en: "SWIFT/SEPA transfer of $15,000 USD designated for family support.",
    },
    fichier_local: "colab_evidence/04_PHOTO_DOCS_EVIDENCE/bank_statement_credit_agricole_wise.pdf",
  },
  {
    cote: "P-06",
    date_faits: "21.07.2024 11:45",
    date_versement: "23.07.2024",
    titre: {
      uk: "Фотографія EXIF 1481 · Супермаркет Лозанна (Передпліччя без ушкоджень)",
      fr: "Photographie EXIF 1481 · Cliché supermarché Lausanne (Bras intacts)",
      en: "EXIF Photograph 1481 · Lausanne Supermarket (Uninjured Arms)",
    },
    categorie: "Photo EXIF",
    sha256: "1481a54728fbe5d8995a9d6854e4c3a216bfa58896587c6b5b5c928424268e31",
    admissibilite: {
      uk: "Цифровий форензік-доказ (ISO 27037)",
      fr: "Preuve numérique scientifiquement certifiée (ISO 27037)",
      en: "Scientifically certified digital evidence (ISO 27037)",
    },
    portee_probatoire: {
      uk: "Спростовує наявність будь-яких побоїв через 17 годин після вигаданого інциденту",
      fr: "Démontre l'absence totale d'ecchymoses 17h après les prétendus coups",
      en: "Demonstrates total absence of bruises 17 hours after claimed assault",
    },
    citation_cle: {
      uk: "Метадані EXIF: Фокусна відстань 26мм, ISO 50, сертифіковані координати Лозанна.",
      fr: "Métadonnées EXIF : Focale 26mm, ISO 50, Horodatage GPS certifié Lausanne.",
      en: "EXIF Metadata: 26mm focal length, ISO 50, certified GPS coordinates Lausanne.",
    },
    fichier_local: "colab_evidence/04_PHOTO_DOCS_EVIDENCE/exif_photo_1481_lausanne.jpg",
  },
  {
    cote: "P-07",
    date_faits: "21.07.2024 14:10",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 12 · Зізнання в умисному самопошкодженні нігтями",
      fr: "Enregistrement Audio 12 · Aveu formel d'auto-mutilation et mise en scène",
      en: "Audio Recording 12 · Confession of Self-Inflicted Scratches",
    },
    categorie: "Audio",
    sha256: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    admissibilite: {
      uk: "Повністю допустимий за ATF 146 IV 9 ч. 2",
      fr: "Exploitable selon ATF 146 IV 9 al. 2",
      en: "Admissible under ATF 146 IV 9 para 2",
    },
    portee_probatoire: {
      uk: "Доводить прямий умисел неправдивого доносу (ст. 303 КК)",
      fr: "Prouve le dol direct de dénonciation calomnieuse (Art. 303 CP)",
      en: "Proves direct dolus of malicious false accusation (Art. 303 CP)",
    },
    citation_cle: {
      uk: "« Я сама собі нігтями роздерла, терла лікті об килим... »",
      fr: "« Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis... »",
      en: "« I scratched myself with my nails, rubbed my elbows on the carpet... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/enhanced_audio-lena01-зізнання-самопошкодження.mp3",
  },
  {
    cote: "P-08",
    date_faits: "15.07.2024 19:30",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 24 · Шантаж анулюванням статусу S та депортацією",
      fr: "Enregistrement Audio 24 · Menaces d'expulsion administrative et contrainte",
      en: "Audio Recording 24 · Extortion via Threat of Deportation and S-Status Loss",
    },
    categorie: "Audio",
    sha256: "6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d",
    admissibilite: {
      uk: "Допустимо за ATF 146 IV 9 ч. 2",
      fr: "Exploitable selon ATF 146 IV 9 al. 2",
      en: "Admissible under ATF 146 IV 9 para 2",
    },
    portee_probatoire: {
      uk: "Доводить примус (ст. 181 КК) шляхом залякування",
      fr: "Établit la contrainte (Art. 181 CP) par instrumentalisation du statut de réfugié",
      en: "Establishes coercion (Art. 181 CP) via exploitation of refugee status",
    },
    citation_cle: {
      uk: "« Якщо тільки писнеш поліції, я зроблю так, що вас позбавлять статусу S... »",
      fr: "« Si seulement tu oses aller à la police, je ferai en sorte qu'on vous retire le statut S... »",
      en: "« If you dare squeak to the police, I'll make sure they strip your S-status... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/enhanced_audio-lena01-шантаж-депортацією.mp3",
  },
  {
    cote: "P-09",
    date_faits: "10.07.2024 22:15",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 19 · Порушення недоторканності житла та блокування в кімнаті",
      fr: "Enregistrement Audio 19 · Violation de domicile et séquestration dans la chambre",
      en: "Audio Recording 19 · Trespassing & Forced Confinement in Bedroom",
    },
    categorie: "Audio",
    sha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    admissibilite: {
      uk: "Допустимо у справі (ст. 139 КПК)",
      fr: "Exploitable au fond (Art. 139 CPP)",
      en: "Admissible in proceedings (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Доводить порушення недоторканності житла (ст. 186 КК)",
      fr: "Prouve la violation de domicile (Art. 186 CP) et le trouble à la paix",
      en: "Proves home trespassing (Art. 186 CP) and breach of peace",
    },
    citation_cle: {
      uk: "« Це наша квартира, ти звідси не вийдеш, доки не підпишеш папери... »",
      fr: "« C'est notre appartement, tu ne sortiras pas d'ici tant que tu n'auras pas signé les papiers... »",
      en: "« This is our apartment, you won't leave here until you sign the papers... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/enhanced_audio-lena01-скандал-в-квартирі.mp3",
  },
  {
    cote: "P-10",
    date_faits: "15.05.2024 09:00",
    date_versement: "25.07.2024",
    titre: {
      uk: "Підписана декларація про бідність в EVAM · Приховування $15'000 USD",
      fr: "Déclaration d'indigence EVAM signée · Dissimulation d'avoirs",
      en: "Signed EVAM Poverty Statement · Concealment of $15,000 USD",
    },
    categorie: "Procédure",
    sha256: "7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    admissibilite: {
      uk: "Офіційний письмовий документ (ст. 139 ч. 1 КПК)",
      fr: "Preuve documentaire publique (Art. 139 al. 1 CPP)",
      en: "Official documentary proof (Art. 139 para 1 CPC)",
    },
    portee_probatoire: {
      uk: "Доводить шахрайство з соцвиплатами (ст. 118 LEI / ст. 146 КК)",
      fr: "Établit la fraude aux prestations sociales (Art. 118 LEI / Art. 146 CP)",
      en: "Establishes social benefits fraud (Art. 118 LEI / Art. 146 CP)",
    },
    citation_cle: {
      uk: "Декларація про відсутність будь-яких коштів понад CHF 1'000.-.",
      fr: "Déclaration d'absence de toute ressource financière excédant CHF 1'000.-.",
      en: "Declaration of owning zero assets or cash exceeding CHF 1,000.-.",
    },
    fichier_local: "colab_evidence/04_PHOTO_DOCS_EVIDENCE/declaration_evam_indigence_signee.pdf",
  },
  {
    cote: "P-11",
    date_faits: "20.07.2024 21:00",
    date_versement: "23.07.2024",
    titre: {
      uk: "Експорт чату Telegram · Залякування та погрози",
      fr: "Messages Telegram instantanés · Intimidation de Liubov Vogel",
      en: "Exported Telegram Messages · Intimidation by Liubov Vogel",
    },
    categorie: "Message",
    sha256: "3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    admissibilite: {
      uk: "Електронний цифровий доказ (ст. 139 КПК)",
      fr: "Preuve électronique directe (Art. 139 CPP)",
      en: "Direct electronic evidence (Art. 139 CPC)",
    },
    portee_probatoire: {
      uk: "Підтверджує тривалий терор родини",
      fr: "Corrobore le harcèlement continu et la terreur imposée à la famille",
      en: "Corroborates continuous harassment and terror against the family",
    },
    citation_cle: {
      uk: "« Ти ще пошкодуєш, що зв'язався зі мною. Тобі і твоєму виродку тут кінець. »",
      fr: "« Tu vas regretter de t'être mesuré à moi. Pour toi et ton avorton, c'est la fin ici. »",
      en: "« You will regret crossing me. For you and your brat, this is the end here. »",
    },
    fichier_local: "evidence/telegram_export_intimidation.json",
  },
  {
    cote: "P-12",
    date_faits: "22.07.2024 09:15",
    date_versement: "24.07.2024",
    titre: {
      uk: "Протокол допиту в поліції · Неправдивий донос підозрюваної",
      fr: "Procès-verbal de dénonciation pénale de la suspecte à la police",
      en: "Police Deposition Protocol · Suspect's Malicious False Accusation",
    },
    categorie: "Procédure",
    sha256: "4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    admissibilite: {
      uk: "Офіційний процесуальний документ (ст. 100 КПК)",
      fr: "Pièce du dossier officiel MP Vaud (Art. 100 CPP)",
      en: "Official procedural case document (Art. 100 CPC)",
    },
    portee_probatoire: {
      uk: "Склад злочину завідомо неправдивого доносу (ст. 303 КК)",
      fr: "Corpus delicti de l'infraction de dénonciation calomnieuse (Art. 303 CP)",
      en: "Corpus delicti of malicious false accusation (Art. 303 CP)",
    },
    citation_cle: {
      uk: "Неправдиво стверджує про побиття малолітнім сином 20 липня.",
      fr: "Affirme faussement avoir été agressée physiquement par son fils mineur le 20.07.",
      en: "Falsely asserts physical assault by her minor son on July 20.",
    },
    fichier_local: "evidence/pv_audition_police_denonciation_calomnieuse.pdf",
  },
  {
    cote: "P-13",
    date_faits: "23.07.2024 16:00",
    date_versement: "25.07.2024",
    titre: {
      uk: "Декларація добросовісності Жана-Поля Вернона (Щит інваріанта L-03)",
      fr: "Attestation de bonne foi & Déclaration d'intervention de Jean-Paul Vernon",
      en: "Good Faith Affidavit & Statement of Jean-Paul Vernon (L-03 Shield)",
    },
    categorie: "Procédure",
    sha256: "5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
    admissibilite: {
      uk: "Свідчення третьої сторони (ст. 162 КПК)",
      fr: "Preuve testimoniale certifiée (Art. 162 CPP)",
      en: "Certified testimonial evidence (Art. 162 CPC)",
    },
    portee_probatoire: {
      uk: "Підтверджує виключно волонтерську допомогу та повний імунітет",
      fr: "Bouclier Invariant L-03 : Confirme l'assistance bénévole et l'absence de faute",
      en: "Invariant L-03 Shield: Confirms voluntary aid and absolute lack of fault",
    },
    citation_cle: {
      uk: "Діяв виключно з гуманітарних мотивів та для перекладу, без фінансового інтересу.",
      fr: "A agi à titre purement humanitaire et de traduction, sans intérêt financier.",
      en: "Acted purely out of humanitarian assistance and translation, zero financial interest.",
    },
    fichier_local: "evidence/declaration_jean_paul_vernon_bona_fide.pdf",
  },
  {
    cote: "P-14",
    date_faits: "14.07.2024 15:30",
    date_versement: "23.07.2024",
    titre: {
      uk: "Аудіозапис 28 · Фінансовий тиск та відмова повертати кошти",
      fr: "Enregistrement Audio 28 · Pressions financières et refus de restitution",
      en: "Audio Recording 28 · Financial Pressure & Refusal to Return Funds",
    },
    categorie: "Audio",
    sha256: "6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b",
    admissibilite: {
      uk: "Допустимо за ATF 146 IV 9 ч. 2",
      fr: "Exploitable selon ATF 146 IV 9 al. 2",
      en: "Admissible under ATF 146 IV 9 para 2",
    },
    portee_probatoire: {
      uk: "Встановлює умисну відмову повертати довірені активи",
      fr: "Établit le refus systématique et conscient de restituer les fonds",
      en: "Establishes systemic, conscious refusal to return entrusted assets",
    },
    citation_cle: {
      uk: "« Я нічого віддавати не збираюся, доведеться тобі самому крутитися... »",
      fr: "« Je n'ai aucune intention de rendre quoi que ce soit, tu devras te débrouiller seul... »",
      en: "« I have no intention of giving anything back, you will have to manage alone... »",
    },
    fichier_local: "colab_evidence/03_AUDIO_EVIDENCE/enhanced_audio-lena01-відмова-повернути.mp3",
  },
  {
    cote: "P-15",
    date_faits: "24.07.2024 10:00",
    date_versement: "26.07.2024",
    titre: {
      uk: "Форензік-експертиза метаданих EXIF знімка 1481",
      fr: "Rapport d'expertise chronologique & métadonnées EXIF (Forensic certifié)",
      en: "Forensic Chronological & EXIF Metadata Expert Audit",
    },
    categorie: "Procédure",
    sha256: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    admissibilite: {
      uk: "Висновок технічного спеціаліста (ст. 139 КПК / ATF 141 IV 369)",
      fr: "Rapport d'expertise technique privé (Art. 139 CPP / ATF 141 IV 369)",
      en: "Technical forensic report (Art. 139 CPC / ATF 141 IV 369)",
    },
    portee_probatoire: {
      uk: "Доводить фізичну неможливість побоїв під спектральним RGB-аналізом",
      fr: "Démontre l'impossibilité physique de survenance des hématomes allégués",
      en: "Demonstrates physical impossibility of alleged bruises under spectral RGB analysis",
    },
    citation_cle: {
      uk: "Повна відсутність гематом чи еритеми під спектральним мікро-аналізом.",
      fr: "Absence totale d'ecchymose sous analyse spectrale RGB haute précision.",
      en: "Total absence of ecchymosis under high-precision RGB spectral analysis.",
    },
    fichier_local: "colab_evidence/AUDIT_RESULTS/forensic_exif_audit_report_lausanne.pdf",
  },
];

// -------------------------------------------------------------------------
// 3. MATRICE DE CONFRONTATION & AUDIENCES - ТРИМОВНА МАТРИЦЯ ДОПИТУ
// -------------------------------------------------------------------------
export const CONFRONTATIONS: ConfrontationItem[] = [
  {
    id: "CONF-01",
    theme: {
      uk: "Вигадані побої 20.07.2024 проти об'єктивного фото EXIF 1481 у супермаркеті",
      fr: "Coups prétendus du 20.07.2024 c. Cliché EXIF 1481 au supermarché",
      en: "Alleged Assault on 20.07.2024 vs Objective EXIF Photo 1481 at Supermarket",
    },
    allegation_suspecte: {
      texte: {
        uk: "Стверджує, що неповнолітній син жорстоко побив її кулаками 20 липня о 18:00, залишивши важкі гематоми на обох руках.",
        fr: "Prétend avoir été violemment frappée à coups de poing par son fils mineur le 20 juillet vers 18h, causant de graves hématomes et ecchymoses sur les deux avant-bras.",
        en: "Claims her minor son violently punched her on July 20 at 18:00, inflicting deep hematomas on both arms.",
      },
      source: {
        uk: "Покази поліції кантону Во від 22.07.2024 о 09:15",
        fr: "Déposition Police cantonale vaudoise du 22.07.2024 à 09h15",
        en: "Vaud Cantonal Police Deposition dated 22.07.2024 at 09:15",
      },
      date_allegation: "20.07.2024 18:00",
      incoherence: {
        uk: "Заявляє про жахливі синці, наявні нібито вже того самого вечора.",
        fr: "Affirme des blessures graves et visibles dès le soir même.",
        en: "Asserts deep injuries visible from that very evening.",
      },
    },
    preuve_objective: {
      cote: "P-06",
      titre: {
        uk: "Цифрова фотографія EXIF 1481 (Супермаркет Лозанна)",
        fr: "Photographie numérique EXIF 1481 (Supermarché Lausanne)",
        en: "Digital Photograph EXIF 1481 (Lausanne Supermarket)",
      },
      date_reelle: "21.07.2024 11:45:12 CEST (через 17 годин)",
      sha256: "1481a54728fbe5d8995a9d6854e4c3a216bfa58896587c6b5b5c928424268e31",
      verbatim: {
        uk: "На збільшенні 4K видно абсолютно чисту шкіру без жодних крововиливів чи почервонінь.",
        fr: "L'agrandissement en haute résolution montre une peau immaculée, sans aucun épanchement sous-cutané, rougeur ou ecchymose.",
        en: "High-resolution enlargement shows immaculate skin, without any subcutaneous effusion, redness, or bruising.",
      },
    },
    questions_interrogatoire: {
      uk: [
        "Пані Фогель, підтвердіть під присягою точний час, коли син нібито вас побив 20 липня?",
        "Подивіться на фото P-06, зроблене 21 липня об 11:45 у супермаркеті Лозанни. Ви з відкритими руками, посміхаєтеся. Де синці?",
        "Як ви поясните медично, що через 17 годин після 'жорстоких ударів' на передпліччях немає жодного сліду?",
      ],
      fr: [
        "Madame Vogel, pouvez-vous confirmer sous serment l'heure exacte à laquelle votre fils vous aurait prétendument frappée le 20 juillet ?",
        "Regardez cette photographie P-06 prise le 21 juillet à 11h45 au supermarché de Lausanne. Vous y apparaissez les bras nus, souriante. Où se trouvent les hématomes ?",
        "Comment expliquez-vous médicalement que 17 heures après des coups prétendument d'une violence inouïe, vos avant-bras ne présentent aucune trace ?",
      ],
      en: [
        "Mrs. Vogel, can you confirm under oath the exact hour when your son allegedly struck you on July 20th?",
        "Look at Exhibit P-06 taken on July 21st at 11:45 in a Lausanne supermarket. You appear with bare arms, smiling. Where are the bruises?",
        "How do you medically explain that 17 hours after allegedly savage blows, your forearms display zero traces?",
      ],
    },
    piege_tactique_defense: {
      uk: "Змусити підозрювану спочатку підтвердити, що вона не наносила гриму чи тонального крему, перед тим як пред'явити 4K-збільшення.",
      fr: "Faire confirmer par la prévenue qu'elle n'a appliqué aucun maquillage couvrant sur ses bras avant de lui présenter l'agrandissement 4K.",
      en: "Have the accused confirm under oath that she used no concealing makeup before confronting her with the 4K enlargement.",
    },
  },
  {
    id: "CONF-02",
    theme: {
      uk: "Походження синців проти дослівної цитати Аудіо 12 про самопошкодження",
      fr: "Origine des ecchymoses c. Aveu verbatim Audio 12 d'auto-mutilation",
      en: "Origin of Bruises vs Verbatim Audio 12 Confession of Self-Infliction",
    },
    allegation_suspecte: {
      texte: {
        uk: "Стверджує, що сліди, зафіксовані лікарем 22 липня, є наслідком побиття сином.",
        fr: "Soutient que les traces constatées par le médecin le 22 juillet résultent exclusivement des violences de son enfant.",
        en: "Maintains that marks recorded by the physician on July 22 exclusively stem from violence by her child.",
      },
      source: {
        uk: "Заява до кримінальної поліції",
        fr: "Constat de coups et dénonciation pénale",
        en: "Police deposition and complaint",
      },
      date_allegation: "22.07.2024 11:00",
      incoherence: {
        uk: "Категорично заперечує будь-яке інсценування.",
        fr: "Refuse d'admettre toute machination ou mise en scène.",
        en: "Refuses to admit any staging or manipulation.",
      },
    },
    preuve_objective: {
      cote: "P-07",
      titre: {
        uk: "Аудіозапис 12 (Зафіксовано 21.07.2024 о 14:10)",
        fr: "Enregistrement Audio 12 (Horodaté 21.07.2024 à 14h10)",
        en: "Audio Recording 12 (Timestamped 21.07.2024 at 14:10)",
      },
      date_reelle: "21.07.2024 14:10 CEST",
      sha256: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      verbatim: {
        uk: "« Я сама собі нігтями роздерла, терла лікті об килим, щоб лікар зафіксував синяки проти Александра... »",
        fr: "« Je me suis moi-même écorchée avec mes ongles, j'ai frotté mes coudes contre le tapis pour que le docteur constate des bleus contre Alexandre... »",
        en: "« I scratched myself with my nails, rubbed my elbows on the carpet so the doctor would log bruises against Alexandre... »",
      },
    },
    questions_interrogatoire: {
      uk: [
        "Пані, чи впізнаєте ви свій голос на аудіозаписі за шифром P-07?",
        "Що означають ваші слова: 'Я сама собі нігтями роздерла, терла лікті об килим'?",
        "Ви визнаєте, що навмисно намагалися сфабрикувати докази проти власної дитини для поліції?",
      ],
      fr: [
        "Madame, reconnaissez-vous le timbre de votre voix sur cet enregistrement téléphonique versé sous cote P-07 ?",
        "Que signifie votre phrase textuelle : « Je me suis moi-même écorchée avec mes ongles et j'ai frotté mes coudes contre le tapis » ?",
        "Reconnaissez-vous avoir délibérément cherché à faire incarcérer ou placer votre fils mineur sous de faux prétextes ?",
      ],
      en: [
        "Do you recognize the timbre of your voice on this phone recording under Exhibit P-07?",
        "What is the meaning of your verbatim statement: 'I scratched myself with my nails, rubbed my elbows on the carpet'?",
        "Do you admit to deliberately attempting to frame your minor son before the police?",
      ],
    },
    piege_tactique_defense: {
      uk: "Якщо захист посилається на ст. 141 КПК, негайно заявити прецедент ATF 146 IV 9 ч. 2: запис є єдиним доказом невинуватості дитини.",
      fr: "Si la défense soulève l'art. 141 CPP, invoquer immédiatement l'ATF 146 IV 9 al. 2 : l'enregistrement est la seule preuve directe disculpant un enfant mineur d'une fausse accusation criminelle.",
      en: "If defense invokes Art. 141 CPC, immediately cite ATF 146 IV 9 para 2: the recording is the sole direct evidence exonerating a minor from malicious framing.",
    },
  },
  {
    id: "CONF-03",
    theme: {
      uk: "Куди зникли $15'000 USD проти банківських виписок та Аудіо 35",
      fr: "Destination des $15'000 USD c. Relevés bancaires et Audio 35",
      en: "Destination of $15,000 USD vs Bank Records and Audio 35",
    },
    allegation_suspecte: {
      texte: {
        uk: "Стверджує, що не отримувала грошей, або що це був безповоротний подарунок без цільового призначення.",
        fr: "Affirme n'avoir jamais reçu d'argent à titre personnel ou soutient qu'il s'agissait d'un don manuel irrévocable non affecté.",
        en: "Claims never receiving personal money or asserts it was an unconditional gift.",
      },
      source: {
        uk: "Пояснення сторони захисту",
        fr: "Échanges préliminaires avec le conseil",
        en: "Preliminary defense briefs",
      },
      date_allegation: "Квітень - Липень 2024",
      incoherence: {
        uk: "Нездатна надати жодної квитанції чи договору про інвестиції в родину.",
        fr: "Incapable de produire la moindre facture ou trace d'investissement familial.",
        en: "Unable to produce any receipt or proof of family expenditure.",
      },
    },
    preuve_objective: {
      cote: "P-04 & P-05",
      titre: {
        uk: "Банківські виписки Wise/CA + Аудіозапис 35",
        fr: "Bordereaux bancaires Wise / CA + Audio 35",
        en: "Bank records Wise / CA + Audio 35",
      },
      date_reelle: "02.04.2024 & 18.06.2024",
      sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      verbatim: {
        uk: "« Гроші вже переписані, ти їх більше ніколи не побачиш, ми їх вклали як треба... »",
        fr: "« L'argent est déjà réécrit, tu ne le reverras plus jamais, nous l'avons placé comme il faut... »",
        en: "« The money is already rewritten, you will never see it again, we invested it properly... »",
      },
    },
    questions_interrogatoire: {
      uk: [
        "На який саме рахунок було виведено $15'000 USD, перераховані 2 квітня 2024 року?",
        "Чому в Аудіо 35 ви сказали, що гроші 'переписані' і батько дитини їх більше не побачить?",
        "Чи задекларували ви ці $15'000 USD у службі EVAM 15 травня 2024 року, коли просили допомогу з бідності?",
      ],
      fr: [
        "Sur quel compte bancaire suisse ou étranger les $15'000 USD virés le 2 avril 2024 ont-ils été transférés ?",
        "Pourquoi avez-vous déclaré dans l'Audio 35 que l'argent avait été « réécrit » et que le père de l'enfant ne le reverrait jamais ?",
        "Avez-vous déclaré ces $15'000 USD dans votre déclaration d'indigence auprès de l'EVAM le 15 mai 2024 ?",
      ],
      en: [
        "To which Swiss or foreign account were the $15,000 USD wired on April 2, 2024 transferred?",
        "Why did you state in Audio 35 that the money had been 'rewritten' and the father would never see it?",
        "Did you disclose these $15,000 USD in your EVAM poverty statement on May 15, 2024 when claiming state aid?",
      ],
    },
    piege_tactique_defense: {
      uk: "Зіставлення з декларацією EVAM (P-10) автоматично підтверджує склад злочину ст. 118 LEI та шахрайство.",
      fr: "La confrontation avec la déclaration EVAM (P-10) déclenche automatiquement la qualification d'escroquerie et d'infraction à l'art. 118 LEI.",
      en: "Confrontation with the EVAM statement (P-10) automatically triggers conviction under Art. 118 LEI and fraud.",
    },
  },
];

// -------------------------------------------------------------------------
// 4. ÉCRITURES JUDICIAIRES (CPP VAUD) - ТРИМОВНІ СУДОВІ АКТИ
// -------------------------------------------------------------------------
export const LEGAL_REQUISITIONS: LegalRequisition[] = [
  {
    id: "REQ-318-PREUVES",
    type: {
      uk: "Клопотання про слідчі дії",
      fr: "Requête d'actes d'instruction",
      en: "Petition for Supplementary Evidence",
    },
    base_legale: "Art. 318 CPP (Procédure d'instruction)",
    titre: {
      uk: "Клопотання про додаткове розслідування · Банківські виписки та Очна ставка",
      fr: "Réquisition d'instruction complémentaire · Éditions bancaires & Audition de confrontation",
      en: "Supplementary Investigation Motion · Bank Subpoenas & Confrontation Hearing",
    },
    destinataire: {
      uk: "Прокурору прокуратури кантону Во · Відділ спеціальних справ",
      fr: "À Monsieur le Procureur du Ministère public du canton de Vaud · Division affaires spéciales",
      en: "To the Public Prosecutor of Canton de Vaud · Special Proceedings Division",
    },
    conclusions: {
      uk: [
        "Зобов'язати BCV, Wise та Crédit Agricole надати повний рух коштів Лорана Фогеля з 1 березня 2024 року (ст. 192 КПК).",
        "Провести обов'язкову очну ставку між обвинуваченою та цивільним позивачем на основі доказів P-01..P-07.",
        "Призначити судову психіатричну експертизу Софі Моро (ст. 182 КПК) щодо психологічного підпорядкування.",
      ],
      fr: [
        "Ordonner à la Banque Cantonale Vaudoise (BCV), à Wise Payments et au Crédit Agricole l'édition intégrale des relevés de comptes de Laurent VOGEL dès le 1er mars 2024 (Art. 192 CPP).",
        "Procéder à une audition de confrontation contradictoire entre la prévenue Laurent VOGEL et la partie plaignante, assistée de son conseil, sur la base des pièces P-01 à P-07.",
        "Ordonner une expertise psychiatrique judiciaire (Art. 182 CPP) concernant Sophie MOREAU afin d'évaluer son état de dépendance psychologique et de sujétion.",
      ],
      en: [
        "Order BCV, Wise, and Crédit Agricole to produce complete bank statements for Laurent VOGEL from March 1, 2024 (Art. 192 CPC).",
        "Conduct a formal adversarial confrontation hearing between the accused and the private claimant based on Exhibits P-01 to P-07.",
        "Order a forensic psychiatric evaluation (Art. 182 CPC) for Sophie MOREAU to assess severe psychological coercion.",
      ],
    },
    texte_integral: {
      uk: `ПРОКУРАТУРА КАНТОНУ ВО (ШВЕЙЦАРІЯ)
Відділ спеціальних справ
Avenue de Longemalle 1, 1020 Renens

Справа №: CASE-SAMPLE-2026-CH
Провадження: МОРО проти ФОГЕЛЯ та інших

КЛОПОТАННЯ ПРО ДОДАТКОВІ СЛІДЧІ ДІЇ
(на підставі статті 318 ч. 1 КПК Швейцарії)

Пане Прокуроре,

В інтересах цивільного позивача та потерпілого, Марка Моро, який діє у власних інтересах та як законний представник малолітнього сина Александра Дюбуа (2012 р.н.),

Маю честь подати такі клопотання про витребування доказів, необхідних для встановлення матеріальної істини (ст. 139 КПК):

1. ВИТРЕБУВАННЯ БАНКІВСЬКИХ ДОКУМЕНТІВ (ст. 192 КПК):
Витребувати з банківських установ рух коштів за рахунками Лорана Фогеля для встановлення долі $15'000 USD (ст. 138 / 146 КК).

2. ОЧНА СТАВКА (ст. 146 ч. 2 КПК):
Провести очну ставку з пред'явленням сертифікованих аудіозаписів (ATF 146 IV 9) та фотографій EXIF.

3. СУДОВА ПСИХІАТРИЧНА ЕКСПЕРТИЗА (ст. 182 КПК):
Призначити експертизу щодо стану психологічного підпорядкування Софі Моро.`,
      fr: `MINISTÈRE PUBLIC DU CANTON DE VAUD
Division affaires spéciales
Avenue de Longemalle 1, 1020 Renens

Réf. Dossier : CASE-SAMPLE-2026-CH
Cause : MOREAU c/ VOGEL et consorts

RÉQUISITION D'ACTES D'INSTRUCTION COMPLÉMENTAIRE
(au sens de l'article 318 al. 1 CPP)

Monsieur le Procureur,

Pour la partie plaignante et demanderesse au civil, Monsieur Marc MOREAU, agissant tant en son nom propre que comme représentant légal de son fils mineur Alexandre DUBOIS (né en 2012),

J'ai l'honneur de vous soumettre les réquisitions de preuves suivantes, indispensables à la manifestation de la vérité matérielle (Art. 139 CPP) :

1. ÉDITION DE PIÈCES BANCAIRES (Art. 192 ss CPP) :
Il est requis d'ordonner aux établissements bancaires concernés la production immédiate des mouvements et soldes des comptes ouverts au nom de Laurent VOGEL dès le 1er mars 2024.

2. AUDITION DE CONFRONTATION CONTRADICTOIRE (Art. 146 al. 2 CPP) :
La partie plaignante requiert d'être confrontée à la prévenue Laurent VOGEL en présence des enregistrements clandestins licites (ATF 146 IV 9).

3. EXPERTISE PSYCHIATRIQUE (Art. 182 CPP) :
Une expertise est impérative pour apprécier la sujétion psychologique d'Sophie MOREAU au sens de l'art. 19 CP.`,
      en: `PUBLIC PROSECUTOR'S OFFICE OF CANTON DE VAUD
Special Proceedings Division
Avenue de Longemalle 1, 1020 Renens

Case Ref: CASE-SAMPLE-2026-CH
Case: MOREAU v. VOGEL et al.

PETITION FOR SUPPLEMENTARY INVESTIGATIVE ACTS
(under Article 318 para 1 Swiss CPC)

Mr. Prosecutor,

On behalf of the private claimant, Mr. Marc MOREAU, acting both personally and as legal representative of his minor son Alexandre DUBOIS (born 2012),

I have the honor to submit the following evidence requests:

1. BANK RECORDS PRODUCTION (Art. 192 CPC):
Order banking institutions to disclose account records for Laurent VOGEL from March 1, 2024.

2. ADVERSARIAL CONFRONTATION HEARING (Art. 146 para 2 CPC):
Hold an adversarial hearing confronting the accused with lawful audio records (ATF 146 IV 9) and EXIF photos.

3. FORENSIC PSYCHIATRIC EVALUATION (Art. 182 CPC):
Examine the mental subjugation and coercion endured by Sophie MOREAU.`,
    },
  },
  {
    id: "REQ-MESURES-SURETE",
    type: {
      uk: "Заходи безпеки та захист",
      fr: "Mesures provisionnelles & Protection",
      en: "Provisional Protective Measures",
    },
    base_legale: "Art. 67b CP & Art. 221 / 237 CPP",
    titre: {
      uk: "Термінове клопотання про заборону наближення (Захист дитини)",
      fr: "Requête urgente d'interdiction de contact et de périmètre (Protection de mineur)",
      en: "Urgent Restraining Order Motion (Child Protection)",
    },
    destinataire: {
      uk: "Прокурору прокуратури кантону Во",
      fr: "À Monsieur le Procureur du Ministère public du canton de Vaud",
      en: "To the Public Prosecutor of Canton de Vaud",
    },
    conclusions: {
      uk: [
        "Заборонити Лорану та Клер Фогелям наближатися ближче 500 метрів до дитини Александра, житла та школи (ст. 67b КК).",
        "Заборонити будь-які телефонні, електронні чи поштові контакти.",
        "Попередити про кримінальну відповідальність за невиконання рішення суду (ст. 292 КК).",
      ],
      fr: [
        "Interdire à Laurent VOGEL et Claire VOGEL d'approcher à moins de 500 mètres de l'enfant Alexandre DUBOIS, de son domicile et de son école (Art. 67b CP).",
        "Interdire toute communication par voie téléphonique, électronique ou postale.",
        "Assortir cette ordonnance de la menace de la peine d'insoumission (Art. 292 CP).",
      ],
      en: [
        "Prohibit Laurent and Claire VOGEL from approaching within 500 meters of Alexandre DUBOIS, his home, and school (Art. 67b CP).",
        "Prohibit all phone, electronic, or mail contact.",
        "Attach criminal sanctions under Art. 292 CP for disobedience.",
      ],
    },
    texte_integral: {
      uk: `ПРОКУРАТУРА КАНТОНУ ВО · ТЕРМІНОВІ ЗАХОДИ ЗАХИСТУ ДИТИНИ (ст. 67b КК та 237 КПК)
З огляду на тяжкість погроз вбивством («Клер їде вбивати Александра», Доказ P-01) та діагностовану Centre Hospitalier психологічну травму (Доказ P-03), фізична та моральна безпека дитини вимагає негайної судової заборони наближення.`,
      fr: `MINISTÈRE PUBLIC DU CANTON DE VAUD · REQUÊTE TRÈS URGENTE DE MESURES DE PROTECTION DU MINEUR (Art. 67b CP et 237 CPP)
Au vu de la gravité extrême des menaces de mort proférées (« Claire arrive pour tuer Alexandre », P-01) et du traumatisme diagnostiqué par Centre Hospitalier (P-03), la sécurité du mineur exige le prononcé immédiat de mesures d'éloignement.`,
      en: `PUBLIC PROSECUTOR'S OFFICE OF VAUD · URGENT CHILD PROTECTION MOTION (Art. 67b CP and 237 CPC)
Given the extreme gravity of death threats (« Claire is coming to kill Alexandre », P-01) and Centre Hospitalier medical findings (P-03), the safety of the child mandates immediate restraining orders.`,
    },
  },
];

// -------------------------------------------------------------------------
// 5. ACTEURS (INVARIANT L-03) - ТРИМОВНІ СТОРОНИ СПРАВИ
// -------------------------------------------------------------------------
export const ACTORS: ActorItem[] = [
  {
    id: "ACT-VICTIM-MINOR",
    name: "Alexandre DUBOIS",
    status: {
      uk: "Потерпіла дитина · Сторона обвинувачення",
      fr: "Victime Mineure · Partie Plaignante",
      en: "Minor Victim · Private Claimant",
    },
    badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700",
    role: {
      uk: "Неповнолітня дитина (2012 р.н.). Безпосередня жертва систематичних погроз вбивством, психологічного насильства та фальшивих звинувачень. Категорично не є підозрюваним.",
      fr: "Enfant mineur (né en 2012). Victime directe de menaces de mort réitérées, de violences psychiques et de fausses accusations policières. Strictement non prévenu.",
      en: "Minor child (born 2012). Direct victim of death threats, psychological violence, and false police framing. Strictly non-accused.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 115, 118, 122 CPP",
    droits_proceduraux: {
      uk: [
        "Право на посилений процесуальний захист дитини (ст. 149 КПК)",
        "Особливий захищений порядок допиту дитини (ст. 154 КПК)",
        "Цивільний позов про відшкодування моральної шкоди (ст. 122 КПК / ст. 49 ЗК)",
        "Безоплатний офіційний адвокатський захист потерпілої дитини",
      ],
      fr: [
        "Droit à des mesures de protection renforcées (Art. 149 CPP)",
        "Audition sous forme protégée / assistance continue (Art. 154 CPP)",
        "Action civile pour réparation du tort moral (Art. 122 CPP / Art. 49 CO)",
        "Assistance gratuite d'un conseil juridique d'office si requise",
      ],
      en: [
        "Right to enhanced minor protection measures (Art. 149 CPC)",
        "Protected questioning format / continuous advocate support (Art. 154 CPC)",
        "Civil action for moral damages (Art. 122 CPC / Art. 49 CO)",
        "Free legal representation for the victim child",
      ],
    },
  },
  {
    id: "ACT-CLAIMANT-CIVIL",
    name: "Marc MOREAU",
    status: {
      uk: "Потерпілий & Цивільний позивач",
      fr: "Partie Plaignante & Demandeur Civil",
      en: "Claimant & Civil Plaintiff",
    },
    badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700",
    role: {
      uk: "Батько та законний представник малолітнього сина. Цивільний позивач щодо повернення $15'000 USD та відшкодування завданих збитків.",
      fr: "Père et représentant légal de l'enfant mineur. Demandeur civil pour la restitution de $15'000 USD détournés et la réparation des préjudices patrimoniaux et moraux.",
      en: "Father and legal representative of the minor. Civil plaintiff for $15,000 USD restitution and full moral damages.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 118, 122 CPP / Art. 41 CO",
    droits_proceduraux: {
      uk: [
        "Повний доступ до матеріалів справи та право ставити запитання (ст. 101, 147 КПК)",
        "Право подавати клопотання про додаткові слідчі дії (ст. 318 КПК)",
        "Право вимагати арешту банківських рахунків підозрюваних (ст. 263 КПК)",
      ],
      fr: [
        "Plein accès au dossier d'instruction et droit de poser des questions (Art. 101, 147 CPP)",
        "Droit de requérir des mesures d'instruction complémentaires (Art. 318 CPP)",
        "Faculté de requérir le séquestre des avoirs bancaires des prévenues (Art. 263 CPP)",
      ],
      en: [
        "Full dossier access and right to examine witnesses (Art. 101, 147 CPC)",
        "Right to file supplementary investigation motions (Art. 318 CPC)",
        "Right to petition asset freeze on suspects' bank accounts (Art. 263 CPC)",
      ],
    },
  },
  {
    id: "ACT-ACCUSED-PRINCIPAL",
    name: "Laurent VOGEL",
    status: {
      uk: "Головна обвинувачена",
      fr: "Prévenue Principale",
      en: "Principal Accused",
    },
    badgeColor: "bg-rose-950/80 text-rose-300 border-rose-800",
    role: {
      uk: "Організатор та виконавець шахрайства на $15'000 USD, погроз вбивством дитині, примусу, фальсифікації доказів та шахрайства зі статусом S.",
      fr: "Auteur principal des infractions d'abus de confiance ($15'000 USD), escroquerie, menaces de mort contre le mineur, contrainte et instigation à la dénonciation calomnieuse.",
      en: "Principal perpetrator of fraud ($15,000 USD), death threats against minor, coercion, malicious false deposition, and welfare fraud.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 111 CPP / Art. 138, 146, 157, 180, 181, 186, 303 CP / Art. 118 LEI",
    droits_proceduraux: {
      uk: [
        "Право бути поінформованою про суть звинувачення (ст. 158 КПК)",
        "Право не свідчити проти себе та мати адвоката (ст. 158 ч. 1 літ. b КПК)",
        "Обов'язок з'являтися на очні ставки під загрозою примусового приводу (ст. 207 КПК)",
      ],
      fr: [
        "Droit d'être informée des chefs de prévention (Art. 158 CPP)",
        "Droit de garder le silence et d'être assistée d'un défenseur (Art. 158 al. 1 let. b CPP)",
        "Obligation de comparaître aux auditions de confrontation sous mandat d'amener (Art. 207 CPP)",
      ],
      en: [
        "Right to be informed of charges (Art. 158 CPC)",
        "Right to remain silent and counsel assistance (Art. 158 para 1 lit. b CPC)",
        "Obligation to appear at confrontation hearings under arrest warrant (Art. 207 CPC)",
      ],
    },
  },
  {
    id: "ACT-ACCUSED-COMPLICE",
    name: "Claire VOGEL",
    status: {
      uk: "Обвинувачена · Співучасниця",
      fr: "Prévenue · Co-auteur / Complice",
      en: "Accused · Accomplice",
    },
    badgeColor: "bg-rose-950/80 text-rose-300 border-rose-800",
    role: {
      uk: "Активна співучасниця фізичного залякування, погроз розправою та вимагання грошей.",
      fr: "Complice active et exécutante d'intimidation physique, menaces de sévices corporels et tentative d'extorsion.",
      en: "Active accomplice in physical intimidation, death threats, and attempted extortion.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 24, 25, 180, 181, 186 CP",
    droits_proceduraux: {
      uk: [
        "Звичайний статус співучасника (ст. 111 КПК)",
        "Відповідальність за злочини, вчинені за попередньою змовою або в сукупності (ст. 49 КК)",
      ],
      fr: [
        "Régime ordinaire des co-prévenus (Art. 111 CPP)",
        "Obligation de répondre des actes commis en bande ou en concours (Art. 49 CP)",
      ],
      en: [
        "Standard co-accused status (Art. 111 CPC)",
        "Liability for group offenses and concurrence (Art. 49 CP)",
      ],
    },
  },
  {
    id: "ACT-AUTEUR-UNDER-INFLUENCE",
    name: "Sophie MOREAU",
    status: {
      uk: "Особа під психологічним примусом",
      fr: "Auteur Sous Sujétion Psychologique",
      en: "Individual Under Severe Psychological Coercion",
    },
    badgeColor: "bg-purple-950/80 text-purple-300 border-purple-700",
    role: {
      uk: "Мати дитини під сильним психологічним тиском і шантажем Лорана Фогеля. Подала неправдиву заяву в поліцію. Подано клопотання про психіатричну експертизу.",
      fr: "Mère sous emprise psychologique et chantage de Laurent Vogel. Auteur formel de la fausse déposition à la police. Requête d'expertise psychiatrique en cours.",
      en: "Mother under severe psychological coercion by Laurent Vogel. Formally lodged the false report. Forensic psychiatric petition pending.",
    },
    protected_bona_fide: false,
    legal_reference: "Art. 157 CP / Art. 182 CPP / Art. 19 CP",
    droits_proceduraux: {
      uk: [
        "Право на судово-психіатричну експертизу осудності (ст. 182 КПК)",
        "Оцінка дій під кутом стану крайньої необхідності та примусу (ст. 17, 181 КК)",
      ],
      fr: [
        "Droit à une expertise médico-légale de discernement (Art. 182 CPP)",
        "Examen sous l'angle de la contrainte subie (Art. 181 CP / Art. 17 CP)",
      ],
      en: [
        "Right to forensic psychiatric assessment (Art. 182 CPC)",
        "Examination under necessity and coercion defenses (Art. 17, 181 CP)",
      ],
    },
  },
  {
    id: "ACT-BONA-FIDE-THIRD-PARTY",
    name: "Jean-Paul VERNON",
    status: {
      uk: "Добросовісна третя сторона (Щит L-03)",
      fr: "Tiers de Bonne Foi (Bouclier L-03)",
      en: "Bona Fide Third Party (L-03 Shield)",
    },
    badgeColor: "bg-amber-950/80 text-amber-300 border-amber-600",
    role: {
      uk: "Громадянин Франції, проживає у Швейцарії. Надавав виключно гуманітарну допомогу, логістику та переклад у повній добросовісності. Абсолютний імунітет за інваріантом L-03.",
      fr: "Citoyen résidant en Suisse. Assistance bénévole, bénévole humanitaire et traduction en toute bonne foi. Immunité procédurale absolue garantie par l'Invariant L-03.",
      en: "Citizen residing in Switzerland. Voluntary humanitarian assistance, logistics, and translation in absolute good faith. Full procedural immunity under Invariant L-03.",
    },
    protected_bona_fide: true,
    legal_reference: "Art. 105 al. 2, 139/141 CPP (Bouclier Invariant L-03 / Art. 3 al. 1 CC)",
    droits_proceduraux: {
      uk: [
        "Повний імунітет від будь-яких кримінальних звинувачень (Архітектурний інваріант L-03)",
        "Виключний статус незацікавленого свідка чи учасника (ст. 105 ч. 2 КПК)",
        "Захист від недобросовісних заяв захисту (ст. 141 КПК)",
      ],
      fr: [
        "Immunité totale contre toute qualification pénale (Invariant Architectural L-03)",
        "Statut strict de tiers participant ou témoin désintéressé (Art. 105 al. 2 CPP)",
        "Protection contre les allégations téméraires de la défense (Art. 141 CPP)",
      ],
      en: [
        "Absolute immunity against any criminal accusation (Architectural Invariant L-03)",
        "Strict disinterested third-party witness status (Art. 105 para 2 CPC)",
        "Protection against frivolous adverse motions (Art. 141 CPC)",
      ],
    },
  },
];
