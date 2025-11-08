import { createMenuScreen } from "../../src/screens/MenuScreenFactory";

export default createMenuScreen({
  icon: "📖",
  title: "בלוג",
  subtitle: "מחשבות מתוקות על איזון בחיים",
  paragraphs: [
    "בבלוג אנחנו משתפות סיפורים מהקליניקה, שיחות עם נשים אמיצות ועולמות תוכן שמחברים בין רגש לתזונה.",
    "תמצאי בו רעיונות עונתיים, המלצות על מוצרים מקומיים ומסלולי קריאה שמעמיקים בכל נושא שמעניין אותך.",
    "כל פוסט מלווה בהורדות, רשימות להדפסה ומשימות קטנות שמאפשרות להרגיש שינוי כבר ביום הראשון.",
  ],
});
