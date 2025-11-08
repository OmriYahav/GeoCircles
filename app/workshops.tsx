import { createMenuScreen } from "../src/screens/MenuScreenFactory";

export default createMenuScreen({
  icon: "🥄",
  title: "סדנאות",
  subtitle: "חוויות למידה שמחברות בין ידע לטעם",
  paragraphs: [
    "הסדנאות נבנות בקבוצות קטנות כדי להעניק זמן לשאלות ולתירגול מעשי, עם דגש על טכניקות בישול בריאות.",
    "נלמד יחד על קיפול בצקים מלאים, שילובי עשבי תיבול והרכבת תפריטים מאוזנים שמתאימים לכל בני הבית.",
    "תוכלי להצטרף למפגשים פתוחים או להזמין מפגש פרטי עם החברים והמשפחה בפורמט שנוח לך.",
  ],
});
