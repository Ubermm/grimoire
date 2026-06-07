// Deterministic EU AI Act risk-classification rule base (Tau-Prolog).
// Authored by hand (not LLM-generated) because it is foundational logic.
// This is the human-readable reference / Option-B program; the wizard form in
// classify-form.ts encodes the same clauses for the regulation-agnostic
// /api/validate pipeline.
//
// Decision order (Art 3 scope -> Art 5 -> GPAI -> Art 6/Annex I -> Annex III ->
// Art 50 -> minimal). Facts are asserted from the questionnaire answers as
// predicate('yes') / predicate('no').

export const CLASSIFICATION_PROLOG = `
% --- Article 5: prohibited practices (any one is terminal) ---
prohibited :- manipulative('yes').
prohibited :- social_scoring('yes').
prohibited :- facial_scraping('yes').
prohibited :- emotion_workplace('yes').
prohibited :- biometric_categorisation('yes').
prohibited :- rt_biometric_le('yes').

% --- General-purpose AI models ---
gpai_systemic :- gpai_model('yes'), systemic('yes').
gpai_only :- gpai_model('yes').

% --- High-risk (Article 6 / Annex III) ---
high_risk :- annex_i_safety('yes').
high_risk :- annex_iii_use('yes'), art6_3_exempt('no').

% --- Limited risk (Article 50 transparency) ---
limited_risk :- art50_transparency('yes').

% --- Scope ---
in_scope_system :- in_scope('yes').

% --- Cut-ordered single-binding classifier (Option B) ---
classify(prohibited)    :- prohibited, !.
classify(gpai_systemic) :- gpai_systemic, !.
classify(high)          :- high_risk, !.
classify(gpai)          :- gpai_only, !.
classify(limited)       :- limited_risk, !.
classify(minimal)       :- in_scope_system, !.
classify(out_of_scope).
`;
