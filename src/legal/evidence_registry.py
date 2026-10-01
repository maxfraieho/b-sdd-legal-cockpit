"""
Official Judicial Evidence Registry (src/legal/evidence_registry.py).
Categorizes evidence into formal Series A, B, C, D, E under Swiss judicial standards:
  - Series A: [ДОКАЗ A-01] .. [ДОКАЗ A-04] (IMMA documents, Permis B, Art. 251 CP, Art. 118 LEI)
  - Series B: [АУДІО B-01] .. [ДОКАЗ B-08] (Physical assaults, death threats, Art. 123, 126, 180, 181 CP)
  - Series C: [АУДІО C-01] .. [АУДІО C-15] (Weapons, 25k CHF fake marriage, EVAM cash, Unisanté FOR597)
  - Series D: [АУДІО D-01] .. [АУДІО D-09] ($15k USD apartment admission, car embezzlement, 46'850 CHF total damage)
  - Series E: [ФОТО E-01] .. [ДОКАЗ E-05] (Facial wounds EXIF, broken eyeglasses, forensic report Art. 139 CPP)

Enforces:
  - Invariant L-02: 100% Pure Python Standard Library (no external dependencies).
  - Invariant L-01: Bitemporal edge versioning (valid_from / valid_to).
  - Invariant L-05: Mandatory verified 64-char SHA-256 cryptographic seal.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
import hashlib
import json
import os
from pathlib import Path
import re
from typing import Dict, List, Optional, Any, Tuple, Union


class EvidenceSeries(str, Enum):
    SERIES_A = "A"  # Official & IMMA Documents / Migration Permits
    SERIES_B = "B"  # Primary Assaults & Physical Death Threats (20.07.2024)
    SERIES_C = "C"  # Weapons, Marriage Fraud & Coercive Domestic Environment
    SERIES_D = "D"  # Financial Embezzlement, $15k USD Apartment & Vehicle Diversion
    SERIES_E = "E"  # Photographic EXIF Forensics & Bodily Injuries


class EvidenceCategory(str, Enum):
    OFFICIAL_DOCUMENT = "official_document"
    AUDIO_RECORDING = "audio_recording"
    VIDEO_SCREENCAST = "video_screencast"
    MEDICAL_REPORT = "medical_report"
    PHOTOGRAPHIC_EXIF = "photographic_exif"
    FINANCIAL_LEDGER = "financial_ledger"


@dataclass
class JudicialEvidenceItem:
    """Formal piece of evidence cataloged for the Vaud Public Prosecutor's Office."""
    code: str                            # e.g. "[ДОКАЗ A-01]", "[АУДІО B-02]", "[ФОТО E-03]"
    series: EvidenceSeries
    category: EvidenceCategory
    filename: str
    sha256_hash: str                     # Strict 64-char hex string (Invariant L-05)
    date_or_period: str
    size_bytes: int = 0
    statutory_targets: List[str] = field(default_factory=list)
    description: str = ""
    room_id: str = ""                    # Target MemPalace room
    transcript_match_id: Optional[str] = None
    valid_from: str = "2024-03-16T00:00:00Z"
    valid_to: str = "9999-12-31T23:59:59Z"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "series": self.series.value,
            "category": self.category.value,
            "filename": self.filename,
            "sha256_hash": self.sha256_hash,
            "date_or_period": self.date_or_period,
            "size_bytes": self.size_bytes,
            "statutory_targets": self.statutory_targets,
            "description": self.description,
            "room_id": self.room_id,
            "transcript_match_id": self.transcript_match_id,
            "valid_from": self.valid_from,
            "valid_to": self.valid_to,
        }


