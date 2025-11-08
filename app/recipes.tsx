import { createMenuScreen } from "../src/screens/MenuScreenFactory";

export default createMenuScreen({
  icon: "🍰",
  title: "מתכונים בריאים",
  subtitle: "איזון של טעם ותזונה בכל ביס",
  paragraphs: [
    "אנו בוחרים עבורך חומרי גלם עונתיים, משלבים תבלינים עדינים ומייצרים קינוחים קלים לצד מאפים מלוחים מזינים.",
    "בכל מתכון תמצאי חלופות ללא גלוטן, הצעות להמתקה טבעית וטיפים להגשה שמעצימים את החוויה המשפחתית.",
    "התפריט מתעדכן מדי שבוע ופתוח לגמרי לשינויים שתבקשי לפי הטעמים האישיים שלך.",
  ],
});
