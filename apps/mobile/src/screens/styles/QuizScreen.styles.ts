// QuizScreen.styles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  /* ROOT */
  safe: { flex: 1, backgroundColor: "transparent" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12 },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  timer: { fontSize: 14, fontWeight: "700" },

  /* PROGRESS BAR (Gamified) */
  progressContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginHorizontal: 20,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  /* HUD STATS (Gamified Pills) */
  hudRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  hudPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  hudText: { fontSize: 13, fontWeight: "800", marginLeft: 6 },

  /* MAIN QUESTION CARD (Glass/Modern) */
  card: {
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    marginTop: 8,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  question: { fontSize: 17, fontWeight: "700", marginBottom: 20, lineHeight: 26 },

  /* OPTION CARD (Gamified Buttons) */
  optionWrapper: {
    marginBottom: 12,
  },
  optionCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: { fontSize: 15, fontWeight: "600", lineHeight: 22 },

  /* EXPLANATION */
  explanationBox: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  explanationTitle: { fontWeight: "800", fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  explanationText: { lineHeight: 22, fontSize: 14, fontWeight: "500" },

  /* ACTION ICONS */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBtn: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  navBtnInner: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 15, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  /* RESULT SCREEN */
  resultBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    width: "90%",
    elevation: 12,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  resultTitle: { fontSize: 24, fontWeight: "900", marginBottom: 16, letterSpacing: 0.5 },
  resultPerc: { fontSize: 42, fontWeight: "900", marginTop: 12, letterSpacing: -1 },
  resultButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 24,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  btnText: { fontSize: 16, fontWeight: "800" },

  /* REVIEW */
  reviewCard: {
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    elevation: 8,
    marginTop: 16,
  },
  reviewQNo: { fontSize: 14, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },

  /* POPUPS (Kept from before) */
  centeredModalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  centeredReportCard: { width: "88%", borderRadius: 28, padding: 24, overflow: "hidden" },
  reportTitle: { fontSize: 19, fontWeight: "800", marginBottom: 12 },
  reportInput: { borderRadius: 16, padding: 16, height: 120, textAlignVertical: "top", fontSize: 15, marginBottom: 20 },
  reportButtons: { flexDirection: "row", justifyContent: "space-between" },
  popupOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  popupCardBig: { width: "88%", borderRadius: 32, paddingVertical: 40, paddingHorizontal: 28, alignItems: "center", elevation: 24 },
  popupTextLarge: { fontSize: 28, fontWeight: "900", textAlign: "center", marginBottom: 12 },
  popupSubText: { fontSize: 16, textAlign: "center", marginBottom: 24, lineHeight: 24, opacity: 0.8 },
  streakBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, marginBottom: 16 },
  streakBadgeText: { fontWeight: "900", marginLeft: 8, fontSize: 18 },
  okBtn: { paddingVertical: 14, paddingHorizontal: 48, borderRadius: 16 },
  confettiLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: "none" },
  fullscreenBlur: { ...StyleSheet.absoluteFillObject },
  modalWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  reportPopupContainer: { width: "90%", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  reportCard: { width: "100%", borderRadius: 28, padding: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  bookmarkPopupCard: { width: "85%", backgroundColor: "rgba(255,255,255,0.98)", padding: 28, borderRadius: 28, alignItems: "center", zIndex: 9999, elevation: 20, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 15, shadowOffset: { width: 0, height: 10 } },
});
