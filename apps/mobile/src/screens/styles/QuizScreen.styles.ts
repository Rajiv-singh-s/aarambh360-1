// QuizScreen.styles.ts
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  /* ROOT */
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12 },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  timer: { fontSize: 14 },

  /* PROGRESS DOTS */
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  progressDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  dotText: { fontSize: 13, fontWeight: "700" },

  /* TOP INFO CARD */
  topInfoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 5,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  infoItem: { flex: 1, alignItems: "center" },
  infoLabel: { fontSize: 12, fontWeight: "600", opacity: 0.7 },
  infoValue: { marginTop: 3, fontSize: 17, fontWeight: "800" },

  /* MAIN QUESTION CARD */
  card: {
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 20,
    marginTop: 16,
    elevation: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  question: { fontSize: 16, fontWeight: "600", marginBottom: 14 },

  /* OPTION CARD */
  optionCard: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 6,
    borderWidth: 1.5,
  },
  optionText: { fontSize: 15, fontWeight: "500" },

  /* EXPLANATION */
  explanationBox: {
    marginTop: 16,
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 4,
  },
  explanationTitle: { fontWeight: "700", fontSize: 15, marginBottom: 4 },
  explanationText: { lineHeight: 20, fontSize: 14 },

  /* ACTION ICONS */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 18,
  },

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 10,
  },
  navBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 5,
  },
  navBtnInner: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 15, fontWeight: "700", color: "#fff" },

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
  resultButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnText: { fontSize: 15, fontWeight: "800" },

  /* REVIEW */
  reviewCard: {
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 20,
    elevation: 6,
    marginTop: 16,
  },
  reviewQNo: { fontSize: 16, fontWeight: "700", marginBottom: 6 },

  /* REPORT POPUP */
  centeredModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centeredReportCard: {
    width: "85%",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  reportTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  reportInput: {
    borderRadius: 12,
    padding: 12,
    height: 110,
    textAlignVertical: "top",
    fontSize: 14,
    marginBottom: 16,
  },
  reportButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  /* STREAK POPUP */
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  popupCardBig: {
    width: "85%",
    borderRadius: 25,
    paddingVertical: 34,
    paddingHorizontal: 25,
    alignItems: "center",
    elevation: 20,
  },
  popupTextLarge: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  popupSubText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
    opacity: 0.8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  streakBadgeText: { fontWeight: "800", marginLeft: 6, fontSize: 16 },
  okBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  confettiLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },
  fullscreenBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  reportPopupContainer: {
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  reportCard: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  bookmarkPopupCard: {
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});
