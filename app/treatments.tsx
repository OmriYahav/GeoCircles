import { createMenuScreen } from "../src/screens/MenuScreenFactory";

export default createMenuScreen({
  icon: "🙌",
  title: "טיפולים",
  subtitle: "מגע אישי וקשוב לצרכים שלך",
  paragraphs: [
    "במפגשי הטיפול נעמיק בהקשבה לגוף ונבנה תוכנית המשלבת תזונה, תנועה וטכניקות הרפיה מותאמות.",
    "הקליניקה מציעה פגישות אחד על אחד, ליווי מרחוק ובדיקות מעקב שמבטיחות שהגוף מקבל את כל מה שהוא צריך.",
    "כל טיפול מתחיל בשיחה פתוחה וממשיך בבחירה משותפת של הקצב והיעדים שמתאימים לך באמת.",
  ],
});
