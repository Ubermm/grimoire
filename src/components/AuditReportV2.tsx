//@ts-nocheck
// AuditReportV2 — redesigned FDA audit report PDF in the product's
// scholarly-press editorial language: warm paper, hairline rules, square
// corners, Times for the law and Courier for the apparatus. Built entirely
// on the PDF standard 14 fonts (no Font.register, no network fetch for
// type). Verdict marks are WinAnsi-safe ASCII: '|-' proven, 'x' refuted,
// '!' escalate, 'Q.E.D.' as the overall pass stamp (the proof glyphs
// ⊢ / ∎ are not in WinAnsi and would render as blanks in Courier).
//
// External contract is identical to src/components/AuditReport.tsx
// (default export, props { audit }, PDFViewer + "Open in New Window"),
// and the data-fetching logic is copied verbatim — only the document
// design changed. Rollback = re-point the dynamic import in
// src/app/(main)/audit/[id]/page.tsx back to '@/components/AuditReport'.
import React, { useState, useEffect } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  pdf
} from '@react-pdf/renderer';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

/* ------------------------------------------------------------------ tokens */

const PAPER = '#faf9f6';
const INK = '#141310';
const MUTED = '#5b574d';
const HAIRLINE = '#d9d5cd';
const PASS = '#047857';
const FAIL = '#b91c1c';
const ESCALATE = '#b45309';

const VERDICT = {
  pass: { mark: '|-', color: PASS, word: 'proven' },
  fail: { mark: 'x', color: FAIL, word: 'refuted' },
  escalate: { mark: '!', color: ESCALATE, word: 'escalate' },
};

// Prefer the structured status array; fall back to the legacy passed[] of
// booleans-or-'true'/'false' strings.
const verdictOf = (results, idx) => {
  const s = results?.status?.[idx];
  if (s === 'pass' || s === 'fail' || s === 'escalate') return s;
  const p = results?.passed?.[idx];
  return p === true || p === 'true' ? 'pass' : 'fail';
};

/* ------------------------------------------------------------------ styles */

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    paddingTop: 46,
    paddingHorizontal: 50,
    paddingBottom: 64,
    fontFamily: 'Times-Roman',
    color: INK,
  },

  /* running head */
  runningHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: `1 solid ${HAIRLINE}`,
    paddingBottom: 7,
    marginBottom: 26,
  },
  runningHeadLeft: {
    fontFamily: 'Courier',
    fontSize: 7,
    letterSpacing: 1.4,
    color: INK,
  },
  runningHeadRight: {
    fontFamily: 'Courier',
    fontSize: 7,
    letterSpacing: 1.4,
    color: MUTED,
  },

  /* title + colophon */
  title: {
    fontFamily: 'Times-Roman',
    fontSize: 25,
    lineHeight: 1.15,
    color: INK,
    marginBottom: 4,
  },
  titleKicker: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
    color: MUTED,
    marginBottom: 20,
  },
  colophon: {
    borderTop: `1 solid ${HAIRLINE}`,
    marginBottom: 30,
  },
  colophonRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderBottom: `1 solid ${HAIRLINE}`,
    paddingVertical: 5,
  },
  colophonLabel: {
    fontFamily: 'Courier',
    fontSize: 7,
    letterSpacing: 1.2,
    color: MUTED,
    width: 110,
  },
  colophonValue: {
    fontFamily: 'Times-Roman',
    fontSize: 9.5,
    color: INK,
    flex: 1,
  },

  /* subsection heading */
  section: {
    marginBottom: 22,
  },
  sectionRule: {
    borderTop: `1 solid ${HAIRLINE}`,
    paddingTop: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sectionMark: {
    fontFamily: 'Courier-Bold',
    fontSize: 11,
    color: MUTED,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 13,
    color: INK,
  },

  /* question rows — ruled list, not a bordered table */
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `1 solid ${HAIRLINE}`,
    paddingVertical: 6,
  },
  questionMain: {
    flex: 1,
    paddingRight: 14,
  },
  questionText: {
    fontFamily: 'Times-Roman',
    fontSize: 9.5,
    lineHeight: 1.35,
    color: INK,
  },
  questionRef: {
    fontFamily: 'Courier',
    fontSize: 7.5,
    color: MUTED,
    marginTop: 2,
  },
  questionResponse: {
    fontFamily: 'Courier-Bold',
    fontSize: 9,
    color: INK,
    maxWidth: 150,
    textAlign: 'right',
  },
  questionResponseEmpty: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: MUTED,
    maxWidth: 150,
    textAlign: 'right',
  },

  /* validation apparatus */
  blockLabel: {
    fontFamily: 'Courier',
    fontSize: 7,
    letterSpacing: 1.2,
    color: MUTED,
    marginTop: 10,
    marginBottom: 5,
  },
  verdictLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3.5,
  },
  verdictMark: {
    fontFamily: 'Courier-Bold',
    fontSize: 8.5,
    width: 18,
  },
  verdictText: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    lineHeight: 1.35,
    flex: 1,
  },
  verdictReason: {
    fontFamily: 'Times-Italic',
    color: MUTED,
  },
  qedLine: {
    fontFamily: 'Courier-Bold',
    fontSize: 8.5,
    color: PASS,
    marginTop: 3,
    marginLeft: 18,
  },
  emptyNote: {
    fontFamily: 'Times-Italic',
    fontSize: 9,
    color: MUTED,
  },

  /* consolidated auditor comments (front matter) */
  commentSection: {
    marginBottom: 30,
  },
  commentRow: {
    paddingVertical: 6,
  },
  commentRowRule: {
    borderTop: `1 solid ${HAIRLINE}`,
  },
  commentRef: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
  },
  commentDeepTag: {
    fontFamily: 'Courier',
    fontSize: 7.5,
    color: MUTED,
  },
  commentText: {
    fontFamily: 'Times-Italic',
    fontSize: 9.5,
    lineHeight: 1.4,
    color: INK,
  },

  /* end matter */
  disclaimer: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    lineHeight: 1.4,
    color: MUTED,
    marginTop: 28,
    borderTop: `1 solid ${HAIRLINE}`,
    paddingTop: 8,
  },

  /* fixed footer */
  footer: {
    position: 'absolute',
    left: 50,
    right: 50,
    bottom: 26,
    borderTop: `1 solid ${HAIRLINE}`,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'Courier',
    fontSize: 7,
    color: MUTED,
  },
});

