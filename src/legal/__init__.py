"""
B-SDD Legal Operator Workbench Core Package.
Pure Standard Library implementations of Actor Matrix and Bitemporal Timeline Calibrator.
Compliant with ADR-002, ADR-010, and B-SDD Legal Architectural Charter.
"""
from src.legal.actors import (
    ProceduralStatus,
    RelationType,
    ActorEntity,
    ActorRelation,
    ActorMatrix,
    BENCHMARK_ACTORS,
    create_swiss_benchmark_matrix,
)
from src.legal.timeline_calibrator import (
    BitemporalFactEvent,
    TimelineCalibrator,
)
from src.legal.advocate_voice_notes import (
    AdvocateVoiceNote,
    AdvocateVoiceNoteEngine,
    AudioSegment,
    SwissArticleSubsumption,
    NoteStatus,
    InvariantViolationError,
    BonaFideProtectionViolation,
    AdultVictimProtectionViolation,
    CryptographicSealMismatchError,
)
from src.legal.feedback_supervisor import (
    ReconciliationSupervisor,
    ReconciliationRequest,
    ReconciliationVerdict,
    HandlerType,
    ReconciliationStatus,
    SequentialStep,
)

__all__ = [
    "ProceduralStatus",
    "RelationType",
    "ActorEntity",
    "ActorRelation",
    "ActorMatrix",
    "BENCHMARK_ACTORS",
    "create_swiss_benchmark_matrix",
    "BitemporalFactEvent",
    "TimelineCalibrator",
    "AdvocateVoiceNote",
    "AdvocateVoiceNoteEngine",
    "AudioSegment",
    "SwissArticleSubsumption",
    "NoteStatus",
    "InvariantViolationError",
    "BonaFideProtectionViolation",
    "AdultVictimProtectionViolation",
    "CryptographicSealMismatchError",
    "ReconciliationSupervisor",
    "ReconciliationRequest",
    "ReconciliationVerdict",
    "HandlerType",
    "ReconciliationStatus",
    "SequentialStep",
]


