import SafeContainer from '../components/SafeContainer';
// src/screens/MainScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Alert,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { useNavigation } from "@react-navigation/native";

// MODULE IMPORTS
import {
  createMainsSubmission,
  evaluateMainsSubmission,
  listMainsQuestions,
  pollMainsEvaluation,
  pollMainsSubmission,
  uploadMainsImages,
  retryMainsSubmission,
  getMainsSubmission,
  getMainsEvaluation,
} from "../services/mainsService";
import { trackLearningEvent } from "../services/analyticsService";
import type { MainsSubmissionDto, MainsEvaluationDto } from "@aarambh360/types";

// UI Colors
const BG_TOP = "#0b1220";
const BG_BOTTOM = "#111b2e";
const CARD_BG = "#1e293b";
const TEXT_LIGHT = "#94a3b8";
const BLUE = "#06b6d4";

const NOTCH_TOP = Platform.OS === "ios" ? 70 : StatusBar.currentHeight || 24;

export default function MainScreen() {
  const nav = useNavigation<any>();

  // DATA
  const [question, setQuestion] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // MODALS
  const [attemptModal, setAttemptModal] = useState(false);
  const [timerModal, setTimerModal] = useState(false);
  const [allModal, setAllModal] = useState(false);

  // FLOW STATE & ERRORS
  const [flowState, setFlowState] = useState<'DRAFT' | 'UPLOADING' | 'PROCESSING_OCR' | 'OCR_COMPLETED' | 'EDIT' | 'SUBMITTING' | 'EVALUATING' | 'EVALUATED' | 'OCR_FAILED' | 'EVAL_FAILED'>('DRAFT');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // OCR & IMAGES
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // EDITOR
  const rich = useRef<RichEditor>(null);
  const [answerText, setAnswerText] = useState("");

  // EVALUATION
  const [evalResult, setEvalResult] = useState<MainsEvaluationDto | null>(null);

  // TIMER
  const [timer, setTimer] = useState(1800);
  const timerRef = useRef<any>(null);

  // UPLOAD SHEET
  const [uploadSheet, setUploadSheet] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // LOAD TODAY'S QUESTION
  useEffect(() => {
    (async () => {
      try {
        const list = await listMainsQuestions(1);
        if (list[0]) {
          setQuestion({
            id: list[0].id,
            question: list[0].text,
            paper: list[0].gsPaper,
            subject: list[0].gsPaper,
            marks: list[0].maxMarks,
          });
        } else {
          setQuestion({
            id: null,
            question: "No mains question published today.",
            subject: "—",
            paper: "—",
            marks: 0,
          });
        }
      } catch {
        setQuestion({
          id: null,
          question: "Unable to load question.",
          subject: "—",
          paper: "—",
          marks: 0,
        });
      }
      setLoading(false);
    })();
  }, []);

  // TIMER START
  function startTimer() {
    setTimer(1800);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
  }

  const fTime =
    String(Math.floor(timer / 60)).padStart(2, "0") +
    ":" +
    String(timer % 60).padStart(2, "0");

  // RESET FLOW
  function resetFlow() {
    if (timerRef.current) clearInterval(timerRef.current);
    setFlowState('DRAFT');
    setUploaded([]);
    setSubmissionId(null);
    setAnswerText("");
    setOcrError(null);
    setEvalError(null);
    setEvalResult(null);
    setTimer(1800);
  }

  // UPLOAD SHEET
  function openUpload() {
    setUploadSheet(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeUpload() {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setUploadSheet(false));
  }

  // PICK FROM GALLERY
  async function chooseFromGallery() {
    try {
      const result: any = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: 3,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled) return;

      const uris = result.assets.map((a: any) => a.uri).slice(0, 3);
      setUploaded(uris);
      handleProcessImages(uris);
    } catch (e) {
      Alert.alert("Gallery error", "Unable to pick images");
    } finally {
      closeUpload();
    }
  }

  // CAMERA
  async function openCamera() {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return Alert.alert("Camera access required");

      const res: any = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (res.canceled) return;

      const uri = res.assets?.[0]?.uri;
      if (!uri) return Alert.alert("Camera Error", "Could not capture image");

      setUploaded([uri]);
      handleProcessImages([uri]);
    } catch (e) {
      Alert.alert("Camera error", "Failed to open camera");
    } finally {
      closeUpload();
    }
  }

  // PROCESS IMAGES (upload & poll OCR)
  async function handleProcessImages(uris: string[]) {
    if (!question?.id) {
      Alert.alert("Question unavailable", "Try again after questions load.");
      return;
    }

    setFlowState('UPLOADING');
    setOcrError(null);

    try {
      const imageUrls = await uploadMainsImages(uris);

      setFlowState('PROCESSING_OCR');
      const submission = await createMainsSubmission({
        mainsQuestionId: question.id,
        imageUrls,
      });
      setSubmissionId(submission.id);

      // Track MAINS_SUBMITTED event
      await trackLearningEvent({
        eventType: 'MAINS_SUBMITTED',
        entityType: 'mains_submission',
        entityId: submission.id,
        metadata: { mainsQuestionId: question.id }
      }).catch(err => console.log('Analytics error:', err));

      // Poll OCR status
      let ocrSubmission = submission;
      const timeoutMs = 45_000;
      const intervalMs = 1500;
      const started = Date.now();
      let ocrCompleted = false;

      while (Date.now() - started < timeoutMs) {
        ocrSubmission = await getMainsSubmission(submission.id);
        if (ocrSubmission.status === 'EVALUATED') {
          ocrCompleted = true;
          break;
        }
        if (ocrSubmission.status === 'FAILED') {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      if (ocrCompleted) {
        setFlowState('EDIT');
        const text = ocrSubmission.answer?.extractedText ?? "";
        setAnswerText(text);
        setTimeout(() => {
          rich.current?.setContentHTML(text.replace(/\n/g, "<br/>"));
        }, 100);
      } else {
        setOcrError(ocrSubmission.ocrError ?? "OCR extraction failed.");
        setFlowState('OCR_FAILED');
      }
    } catch (e: any) {
      setOcrError(e?.message ?? "Unable to process images.");
      setFlowState('OCR_FAILED');
    }
  }

  // OCR RETRY
  async function handleOcrRetry() {
    if (!submissionId) return;
    setFlowState('PROCESSING_OCR');
    setOcrError(null);
    try {
      const submission = await retryMainsSubmission(submissionId);
      let ocrSubmission = submission;
      const timeoutMs = 45_000;
      const intervalMs = 1500;
      const started = Date.now();
      let ocrCompleted = false;

      while (Date.now() - started < timeoutMs) {
        ocrSubmission = await getMainsSubmission(submissionId);
        if (ocrSubmission.status === 'EVALUATED') {
          ocrCompleted = true;
          break;
        }
        if (ocrSubmission.status === 'FAILED') {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      if (ocrCompleted) {
        setFlowState('EDIT');
        const text = ocrSubmission.answer?.extractedText ?? "";
        setAnswerText(text);
        setTimeout(() => {
          rich.current?.setContentHTML(text.replace(/\n/g, "<br/>"));
        }, 100);
      } else {
        setOcrError(ocrSubmission.ocrError ?? "OCR extraction failed.");
        setFlowState('OCR_FAILED');
      }
    } catch (e: any) {
      setOcrError(e?.message ?? "Unable to retry OCR");
      setFlowState('OCR_FAILED');
    }
  }

  // SUBMIT AI EVALUATION
  async function submitEvaluation() {
    Keyboard.dismiss();

    const html = (await rich.current?.getContentHtml()) || "";
    const plain = html.replace(/<[^>]+>/g, "").trim();

    if (!plain) {
      Alert.alert("Empty Answer", "Please write or extract text first.");
      return;
    }

    if (!submissionId) {
      Alert.alert("Submission Missing", "Please upload answer images first.");
      return;
    }

    setFlowState('SUBMITTING');
    setEvalError(null);

    try {
      await evaluateMainsSubmission(submissionId, { answerText: plain });
      setFlowState('EVALUATING');

      const timeoutMs = 60_000;
      const intervalMs = 2000;
      const started = Date.now();
      let evaluationDto: MainsEvaluationDto | null = null;
      let errorOccurred = false;

      while (Date.now() - started < timeoutMs) {
        try {
          const evalRes = await getMainsEvaluation(submissionId);
          if (evalRes && evalRes.feedback) {
            evaluationDto = evalRes;
            break;
          }
        } catch (err: any) {
          const sub = await getMainsSubmission(submissionId);
          if (sub.evalError) {
            setEvalError(sub.evalError);
            errorOccurred = true;
            break;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      if (evaluationDto) {
        setEvalResult(evaluationDto);
        setFlowState('EVALUATED');

        // Track MAINS_EVALUATED event
        await trackLearningEvent({
          eventType: 'MAINS_EVALUATED',
          entityType: 'mains_submission',
          entityId: submissionId,
          metadata: {
            mainsQuestionId: question.id,
            score: evaluationDto.score,
            maxScore: evaluationDto.maxScore,
          }
        }).catch(err => console.log('Analytics error:', err));
      } else {
        if (!errorOccurred) {
          setEvalError("Evaluation timed out. Please try again.");
        }
        setFlowState('EVAL_FAILED');
      }
    } catch (e: any) {
      setEvalError(e?.message ?? "AI evaluation failed.");
      setFlowState('EVAL_FAILED');
    }
  }

  // LOAD ALL QUESTIONS
  async function loadAll() {
    try {
      const list = await listMainsQuestions(50);
      setAllQuestions(
        list.map((item) => ({
          date: item.publishedDate ?? "—",
          question: item.text,
        })),
      );
    } catch {
      setAllQuestions([]);
    }
  }

  // LOADING UI
  if (loading)
    return (
      <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.flex}>
        <SafeContainer style={styles.center}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.info}>Loading…</Text>
        </SafeContainer>
      </LinearGradient>
    );

  return (
    <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.flex}>
      <SafeContainer style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: NOTCH_TOP }]}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Ionicons name="chevron-back" size={26} color={BLUE} />
          </TouchableOpacity>

          <Text style={styles.hTitle}>Daily Mains</Text>

          <TouchableOpacity
            style={styles.seeBtn}
            onPress={() => {
              loadAll();
              setAllModal(true);
            }}
          >
            <Text style={styles.seeTxt}>See All</Text>
            <Ionicons name="chevron-forward" size={18} color={BLUE} />
          </TouchableOpacity>
        </View>

        {/* TODAY'S QUESTION */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.card}>
            <Text style={styles.cHead}>Today's Question</Text>
            <Text style={styles.qText}>{question?.question}</Text>

            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagT}>{question?.paper}</Text>
              </View>

              <View style={[styles.tag, styles.ml]}>
                <Text style={styles.tagT}>{question?.subject}</Text>
              </View>

              <View style={[styles.tag, styles.ml]}>
                <Text style={styles.tagT}>{question?.marks} Marks</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.pBtn}
            onPress={() => setAttemptModal(true)}
          >
            <Text style={styles.pTxt}>Write Answer</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ATTEMPT MODAL */}
        <Modal visible={attemptModal} animationType="slide">
          <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.flex}>
            <SafeContainer>
              <View style={[styles.header, { paddingTop: NOTCH_TOP }]}>
                <TouchableOpacity onPress={() => setAttemptModal(false)}>
                  <Ionicons name="close" size={26} color={BLUE} />
                </TouchableOpacity>
                <Text style={styles.hTitle}>Attempt Question</Text>
                <View style={{ width: 26 }} />
              </View>

              <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={styles.card}>
                  <Text style={styles.qText}>{question?.question}</Text>

                  <TouchableOpacity
                    style={[styles.pBtn, { marginTop: 20 }]}
                    onPress={() => {
                      setAttemptModal(false);
                      startTimer();
                      setTimerModal(true);
                    }}
                  >
                    <Text style={styles.pTxt}>Start Writing</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeContainer>
          </LinearGradient>
        </Modal>

        {/* WRITE ANSWER MODAL */}
        <Modal visible={timerModal} animationType="slide">
          <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.flex}>
            <SafeContainer style={{ flex: 1 }}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View style={[styles.header, { paddingTop: NOTCH_TOP }]}>
                  <TouchableOpacity
                    onPress={() => {
                      resetFlow();
                      setTimerModal(false);
                    }}
                  >
                    <Ionicons name="close" size={26} color={BLUE} />
                  </TouchableOpacity>

                  <Text style={styles.hTitle}>Write Answer</Text>

                  <View style={{ width: 26 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 16 }}>
                  <View style={styles.card}>
                    <Text style={styles.qText}>{question?.question}</Text>

                    {/* TIMER & PROGRESS LIFECYCLE */}
                    {flowState !== 'EVALUATED' && (
                      <Text style={styles.time}>{fTime}</Text>
                    )}

                    {/* Selected Image Preview */}
                    {(flowState === 'DRAFT' || flowState === 'UPLOADING' || flowState === 'PROCESSING_OCR' || flowState === 'OCR_FAILED') && uploaded.length > 0 && (
                      <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                        {uploaded.map((u, i) => (
                          <Image
                            key={i}
                            source={{ uri: u }}
                            style={{
                              width: 65,
                              height: 65,
                              borderRadius: 10,
                            }}
                          />
                        ))}
                      </View>
                    )}

                    {/* DRAFT STATE */}
                    {flowState === 'DRAFT' && (
                      <View style={{ marginTop: 20 }}>
                        <Text style={styles.instructionText}>
                          Write your answer on paper. When finished, take pictures of the pages to extract text.
                        </Text>
                        <TouchableOpacity style={styles.pBtn} onPress={openUpload}>
                          <Text style={styles.pTxt}>Select Pages (Camera / Gallery)</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* UPLOADING STATE */}
                    {flowState === 'UPLOADING' && (
                      <View style={styles.statusBox}>
                        <ActivityIndicator size="large" color={BLUE} />
                        <Text style={styles.statusTitle}>Uploading Pages</Text>
                        <Text style={styles.statusDesc}>Your handwritten answer sheets are being uploaded to R2 cloud storage...</Text>
                      </View>
                    )}

                    {/* PROCESSING OCR STATE */}
                    {flowState === 'PROCESSING_OCR' && (
                      <View style={styles.statusBox}>
                        <ActivityIndicator size="large" color={BLUE} />
                        <Text style={styles.statusTitle}>Processing OCR</Text>
                        <Text style={styles.statusDesc}>Extracting text from your answer sheets. This may take up to 30 seconds...</Text>
                      </View>
                    )}

                    {/* OCR FAILED STATE */}
                    {flowState === 'OCR_FAILED' && (
                      <View style={styles.statusBox}>
                        <Ionicons name="alert-circle" size={48} color="#ef4444" />
                        <Text style={[styles.statusTitle, { color: '#ef4444' }]}>OCR Extraction Failed</Text>
                        <Text style={styles.statusDesc}>{ocrError || "We couldn't extract text from the uploaded images. Please ensure the handwriting is clear."}</Text>
                        
                        <View style={styles.btnRow}>
                          <TouchableOpacity style={styles.actionBtn} onPress={handleOcrRetry}>
                            <Text style={styles.actionBtnText}>Retry OCR</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionBtn, styles.btnOutline]} onPress={() => {
                            setFlowState('DRAFT');
                            setUploaded([]);
                            setOcrError(null);
                          }}>
                            <Text style={styles.actionBtnTextOutline}>Upload Again</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* EDIT STATE */}
                    {flowState === 'EDIT' && (
                      <View style={{ marginTop: 14 }}>
                        <Text style={styles.instructionText}>
                          OCR complete! Review and edit your extracted text below:
                        </Text>

                        <RichToolbar
                          editor={rich}
                          style={styles.toolbar}
                          iconTint="#fff"
                          selectedIconTint={BLUE}
                          actions={[
                            actions.setBold,
                            actions.setItalic,
                            actions.setUnderline,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                          ]}
                        />

                        <RichEditor
                          ref={rich}
                          initialContentHTML={answerText.replace(/\n/g, "<br/>")}
                          editorStyle={{
                            backgroundColor: CARD_BG,
                            color: "#fff",
                            placeholderColor: "#667085",
                          }}
                          placeholder="Your answer"
                          style={styles.editor}
                          onChange={(html) =>
                            setAnswerText(html.replace(/<[^>]+>/g, ""))
                          }
                        />

                        <TouchableOpacity
                          style={[styles.pBtn, { marginTop: 20 }]}
                          onPress={submitEvaluation}
                        >
                          <Text style={styles.pTxt}>Submit for AI Evaluation</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.oBtn, { marginTop: 10, borderColor: '#ef4444' }]}
                          onPress={() => {
                            Alert.alert(
                              "Discard Extracted Text?",
                              "Are you sure you want to discard the current text and upload new images?",
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Yes, Re-upload",
                                  style: "destructive",
                                  onPress: () => {
                                    setFlowState('DRAFT');
                                    setUploaded([]);
                                    setAnswerText("");
                                    setOcrError(null);
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Text style={[styles.oTxt, { color: '#ef4444' }]}>Re-upload Images</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* SUBMITTING STATE */}
                    {flowState === 'SUBMITTING' && (
                      <View style={styles.statusBox}>
                        <ActivityIndicator size="large" color={BLUE} />
                        <Text style={styles.statusTitle}>Submitting Answer</Text>
                        <Text style={styles.statusDesc}>Enqueuing answer text for AI evaluation...</Text>
                      </View>
                    )}

                    {/* EVALUATING STATE */}
                    {flowState === 'EVALUATING' && (
                      <View style={styles.statusBox}>
                        <ActivityIndicator size="large" color={BLUE} />
                        <Text style={styles.statusTitle}>Evaluating Answer</Text>
                        <Text style={styles.statusDesc}>AI is checking your answer against the official syllabus, model answer, and RAG sources...</Text>
                      </View>
                    )}

                    {/* EVAL FAILED STATE */}
                    {flowState === 'EVAL_FAILED' && (
                      <View style={styles.statusBox}>
                        <Ionicons name="alert-circle" size={48} color="#ef4444" />
                        <Text style={[styles.statusTitle, { color: '#ef4444' }]}>AI Evaluation Failed</Text>
                        <Text style={styles.statusDesc}>{evalError || "Something went wrong while evaluating your answer. Please try again."}</Text>
                        
                        <View style={styles.btnRow}>
                          <TouchableOpacity style={styles.actionBtn} onPress={submitEvaluation}>
                            <Text style={styles.actionBtnText}>Retry Evaluation</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionBtn, styles.btnOutline]} onPress={() => setFlowState('EDIT')}>
                            <Text style={styles.actionBtnTextOutline}>Edit Answer</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* EVALUATED STATE */}
                    {flowState === 'EVALUATED' && evalResult && (
                      <View style={styles.evalCardContainer}>
                        {/* Headline Score */}
                        <View style={styles.scoreHeader}>
                          <Text style={styles.scoreBig}>
                            {evalResult.score} / {evalResult.maxScore}
                          </Text>
                          <Text style={styles.scoreLabel}>Marks Awarded</Text>
                        </View>

                        {/* Relevance Meter */}
                        <View style={styles.relevanceBox}>
                          <Text style={styles.relevanceTitle}>Relevance Score</Text>
                          <View style={styles.relevanceBarBg}>
                            <View style={[styles.relevanceBarActive, { width: `${evalResult.relevanceScore ?? 0}%` }]} />
                          </View>
                          <Text style={styles.relevanceText}>{evalResult.relevanceScore ?? 0}% Match</Text>
                        </View>

                        {/* Dimensions Breakdown */}
                        <Text style={styles.sectionHeader}>Dimensions Evaluation</Text>
                        {(evalResult.feedback?.dimensions ?? []).map((dim: any, idx: number) => (
                          <View key={`dim-${idx}`} style={styles.dimCard}>
                            <View style={styles.dimRow}>
                              <Text style={styles.dimName}>{dim.name}</Text>
                              <Text style={styles.dimScore}>{dim.score} / {dim.maxScore}</Text>
                            </View>
                            <Text style={styles.dimFeedback}>{dim.feedback}</Text>
                          </View>
                        ))}

                        {/* Strengths */}
                        <Text style={styles.sectionHeader}>Strengths</Text>
                        {(evalResult.feedback?.strengths ?? []).map((str: string, idx: number) => (
                          <View key={`str-${idx}`} style={styles.bulletRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={styles.bulletText}>{str}</Text>
                          </View>
                        ))}

                        {/* Suggestions */}
                        <Text style={styles.sectionHeader}>Suggestions & Improvements</Text>
                        {(evalResult.feedback?.suggestions ?? []).map((sug: string, idx: number) => (
                          <View key={`sug-${idx}`} style={styles.bulletRow}>
                            <Ionicons name="arrow-forward-circle" size={16} color="#f59e0b" />
                            <Text style={styles.bulletText}>{sug}</Text>
                          </View>
                        ))}

                        {/* Missing Points */}
                        <Text style={styles.sectionHeader}>Missing Points</Text>
                        {(evalResult.feedback?.missingPoints ?? []).map((pt: string, idx: number) => (
                          <View key={`miss-${idx}`} style={styles.bulletRow}>
                            <Ionicons name="close-circle" size={16} color="#ef4444" />
                            <Text style={styles.bulletText}>{pt}</Text>
                          </View>
                        ))}

                        {/* Overall Conclusion */}
                        <Text style={styles.sectionHeader}>Overall Evaluation</Text>
                        <View style={styles.conclusionBox}>
                          <Text style={styles.conclusionText}>
                            {evalResult.feedback?.conclusion ?? "AI evaluation completed successfully."}
                          </Text>
                        </View>

                        {/* Sources / Citations */}
                        <Text style={styles.sectionHeader}>RAG Citations & Sources</Text>
                        {(evalResult.feedback?.sources ?? []).length > 0 ? (
                          (evalResult.feedback?.sources ?? []).map((src: any, idx: number) => (
                            <View key={`src-${idx}`} style={styles.srcCard}>
                              <View style={styles.srcRow}>
                                <Ionicons name="document-text" size={16} color={BLUE} />
                                <Text style={styles.srcTitle} numberOfLines={1}>
                                  {src.title}
                                </Text>
                              </View>
                              <View style={styles.srcMetaRow}>
                                <Text style={styles.srcType}>{src.documentType}</Text>
                                <Text style={styles.srcScore}>Match: {Math.round((src.score ?? 0) * 100)}%</Text>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.noSourcesText}>No reference sources cited.</Text>
                        )}

                        {/* Reset / Finish Button */}
                        <TouchableOpacity
                          style={[styles.pBtn, { marginTop: 24 }]}
                          onPress={() => {
                            resetFlow();
                            setTimerModal(false);
                          }}
                        >
                          <Text style={styles.pTxt}>Done & Return</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Upload Sheet */}
                {uploadSheet && (
                  <Animated.View
                    style={[
                      styles.uploadSheet,
                      {
                        transform: [
                          {
                            translateY: sheetAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [300, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.uTitle}>Upload Answer</Text>

                    <TouchableOpacity
                      style={styles.pBtn}
                      onPress={chooseFromGallery}
                    >
                      <Text style={styles.pTxt}>Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.pBtn} onPress={openCamera}>
                      <Text style={styles.pTxt}>Open Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={closeUpload}>
                      <Text style={styles.cancelTxt}>Cancel</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </KeyboardAvoidingView>
            </SafeContainer>
          </LinearGradient>
        </Modal>

        {/* ALL QUESTIONS MODAL */}
        <Modal visible={allModal} animationType="slide">
          <LinearGradient colors={[BG_TOP, BG_BOTTOM]} style={styles.flex}>
            <SafeContainer style={{ paddingTop: NOTCH_TOP }}>
              <View style={[styles.header]}>
                <TouchableOpacity onPress={() => setAllModal(false)}>
                  <Ionicons name="close" size={26} color={BLUE} />
                </TouchableOpacity>
                <Text style={styles.hTitle}>All Questions</Text>
                <View style={{ width: 26 }} />
              </View>

              <ScrollView contentContainerStyle={{ padding: 16 }}>
                {allQuestions.map((q, i) => (
                  <View key={i} style={styles.aCard}>
                    <Text style={styles.aDate}>{q.date}</Text>
                    <Text style={styles.aQ}>{q.question}</Text>
                  </View>
                ))}
              </ScrollView>
            </SafeContainer>
          </LinearGradient>
        </Modal>
      </SafeContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  center: { justifyContent: "center", alignItems: "center" },

  info: { color: TEXT_LIGHT },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hTitle: { color: "#fff", fontWeight: "800", fontSize: 20 },

  seeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BLUE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },

  seeTxt: { color: BLUE, marginRight: 4 },

  card: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  cHead: {
    color: BLUE,
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 15,
  },

  qText: { color: TEXT_LIGHT, lineHeight: 22, fontSize: 15 },

  tagRow: { flexDirection: "row", marginTop: 12 },

  tag: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: BLUE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  tagT: { color: BLUE, fontSize: 12 },

  ml: { marginLeft: 8 },

  pBtn: {
    backgroundColor: BLUE,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  pTxt: { color: "#fff", fontWeight: "800" },

  oBtn: {
    borderWidth: 1,
    borderColor: BLUE,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  oTxt: { color: BLUE, fontWeight: "700" },

  time: {
    textAlign: "center",
    color: BLUE,
    fontSize: 36,
    fontWeight: "800",
    marginVertical: 10,
  },

  toolbar: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    marginBottom: 10,
  },

  editor: {
    minHeight: 260,
    borderRadius: 10,
    padding: 10,
  },

  uploadSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  uTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 10 },

  cancelTxt: { color: TEXT_LIGHT, textAlign: "center", marginTop: 10 },

  evalCardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
  },

  instructionText: {
    color: TEXT_LIGHT,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },

  scoreHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },

  scoreBig: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },

  scoreLabel: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  relevanceBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },

  relevanceTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  relevanceBarBg: {
    backgroundColor: '#334155',
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },

  relevanceBarActive: {
    backgroundColor: BLUE,
    height: '100%',
    borderRadius: 4,
  },

  relevanceText: {
    color: TEXT_LIGHT,
    fontSize: 12,
  },

  sectionHeader: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 4,
  },

  dimCard: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  dimRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  dimName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  dimScore: {
    color: BLUE,
    fontWeight: '700',
    fontSize: 14,
  },

  dimFeedback: {
    color: TEXT_LIGHT,
    fontSize: 13,
    lineHeight: 18,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingRight: 12,
  },

  bulletText: {
    color: TEXT_LIGHT,
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
    flex: 1,
  },

  conclusionBox: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
  },

  conclusionText: {
    color: TEXT_LIGHT,
    fontSize: 14,
    lineHeight: 20,
  },

  srcCard: {
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },

  srcRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  srcTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },

  srcMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingLeft: 22,
  },

  srcType: {
    color: TEXT_LIGHT,
    fontSize: 11,
  },

  srcScore: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '600',
  },

  noSourcesText: {
    color: TEXT_LIGHT,
    fontSize: 13,
    fontStyle: 'italic',
  },

  statusBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    marginVertical: 20,
  },

  statusTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },

  statusDesc: {
    color: TEXT_LIGHT,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },

  btnRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },

  actionBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BLUE,
  },

  actionBtnTextOutline: {
    color: BLUE,
    fontWeight: '700',
    fontSize: 14,
  },

  aCard: {
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  aDate: { color: BLUE, fontWeight: "700", marginBottom: 4 },

  aQ: { color: TEXT_LIGHT, lineHeight: 20 },
});