/* ------------------------------------------------- data fetching (as V1) */

// Helper function to load deep questions
const loadDeepQuestions = async (code, currentFormData) => {
  try {
    const warnL = await fetch('/api/topk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cfrSubsection: code
      })
    });

    const Ls = await warnL.json();

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cfrSubsection: code,
        form: currentFormData,
        warningLetters: Ls.warningLetters || []
      })
    });

    if (!response.ok) throw new Error('Failed to load deep questions');

    return await response.json();
  } catch (error) {
    console.error('Error loading deep questions:', error);
    return null;
  }
};

/* ---------------------------------------------------------------- document */

const ValidationBlock = ({ label, results }) => {
  if (!results || !results.description?.length) {
    return (
      <View wrap={false}>
        <Text style={styles.blockLabel}>{label}</Text>
        <Text style={styles.emptyNote}>No validation recorded — section not yet answered.</Text>
      </View>
    );
  }

  const verdicts = results.description.map((_, idx) => verdictOf(results, idx));
  const allPass = verdicts.every((v) => v === 'pass');

  return (
    <View>
      <Text style={styles.blockLabel}>{label}</Text>
      {results.description.map((desc, idx) => {
        const v = VERDICT[verdicts[idx]];
        const reason = results.reason?.[idx];
        return (
          <View key={idx} style={styles.verdictLine} wrap={false}>
            <Text style={[styles.verdictMark, { color: v.color }]}>{v.mark}</Text>
            <Text style={[styles.verdictText, { color: v.color }]}>
              {desc}
              {reason ? <Text style={styles.verdictReason}>{'  — ' + reason}</Text> : null}
            </Text>
          </View>
        );
      })}
      {allPass && <Text style={styles.qedLine}>Q.E.D.</Text>}
    </View>
  );
};