# Canonical Register of 41 Primary Evidence Items from 01_ОФІЦІЙНИЙ_РЕЄСТР_РЕЧОВИХ_ДОКАЗІВ_SHA256.md
CANONICAL_JUDICIAL_ITEMS = [
    # SERIES A
    {
        "code": "[ДОКАЗ A-01]", "series": EvidenceSeries.SERIES_A, "category": EvidenceCategory.OFFICIAL_DOCUMENT,
        "filename": "olena/En ukrainien/підробку документів.md",
        "sha256_hash": "c30465a0756352ce8a139eef8331bb8061e8cfdc77eb28abef3f6e1f0e428da4",
        "date_or_period": "2024", "size_bytes": 1058, "room_id": "ROOM-157-CP",
        "statutory_targets": ["Art. 251 CP", "Art. 118 LEI"],
        "description": "Аналіз підробки документів щодо навчання в Menuhin Academy (IMMA) та фіктивного використання статусу S."
    },
    {
        "code": "[ДОКАЗ A-02]", "series": EvidenceSeries.SERIES_A, "category": EvidenceCategory.OFFICIAL_DOCUMENT,
        "filename": "DOSSIER_LEGAL_UA/ДОДАТОК_A_.../ЗВІТ_IMMA_MENUHIN_ACADEMY.md",
        "sha256_hash": "4b47977ff789b35a39783f05470c1735da3ee3b29c9efb0113f86111f1816091",
        "date_or_period": "05.09.2026", "size_bytes": 14507, "room_id": "ROOM-157-CP",
        "statutory_targets": ["Art. 251 CP"],
        "description": "Офіційний звіт криміналістичного аудиту фабрикації документів Академії Менухіна."
    },
    {
        "code": "[ДОКАЗ A-03]", "series": EvidenceSeries.SERIES_A, "category": EvidenceCategory.OFFICIAL_DOCUMENT,
        "filename": "olena/202405120915001001.jpg",
        "sha256_hash": "1c84719e934cd8341617300c3093952ba5c83cae1935667cbe588cf41f021798",
        "date_or_period": "12.05.2024", "size_bytes": 139158, "room_id": "ROOM-157-CP",
        "statutory_targets": ["Art. 118 LEI"],
        "description": "Посвідка на проживання в Швейцарії (Permis B) Любові Суворової."
    },
    {
        "code": "[ДОКАЗ A-04]", "series": EvidenceSeries.SERIES_A, "category": EvidenceCategory.OFFICIAL_DOCUMENT,
        "filename": "olena/202405120915001002.jpg",
        "sha256_hash": "c1e8a3c92bc392cba774b76c8c4a9388df679e09febebbd6ce5230554f762694",
        "date_or_period": "12.05.2024", "size_bytes": 142475, "room_id": "ROOM-157-CP",
        "statutory_targets": ["Art. 118 LEI"],
        "description": "Посвідка на проживання в Швейцарії (Permis B) Ганни Суворової."
    },

    # SERIES B
    {
        "code": "[АУДІО B-01]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/audio-lena02-лена-в-морду-арсену.mp3",
        "sha256_hash": "9127cac2aa34b0b8c56fa769d300eb058b73fa6c589a8c084adcfbe965e648be",
        "date_or_period": "2024 (00:00–00:15)", "size_bytes": 353846, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 126 CP", "Art. 180 CP"],
        "description": "Прямий аудіозапис нападу на Арсена Коваленка: погрози фізичного насильства."
    },
    {
        "code": "[АУДІО B-02]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-lena01-ганна-їде-вбивати-арсена.mp3",
        "sha256_hash": "2f2eac296f6020ed579f1bcbb82f5b4974fbf41d8e1781216964177d20a06ec9",
        "date_or_period": "2024 (02:15–03:40)", "size_bytes": 1052739, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 180 al. 2 CP", "Art. 181 CP"],
        "description": "Погрози вбивством Арсену Коваленку ('Ганна їде вбивати Арсена, виб'є зуби, втопить')."
    },
    {
        "code": "[АУДІО B-03]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-lena01-і-сина-і-тебе-забю.mp3",
        "sha256_hash": "8c86eeee967031fae8f7311bb8c983d5a5749b5cfa5d83626786c755ec035f83",
        "date_or_period": "2024 (00:45–01:20)", "size_bytes": 688537, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 180 CP", "Art. 181 CP"],
        "description": "Погрози фізичної розправи та запевнення у безкарності ('І сина, і тебе заб'ю')."
    },
    {
        "code": "[АУДІО B-04]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-lena00-заблокувати-вову.mp3",
        "sha256_hash": "ddfd66a3b4035bdf561848f2b77a01d6706e4a2d80d285098ffb4e542bf0ba84",
        "date_or_period": "2024 (00:00–00:30)", "size_bytes": 395995, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP", "Art. 24 CP"],
        "description": "Вказівка Любові Суворової заблокувати зв'язок батька з сином та посилити ізоляцію."
    },
    {
        "code": "[АУДІО B-05]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-lena02-ганна-підти-від-гімна.mp3",
        "sha256_hash": "2ba8e40221e14a4282f6e9b441f71df8aa917cf7b12d59b207dfecbc039750b3",
        "date_or_period": "2024 (00:15–00:45)", "size_bytes": 523655, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP"],
        "description": "Накази щодо розриву сімейних зв'язків та примусового підпорядкування."
    },
    {
        "code": "[АУДІО B-06]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/audio_lena03-це-не-я-моє-таке.mp3",
        "sha256_hash": "9eeb68cda635bbc93ae07153a52541a54dc6979ea44eb9527fe25206bf8a023b",
        "date_or_period": "2024 (00:10–00:35)", "size_bytes": 482094, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP"],
        "description": "Заява Олени про стан психологічного контролю та тиску з боку Суворової."
    },
    {
        "code": "[АУДІО B-07]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.VIDEO_SCREENCAST,
        "filename": "video-dokazy/03_az_recorder_20240718_143131.mp4",
        "sha256_hash": "6b8a7de6687664f02d9bb4e6378e9067be21a9953ad763fa289650ea26210f63",
        "date_or_period": "18.07.2024", "size_bytes": 77609204, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP"],
        "description": "Вербальний тиск, докори за відправку допомоги батькові та диктат умов проживання."
    },
    {
        "code": "[ДОКАЗ B-08]", "series": EvidenceSeries.SERIES_B, "category": EvidenceCategory.OFFICIAL_DOCUMENT,
        "filename": "DOSSIER_ARSEN_.../01_PROCES_VERBAL_DECLARATION_ARSEN.md",
        "sha256_hash": "757cdb279c32e8d8ee466a9d701dfc1363574c83faae9e078c117d6928e4693a",
        "date_or_period": "05.09.2026", "size_bytes": 14962, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 115 CPP", "Art. 180 CP"],
        "description": "Письмові показання потерпілого Арсена Коваленка щодо побиття 20.07.2024."
    },

    # SERIES C
    {
        "code": "[АУДІО C-01]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio/enhanced_audio-lena01-про-вкрадені-гроші.mp3",
        "sha256_hash": "099d99be932e2a1883be77ef3e3f426177b8b209d738f6b0f4492d5c417676e9",
        "date_or_period": "2024 (05:12–06:05)", "size_bytes": 1255841, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 146 CP", "Art. 181 CP"],
        "description": "Залякування та заяви про безкарність неповернення вкрадених коштів."
    },
    {
        "code": "[АУДІО C-02]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.VIDEO_SCREENCAST,
        "filename": "video-dokazy/02_1.mp4",
        "sha256_hash": "484155de648fe5cf40232491a92e105b42d13143c72b22bb95f57ca5967aa163",
        "date_or_period": "2024", "size_bytes": 105658604, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 118 LEI", "Art. 180 CP"],
        "description": "Запис погроз ('якби я з пушкою була') та розкриття схеми фіктивного шлюбу за 25'000 CHF."
    },
    {
        "code": "[АУДІО C-03]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-lena01-лена-з-пушкою.mp3",
        "sha256_hash": "43c93ee364a8fce5bb14631317dc5568ef2fa163ba3194aeb53c150c9b687f87",
        "date_or_period": "2024 (00:25–00:55)", "size_bytes": 628994, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 180 CP"],
        "description": "Погрози застосування вогнепальної зброї проти членів сім'ї."
    },
    {
        "code": "[АУДІО C-04]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.VIDEO_SCREENCAST,
        "filename": "video-dokazy/04_az_recorder_20240718_145214_edited.mp4",
        "sha256_hash": "3cbfea3aaab77a7e8e527096e43f114c029eb10a26e6ef296ec54a37a9301e14",
        "date_or_period": "18.07.2024", "size_bytes": 68482011, "room_id": "ROOM-157-CP",
        "statutory_targets": ["Art. 157 CP", "Art. 181 CP"],
        "description": "Економічний тиск, вимагання доходів від роботи Арсена в готелі та позбавлення коштів."
    },
    {
        "code": "[АУДІО C-05]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.VIDEO_SCREENCAST,
        "filename": "video-dokazy/05_az_recorder_20240718_202722.mp4",
        "sha256_hash": "c59a241b4212caed96bb434388654ff456e07662c5598ce315e982ec45cb06bb",
        "date_or_period": "18.07.2024", "size_bytes": 84158902, "room_id": "ROOM-157-CP",
        "statutory_targets": ["Art. 118 LEI"],
        "description": "Приховування готівки від EVAM (6'000–8'000 CHF) з метою збереження соціальних виплат."
    },
    {
        "code": "[АУДІО C-06]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-lena00-люба-штук-триста-перебрати.mp3",
        "sha256_hash": "4b9b9e8c20f12ec686cb8cf112a2a00c6d7a5b3a4a9042b4742a176843472097",
        "date_or_period": "2024 (00:00–00:20)", "size_bytes": 384112, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 146 CP"],
        "description": "Вказівки Любові Суворової щодо фінансових маніпуляцій та контролю готівки."
    },
    {
        "code": "[АУДІО C-07]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.VIDEO_SCREENCAST,
        "filename": "audio2/стань-там.mp4",
        "sha256_hash": "a38b3f29e0e9bac1d02c89be6f2d87e076a02b1f8ebf955d496a77d4c82b9821",
        "date_or_period": "2024", "size_bytes": 14210450, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP"],
        "description": "Фізичний нагляд та примусові накази щодо обмеження пересування Арсена."
    },
    {
        "code": "[ДОКАЗ C-08]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.PHOTOGRAPHIC_EXIF,
        "filename": "olena/Screenshot_20240325-062426_Telegram.png",
        "sha256_hash": "47a7ca26f94601fd5839ce6b9f298da5b6b1cb18cb30e527f547e8ea792c30f8",
        "date_or_period": "25.03.2024 06:24", "size_bytes": 412850, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 138 CP", "Art. 146 CP"],
        "description": "Письмове підтвердження незаконного привласнення $15'000 USD та відмови у поверненні."
    },
    {
        "code": "[ДОКАЗ C-09]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.PHOTOGRAPHIC_EXIF,
        "filename": "Лена/Абу Мухаммад/IMG_20240407_173006_566.jpg",
        "sha256_hash": "7d463c84579c079db68984920625ce5a439266ab3e1c66f7d5c9e223d6a4a2b9",
        "date_or_period": "07.04.2024 17:30", "size_bytes": 521400, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP"],
        "description": "Комунікації під примусом через анонімні акаунти для психологічного залякування."
    },
    {
        "code": "[ДОКАЗ C-10]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.MEDICAL_REPORT,
        "filename": "olena/Арсен/202408051958171001.jpg",
        "sha256_hash": "fc3c4d4094222ce5b441f71424ad4f62bf9f045a1c322b62d854eb1374d6f461",
        "date_or_period": "05.08.2024 19:58", "size_bytes": 256794, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 123 CP", "Art. 180 CP", "Art. 47 CO"],
        "description": "Офіційний медичний висновок FOR597 Unisanté: гострий стрес та травматичні наслідки насильства."
    },
    {
        "code": "[ДОКАЗ C-11]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.OFFICIAL_DOCUMENT,
        "filename": "olena/Sonate Solidare/EVAM PETTITT JONATHAN KOVALENKO ARSEN BAIL 06.12.2025.pdf",
        "sha256_hash": "8ab7c8ba76d5ad01b63efeb42e88a0b06a4613ffb7a5a8eb82f8a846c92bc9da",
        "date_or_period": "06.12.2025", "size_bytes": 204800, "room_id": "ROOM-186-CP",
        "statutory_targets": ["Art. 186 CP", "Art. 24 LARA"],
        "description": "Договір оренди житла EVAM на ім'я Арсена: підтвердження виключного права на житло."
    },
    {
        "code": "[АУДІО C-12]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-він-нічого-не-може-доказати-юля-сказала.mp3",
        "sha256_hash": "378f9e3c896f196cc7a683ec24ebda89b4f97e68ad1e6aa32a9a97f26194b1a4",
        "date_or_period": "12.07.2024 (02:15–02:45)", "size_bytes": 745812, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 146 CP", "Art. 303 CP"],
        "description": "Змова з третіми особами та переконаність у неможливості доведення розтрати."
    },
    {
        "code": "[АУДІО C-13]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-давай-в-суд-що-я-скажу-судді.mp3",
        "sha256_hash": "92ec24495d2e93f3d7904721c0ea5b5832a4e21a22129baeb0ff34a15a0cbb0c",
        "date_or_period": "12.07.2024 (05:40–06:10)", "size_bytes": 712045, "room_id": "ROOM-303-CP",
        "statutory_targets": ["Art. 303 CP", "Art. 304 CP"],
        "description": "Навчання дачі неправдивих свідчень швейцарському судді та поліції."
    },
    {
        "code": "[АУДІО C-14]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-люба-суворова-вибиває-двері-машина.mp3",
        "sha256_hash": "92b3411d171b0c8b6727beaa167098dfbf45ce7c56911c4710ca0f80bb5131ca",
        "date_or_period": "2024 (01:20–01:50)", "size_bytes": 814520, "room_id": "ROOM-186-CP",
        "statutory_targets": ["Art. 186 CP", "Art. 181 CP"],
        "description": "Силовий напад Любові Суворової та спроба вибивання дверей помешкання."
    },
    {
        "code": "[АУДІО C-15]", "series": EvidenceSeries.SERIES_C, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-лена-погроза-побиттям-і-напад.mp3",
        "sha256_hash": "7a2617d1539732708379034651e8f9fb774e62b3994fc7bf4a43cd06d0c830cf",
        "date_or_period": "2024 (00:45–01:15)", "size_bytes": 714853, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 126 CP", "Art. 180 CP"],
        "description": "Фізичний напад та погрози побиттям Оленою за прямою інструкцією Суворової."
    },

    # SERIES D
    {
        "code": "[АУДІО D-01]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio/gana-5.m4a",
        "sha256_hash": "2a6cef2dc10e5cb7d647a5ad203b50ec4d55f09fc374b6921d25e1c9d629bba8",
        "date_or_period": "2024", "size_bytes": 779627, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 138 CP", "Art. 146 CP"],
        "description": "Заява Ганни Суворової про те, що 15'000 USD належали Володимиру та Олені."
    },
    {
        "code": "[АУДІО D-02]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio/vasya-borg.m4a",
        "sha256_hash": "57e796cb20e8eafd30d3549a0e43bc6996f8d2dbbc952c129965fb84b600bc34",
        "date_or_period": "2024", "size_bytes": 1910699, "room_id": "ROOM-138-CP",
        "statutory_targets": ["Art. 138 CP"],
        "description": "Визнання заборгованості та спору щодо майна, придбаного за кошти Володимира Коваленка."
    },
    {
        "code": "[АУДІО D-03]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio/luba2019.mp3",
        "sha256_hash": "d335e29aec863f1ef5af0990d0d3cc08ac40740d984e042c18bb4ff18cea08c5",
        "date_or_period": "2019–2024", "size_bytes": 12564909, "room_id": "ROOM-138-CP",
        "statutory_targets": ["Art. 138 CP"],
        "description": "Хронологія фінансового конфлікту та неправомірних фінансових претензій Любові Суворової."
    },
    {
        "code": "[АУДІО D-04]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio/luba-groshi.m4a",
        "sha256_hash": "6eeea685d0475637356cf08f2c89eb68fc0ec30d4a079ca735d458e11242c8db",
        "date_or_period": "2024", "size_bytes": 340177, "room_id": "ROOM-138-CP",
        "statutory_targets": ["Art. 138 CP"],
        "description": "Відмова у поверненні коштів та висунення безпідставних матеріальних претензій."
    },
    {
        "code": "[ДОКАЗ D-05]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.FINANCIAL_LEDGER,
        "filename": "DOSSIER_LEGAL_UA/ДОДАТОК_D_.../ТАБЛИЦЯ_МАТЕРІАЛЬНИХ_ЗБИТКІВ.md",
        "sha256_hash": "01af271ee5eac2ee2eef3810bdc2168391792a9a1711d051a19335805b1cba25",
        "date_or_period": "05.09.2026", "size_bytes": 7669, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 138 CP", "Art. 146 CP", "Art. 41 CO"],
        "description": "Деталізований розрахунок матеріальних, прямих та моральних збитків на загальну суму 46'850 CHF."
    },
    {
        "code": "[АУДІО D-06]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/enhanced_audio-арсен-ганна-15-тисяч-доларів-квартира.mp3",
        "sha256_hash": "f5010fa9efb535c74316bf2f1ed3c328a542f47be9d6baaf282bc944f3c584b3",
        "date_or_period": "2024 (00:00–00:47)", "size_bytes": 1155591, "room_id": "ROOM-146-CP",
        "statutory_targets": ["Art. 146 CP", "Art. 138 CP"],
        "description": "Пряме аудіовизнання 15'000 USD: Ганна підтверджує купівлю квартири за 15k USD за участі Володимира."
    },
    {
        "code": "[АУДІО D-07]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-мати-і-люба-вивели-з-сімї-всі-гроші.mp3",
        "sha256_hash": "34a09f9070634b6832a852cae287641040368ab8c8b664226f1004a8bc2bb465",
        "date_or_period": "16.03.2024 (25:15–25:45)", "size_bytes": 721777, "room_id": "ROOM-138-CP",
        "statutory_targets": ["Art. 138 CP", "Art. 24 CP"],
        "description": "Викриття факту, що мати разом із сестрою Любов'ю Суворовою вивели всі кошти зі спільного бюджету."
    },
    {
        "code": "[АУДІО D-08]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-люба-купували-васю-за-наші-гроші-в-суд-нічого-не-зробиш.mp3",
        "sha256_hash": "d49fa487cc022e420a2cbe5b32966eb419de1dd65d0b5bb773dbe712e7f3054b",
        "date_or_period": "2019–2024 (07:05–08:25)", "size_bytes": 1921581, "room_id": "ROOM-138-CP",
        "statutory_targets": ["Art. 138 CP", "Art. 146 CP"],
        "description": "Розтрата спільних коштів на купівлю авто Васі та упевненість у безкарності."
    },
    {
        "code": "[АУДІО D-09]", "series": EvidenceSeries.SERIES_D, "category": EvidenceCategory.AUDIO_RECORDING,
        "filename": "audio_cited/restored_audio-грошей-в-мене-немає-їх-завезли.mp3",
        "sha256_hash": "ac963dfe35bebd12a61c84d98f8a071e48755634aaa6dcbf78df8dcf0e99eaad",
        "date_or_period": "18.07.2024 (09:10–09:45)", "size_bytes": 841605, "room_id": "ROOM-138-CP",
        "statutory_targets": ["Art. 138 CP"],
        "description": "Таємне вивезення та приховування готівки: телефонне зізнання Олени матері про обман Володимира."
    },

    # SERIES E
    {
        "code": "[ФОТО E-01]", "series": EvidenceSeries.SERIES_E, "category": EvidenceCategory.PHOTOGRAPHIC_EXIF,
        "filename": "photos_cited/IMG_20240717_074342_359.jpg",
        "sha256_hash": "f3da5f881bc043dbbd715bd5d96c34f92a68699269c57f5f73dbc98d9ca380ae",
        "date_or_period": "17.07.2024 07:43", "size_bytes": 115230, "room_id": "ROOM-123-CP",
        "statutory_targets": ["Art. 123 CP", "Art. 126 CP"],
        "description": "Судово-медична фотофіксація дермабразій та набряку повік у Арсена Коваленка внаслідок нападу 17.07.2024."
    },
    {
        "code": "[ФОТО E-02]", "series": EvidenceSeries.SERIES_E, "category": EvidenceCategory.PHOTOGRAPHIC_EXIF,
        "filename": "photos_cited/IMG_20240801_113841_470.jpg",
        "sha256_hash": "5907e05ffc025ea1dd0cafeeff6937b94e19b7983b9181c57bc80d3fb457f46f",
        "date_or_period": "01.08.2024 11:38", "size_bytes": 254038, "room_id": "ROOM-180-181-CP",
        "statutory_targets": ["Art. 181 CP"],
        "description": "Фіксація вилучення ключів, перешкоджання доступу до житла та залишкових фізичних слідів ушкоджень."
    },
    {
        "code": "[ФОТО E-03]", "series": EvidenceSeries.SERIES_E, "category": EvidenceCategory.PHOTOGRAPHIC_EXIF,
        "filename": "photos_cited/IMG_20240808_112954_717.jpg",
        "sha256_hash": "057c6a5bdd3d90d9e8015637bda94f9e5a2fd54937cc1368daeb356bf2463f1a",
        "date_or_period": "08.08.2024 11:29", "size_bytes": 124216, "room_id": "ROOM-144-CP",
        "statutory_targets": ["Art. 123 CP", "Art. 144 CP"],
        "description": "Фотофіксація рваних саден на обличчі та деформації оправи окулярів після нападу 08.08.2024 (шкода 850 CHF)."
    },
    {
        "code": "[ФОТО E-04]", "series": EvidenceSeries.SERIES_E, "category": EvidenceCategory.PHOTOGRAPHIC_EXIF,
        "filename": "photos_cited/olena_IMG_20240808_112954_717.jpg",
        "sha256_hash": "057c6a5bdd3d90d9e8015637bda94f9e5a2fd54937cc1368daeb356bf2463f1a",
        "date_or_period": "08.08.2024 11:29", "size_bytes": 124216, "room_id": "ROOM-144-CP",
        "statutory_targets": ["Art. 144 CP"],
        "description": "Криміналістичний дублікат, що підтверджує незмінність та ланцюг збереження доказів."
    },
    {
        "code": "[ДОКАЗ E-05]", "series": EvidenceSeries.SERIES_E, "category": EvidenceCategory.MEDICAL_REPORT,
        "filename": "DOSSIER_LEGAL_UA/ДОДАТОК_E_.../ЕКСПЕРТИЗА_ПОБОЇВ_АРСЕНА.md",
        "sha256_hash": "98f75c19011b7ed1cb5e26657eb74c653916b56dbe0decb1885068e32f1cf201",
        "date_or_period": "05.09.2026", "size_bytes": 7708, "room_id": "ROOM-123-CP",
        "statutory_targets": ["Art. 139 CPP", "Art. 123 CP"],
        "description": "Техніко-криміналістичний аналіз, що засвідчує автентичність цифрових метаданих зйомки та повну допустимість."
    },
]


