import { createMenuScreen } from "../../src/screens/MenuScreenFactory";

export default createMenuScreen({
  icon: "📞",
  title: "צור קשר",
  subtitle: "נשמח לשוחח וללוות אותך בדרך המתוקה",
  paragraphs: [
    "נוכל לפגוש אותך בסדנה, במפגש טיפולי אישי או בשיחת ייעוץ קצרה לבחינת הצרכים שלך.",
    "כתבי לנו לכתובת hello@sweetbalance.co.il או התקשרי ל-03-5556677 ואנו נחזור אלייך בהקדם.",
    "אפשר גם להשאיר הודעה בטופס באתר או דרך הרשתות החברתיות, ואחת המדריכות שלנו תחזור אלייך עם חיוך.",
  ],
});
