import { createMenuScreen } from "../../src/screens/MenuScreenFactory";

export default createMenuScreen({
  icon: "🌿",
  title: "עצות תזונה",
  subtitle: "הכוונה עדינה לאיזון יומיומי",
  paragraphs: [
    "העצות נכתבות בשפה ברורה ופשוטה ליישום, עם סדרת פעולות קטנות שניתן לאמץ כבר מהשבוע הראשון.",
    "נלמד כיצד לקרוא תוויות, לאזן בין מקרונוטריינטים ולהרכיב צלחת שתספק אנרגיה לאורך זמן.",
    "תמיד נוסיף גם טיפ מנטלי שיעזור להפוך את ההרגלים החדשים לנעימים ומתמשכים.",
  ],
});