const AuditReportDoc = ({ audit, questionDetails, deepForms, includeComments = true, includeDeep = true }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const colophon = [
    ['AUDIT ID', String(audit._id || '—')],
    ['FACILITY', audit.metadata?.facility || 'N/A'],
    ['DEPARTMENT', audit.metadata?.department || 'N/A'],
    ['REVIEWER', audit.metadata?.reviewer || 'N/A'],
    ['AUDIT TYPE', audit.metadata?.auditType || 'N/A'],
    ['GENERATED', formatDate(new Date())],
  ];

  // Front-matter comment apparatus: one entry per subsection that carries a
  // comment (or a deep-stage comment when the deep apparatus is included).
  const commentEntries = includeComments
    ? audit.subsections
        .map((subsection, index) => ({ subsection, index }))
        .filter(({ subsection }) => subsection.comment || (includeDeep && subsection.deepComment))
    : [];

  return (
    <Document title={`Compliance audit report — ${audit.name || ''}`}>
      <Page size="A4" style={styles.page}>

        {/* running head */}
        <View style={styles.runningHead} fixed>
          <Text style={styles.runningHeadLeft}>GRIMOIRE ONE — COMPLIANCE AUDIT REPORT</Text>
          <Text style={styles.runningHeadRight}>evidence |- verdict</Text>
        </View>

        {/* title block */}
        <Text style={styles.title}>{audit.name || 'Compliance Audit Report'}</Text>
        <Text style={styles.titleKicker}>
          FDA 21 CFR audit — a pass is a theorem; this report is its proof.
        </Text>

        {/* metadata colophon */}
        <View style={styles.colophon}>
          {colophon.map(([label, value]) => (
            <View key={label} style={styles.colophonRow} wrap={false}>
              <Text style={styles.colophonLabel}>{label}</Text>
              <Text style={styles.colophonValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* consolidated auditor comments — front matter, before the first § */}
        {commentEntries.length > 0 && (
          <View style={styles.commentSection}>
            <Text style={styles.blockLabel}>AUDITOR COMMENTS</Text>
            {commentEntries.map(({ subsection, index }, rowIdx) => (
              <View
                key={subsection.id || index}
                style={rowIdx > 0 ? [styles.commentRow, styles.commentRowRule] : styles.commentRow}
                wrap={false}
              >
                <Text style={styles.commentRef}>{`§ ${index + 1} — ${subsection.code}`}</Text>
                {subsection.comment ? (
                  <Text style={styles.commentText}>{subsection.comment}</Text>
                ) : null}
                {includeDeep && subsection.deepComment ? (
                  <Text style={styles.commentText}>
                    <Text style={styles.commentDeepTag}>{'deep — '}</Text>
                    {subsection.deepComment}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* subsections */}
        {audit.subsections.map((subsection, index) => {
          const deepQuestions = (deepForms[subsection.code]?.questions || []).filter(
            (q) => parseInt(q.cfr_reference) === parseInt(subsection.code)
          );
          const hasDeep = includeDeep && (deepQuestions.length > 0 || !!subsection.deepValidationResults);

          return (
            <View key={subsection.id || index} style={styles.section}>
              {/* § heading */}
              <View style={styles.sectionRule} wrap={false}>
                <Text style={styles.sectionMark}>{'§ ' + (index + 1)}</Text>
                <Text style={styles.sectionTitle}>{'— ' + subsection.code}</Text>
              </View>

              {/* questions as ruled list rows */}
              {Object.entries(questionDetails)
                .filter(([, question]) => parseInt(question.cfr_reference) === parseInt(subsection.code))
                .map(([questionId, question]) => {
                  const response = subsection.responses?.find((r) => r.questionId === questionId);
                  return (
                    <View key={questionId} style={styles.questionRow} wrap={false}>
                      <View style={styles.questionMain}>
                        <Text style={styles.questionText}>{question.text || '—'}</Text>
                        <Text style={styles.questionRef}>21 CFR {question.cfr_reference || 'n/a'}</Text>
                      </View>
                      <Text style={response?.answer ? styles.questionResponse : styles.questionResponseEmpty}>
                        {response?.answer || 'not answered'}
                      </Text>
                    </View>
                  );
                })}

              {/* standard validation */}
              <ValidationBlock label="VALIDATION" results={subsection.validationResults} />

              {/* deep / edge-case apparatus — only when there is data */}
              {hasDeep && (
                <View>
                  <Text style={styles.blockLabel}>
                    DEEP VALIDATION — DERIVED FROM FDA WARNING LETTERS
                  </Text>
                  {deepQuestions.map((question, qIdx) => {
                    const response =
                      subsection.deepResponses?.find((r) => r.questionId === question.id) ||
                      subsection.deepResponses?.[qIdx];
                    return (
                      <View key={qIdx} style={styles.questionRow} wrap={false}>
                        <View style={styles.questionMain}>
                          <Text style={styles.questionText}>{question.text || '—'}</Text>
                          <Text style={styles.questionRef}>21 CFR {question.cfr_reference || 'n/a'}</Text>
                        </View>
                        <Text style={response?.answer ? styles.questionResponse : styles.questionResponseEmpty}>
                          {response?.answer || 'not answered'}
                        </Text>
                      </View>
                    );
                  })}
                  {subsection.deepValidationResults && (
                    <ValidationBlock label="EDGE-CASE VERDICTS" results={subsection.deepValidationResults} />
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* end matter */}
        <Text style={styles.disclaimer}>
          This report was generated automatically by Grimoire One, Grimoire.Corp&apos;s compliance
          audit engine. It is provided &quot;as is&quot;, without warranty of any kind, expressed or implied,
          including merchantability or fitness for a particular purpose. © {new Date().getFullYear()} Grimoire.Corp.
        </Text>

        {/* fixed footer on every page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Grimoire One — the verdict follows from the evidence
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

/* --------------------------------------------------------------- component */

const AuditReportV2 = ({ audit, includeComments = true, includeDeep = true }) => {
  const [questionDetails, setQuestionDetails] = useState({});
  const [deepForms, setDeepForms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDeepLoading, setIsDeepLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all questions for each subsection
        const details = {};
        for (const subsection of audit.subsections) {
          try {
            // Fetch all questions for this subsection's form
            const regsResponse = await fetch(`/api/regulations?code=${encodeURIComponent(subsection.code)}`);
            if (!regsResponse.ok) throw new Error('Failed to fetch regulation');
            const regulation = await regsResponse.json();

            // Get form code from regulation
            const formKey = regulation.FormCode;
            if (!formKey) throw new Error('No form code found in regulation');
            const formsResponse = await fetch(`/api/forms?code=${encodeURIComponent(formKey)}`);
            if (formsResponse.ok) {
              const formData = await formsResponse.json();

              // Add all questions from the form to our details object
              if (formData.FormText && formData.FormText.questions) {
                formData.FormText.questions.forEach(question => {
                  details[question.id] = question;
                });
              }
            }
          } catch (error) {
            console.error(`Failed to fetch questions for subsection ${subsection.code}:`, error);
          }
        }
        setQuestionDetails(details);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [audit]);

  // Deep forms are generation calls (/api/topk + /api/generate) — only fetch
  // them when the deep apparatus is requested, and only for subsections we
  // don't already have. If includeDeep flips on later, this fills the gaps.
  useEffect(() => {
    if (!includeDeep) return;
    const missing = audit.subsections.filter((s) => !deepForms[s.code]);
    if (!missing.length) {
      setIsDeepLoading(false);
      return;
    }

    const fetchDeepForms = async () => {
      setIsDeepLoading(true);
      try {
        const deepFormsData = {};
        for (const subsection of missing) {
          // Create a simple form representation to pass to the API
          const currentFormData = {
            responses: subsection.responses?.reduce((acc, response) => {
              acc[response.questionId] = response.answer;
              return acc;
            }, {}) || {}
          };

          const deepFormResult = await loadDeepQuestions(subsection.code, currentFormData);
          if (deepFormResult) {
            deepFormsData[subsection.code] = deepFormResult.form;
          }
        }
        setDeepForms((prev) => ({ ...prev, ...deepFormsData }));
      } catch (error) {
        console.error('Error fetching deep forms:', error);
      } finally {
        setIsDeepLoading(false);
      }
    };

    fetchDeepForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audit, includeDeep]);

  const openInNewWindow = async () => {
    const blob = await pdf(<AuditReportDoc audit={audit} questionDetails={questionDetails} deepForms={deepForms} includeComments={includeComments} includeDeep={includeDeep} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (isLoading || (includeDeep && isDeepLoading)) {
    return <div>Loading audit report...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={openInNewWindow}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Window
        </Button>
      </div>

      <div className="flex-1">
        <PDFViewer className="w-full h-full">
          <AuditReportDoc audit={audit} questionDetails={questionDetails} deepForms={deepForms} includeComments={includeComments} includeDeep={includeDeep} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default AuditReportV2;
