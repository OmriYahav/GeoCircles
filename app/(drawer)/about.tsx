import { createMenuScreen } from "../../src/screens/MenuScreenFactory";

export default createMenuScreen({
  iconName: "message-circle",
  title: "אודות",
  subtitle: "להכיר את Sweet Balance מקרוב",
  paragraphs: [
    "Sweet Balance נולדה מתוך אהבה לאוכל רגיש וקשוב. הצוות שלנו משלב תזונאיות, מטפלות ומדריכות סדנאות שמאמינות באיזון כדרך חיים.",
    "אנו מלווים קהילות, משפחות ויחידים בבניית שגרה תזונתית מחבקת, ומאמינים שבחירות קטנות יוצרות שינוי גדול ומתמשך.",
    "במרכז התוכן שלנו תמצאו מתכונים, טיפים וכלים מעשיים שכולם מעוצבים בשפה נעימה, רגישה ומעוררת השראה.",
  ],
});