class JudicialEvidenceRegistry:
    """
    Master registry governing judicial Series A, B, C, D, E under Swiss standards.
    """

    def __init__(self):
        self.items: Dict[str, JudicialEvidenceItem] = {}
        self._load_canonical_series()

    def _load_canonical_series(self):
        """Populates the 41 canonical items."""
        for d in CANONICAL_JUDICIAL_ITEMS:
            # Enforce Invariant L-05
            h = d["sha256_hash"]
            if not h or len(h) != 64 or not all(c in "0123456789abcdefABCDEF" for c in h):
                raise ValueError(f"Invariant L-05 Violation: Item {d['code']} has invalid SHA-256 seal: {h}")

            item = JudicialEvidenceItem(
                code=d["code"],
                series=d["series"],
                category=d["category"],
                filename=d["filename"],
                sha256_hash=h.lower(),
                date_or_period=d["date_or_period"],
                size_bytes=d.get("size_bytes", 0),
                statutory_targets=d["statutory_targets"],
                description=d["description"],
                room_id=d.get("room_id", "ROOM-180-181-CP"),
            )
            self.items[item.code] = item

    def get_item(self, code: str) -> Optional[JudicialEvidenceItem]:
        """Looks up an item by its exact code, e.g. '[ДОКАЗ A-01]' or 'ДОКАЗ A-01'."""
        clean = code.strip()
        if not clean.startswith("["):
            clean = f"[{clean}]"
        return self.items.get(clean)

    def get_by_series(self, series: Union[EvidenceSeries, str]) -> List[JudicialEvidenceItem]:
        """Returns all evidence items belonging to a designated Series (A, B, C, D, or E)."""
        val = series.value if isinstance(series, EvidenceSeries) else series.upper().replace("SERIES_", "")
        return [it for it in self.items.values() if it.series.value == val]

    def get_by_room(self, room_id: str) -> List[JudicialEvidenceItem]:
        """Returns all evidence items mapped to a given MemPalace Room."""
        return [it for it in self.items.values() if it.room_id == room_id]

    def map_transcripts(self, transcripts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Maps existing 61 transcripts from dossier_benchmark to official Series A..E codes.
        Returns match matrix and unmapped count.
        """
        mapped = {}
        for tr in transcripts:
            fn = tr.get("filename", "").lower()
            tid = tr.get("drawer_id", "")

            matched_code = None
            for item in self.items.values():
                item_fn = item.filename.lower()
                base_fn = Path(item.filename).name.lower()
                if base_fn in fn or fn in item_fn or (tr.get("sha256") and tr["sha256"] == item.sha256_hash):
                    matched_code = item.code
                    item.transcript_match_id = tid
                    break

            mapped[tid] = {
                "filename": tr.get("filename"),
                "official_code": matched_code or "UNMAPPED_RAW_TRANSCRIPT",
                "sha256": tr.get("sha256"),
                "room_id": tr.get("room_id")
            }

        return {
            "total_transcripts": len(transcripts),
            "matched_official_count": len([v for v in mapped.values() if v["official_code"] != "UNMAPPED_RAW_TRANSCRIPT"]),
            "mappings": mapped
        }

    def export_to_json(self, indent: int = 2) -> str:
        """Exports the entire evidence registry to JSON."""
        data = {
            "metadata": {
                "title": "Офіційний судовий реєстр речових доказів (Серії A, B, C, D, E)",
                "authority": "Ministère public du canton de Vaud",
                "total_items": len(self.items),
                "series_counts": {
                    "A": len(self.get_by_series("A")),
                    "B": len(self.get_by_series("B")),
                    "C": len(self.get_by_series("C")),
                    "D": len(self.get_by_series("D")),
                    "E": len(self.get_by_series("E")),
                }
            },
            "items": [it.to_dict() for it in self.items.values()]
        }
        return json.dumps(data, indent=indent, ensure_ascii=False)
