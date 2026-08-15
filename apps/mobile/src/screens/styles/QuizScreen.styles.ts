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
    marginHorizontal: 16,
    marginTop: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  timer: { fontSize: 13, fontWeight: "700" },

  /* PROGRESS DOTS */
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  dotText: { fontSize: 12, fontWeight: "800" },

  /* TOP INFO CARD */
  topInfoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderBottomWidth: 3,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  infoItem: { flex: 1, alignItems: "center" },
  infoLabel: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1, opacity: 0.6 },
  infoValue: { marginTop: 2, fontSize: 15, fontWeight: "900" },

  /* MAIN QUESTION CARD */
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderBottomWidth: 3,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  question: { fontSize: 14, fontWeight: "700", marginBottom: 12, lineHeight: 20 },

  /* OPTION CARD (3D Button style) */
  optionWrapper: {
    marginBottom: 6,
  },
  optionCard: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  optionText: { fontSize: 13, fontWeight: "600", lineHeight: 18 },

  /* EXPLANATION */
  explanationBox: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  explanationTitle: { fontWeight: "800", fontSize: 13, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  explanationText: { lineHeight: 20, fontSize: 13, fontWeight: "500" },

  /* ACTION ICONS */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(150, 150, 150, 0.2)",
  },

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  navBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  navBtnInner: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 14, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },

  /* RESULT SCREEN */
  resultBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  resultCard: {
    borderRadius: 22,
    padding: 26,
    alignItems: "center",
    width: "85%",
    elevation: 8,
  },
  resultTitle: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  resultPerc: { fontSize: 36, fontWeight: "900", marginTop: 10 },
  resultButtons: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20 },
  btn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12 },
  btnText: { fontSize: 15, fontWeight: "800" },

  /* REVIEW */
  reviewCard: { borderRadius: 18, marginHorizontal: 16, padding: 20, elevation: 6, marginTop: 16 },
  reviewQNo: { fontSize: 16, fontWeight: "700", marginBottom: 6 },

  /* POPUPS */
  centeredModalContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  centeredReportCard: { width: "88%", borderRadius: 20, padding: 20, overflow: "hidden" },
  reportTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  reportInput: { borderRadius: 12, padding: 12, height: 110, textAlignVertical: "top", fontSize: 14, marginBottom: 16 },
  reportButtons: { flexDirection: "row", justifyContent: "space-between" },
  popupOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  popupCardBig: { width: "85%", borderRadius: 25, paddingVertical: 34, paddingHorizontal: 25, alignItems: "center", elevation: 20 },
  popupTextLarge: { fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  popupSubText: { fontSize: 15, textAlign: "center", marginBottom: 20, lineHeight: 22, opacity: 0.8 },
  streakBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  streakBadgeText: { fontWeight: "800", marginLeft: 6, fontSize: 16 },
  okBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  confettiLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: "none" },
  fullscreenBlur: { ...StyleSheet.absoluteFillObject },
  modalWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  reportPopupContainer: { width: "85%", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  reportCard: { width: "100%", borderRadius: 20, padding: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  bookmarkPopupCard: { width: "80%", backgroundColor: "rgba(255,255,255,0.95)", padding: 24, borderRadius: 20, alignItems: "center", zIndex: 9999, elevation: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
});
