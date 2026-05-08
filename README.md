# Harmonia · רשת חברתית למוזיקאים

רשת חברתית שכולה מוקדשת לעולם המוזיקה — מוזיקאים, מפיקים, מורים, אמני בידור,
חנויות ומאזינים. בסגנון אינסטגרם, אבל עם כל מה שמוזיקאי באמת צריך:
פיד, פלייליסטים מ־Spotify, חיפוש מורים לפי מיקום עם ביקורות, קהילת שאלות
ותשובות, marketplace לציוד, ומרכז שיתופי פעולה (collabs) שבו אפשר להעלות
שיר ולקבל סטמים מאחרים — סקסופון, סולו גיטרה, מה שצריך.

הסטאק: **Node.js (Express) + React (Vite)**, אחסון נתונים בקובץ JSON
(אפס תלויות חיצוניות), העלאות קבצים מקומית (multer), אימות JWT.

## התחלה מהירה

```bash
npm run install:all     # מתקין שרת + לקוח
npm run seed            # יוצר משתמשי דמו ותוכן
npm run dev             # מריץ את השרת (4000) והלקוח (5173) במקביל
```

פתחו http://localhost:5173

לפרודקשן (לקוח שמוגש מתוך Express):

```bash
npm run build
npm start
# גלישה ל־ http://localhost:4000
```

### חשבונות דמו (אחרי `npm run seed`)

הסיסמה לכל המשתמשים: `password`

| משתמש          | סוג חשבון |
| -------------- | --------- |
| `alex_guitar`  | musician  |
| `noa_producer` | producer  |
| `ravid_sax`    | musician  |
| `miri_teacher` | teacher   |
| `stringsmith`  | business  |
| `fan_listener` | listener  |

## פיצ'רים

### 1. פרופילים לפי סוג חשבון
חמישה סוגים: `musician`, `producer`, `business`, `teacher`, `listener`.
פרופיל פרטי או ציבורי, אווטאר, ביו, מיקום, כלים וז'אנרים, עוקבים/נעקבים.

### 2. פיד אינסטגרם־לייק
פוסטים עם תמונות / וידאו / אודיו, לייקים ותגובות, פיד שמראה תוכן ממי
שאתם עוקבים אחריו. דף Explore לתוכן ציבורי וחיפוש משתמשים לפי כלי / ז'אנר /
שם / סוג חשבון.

### 3. פלייליסטים בשיתוף Spotify
כל פרופיל יכול לחבר Spotify (placeholder ל־OAuth) ולהוסיף פלייליסטים
שיופיעו מתחת לפרופיל עם קישור ישיר ל־Spotify.

### 4. חיפוש מורים לפי מיקום
המורים יכולים לפרסם פרופיל מורה (כותרת, ביו, כלים, עיר, מחיר לשעה,
שפות, אונליין/פרונטאלי). תלמידים מחפשים לפי כלי או עיר, רואים דירוג
ממוצע וקוראים ביקורות, ומתכתבים ישירות עם המורה.

### 5. קהילה — שאלות ותשובות
שאלות חופשיות ("מישהו מכיר את הקטע הזה", "האמפ לא נדלק"), תשובות,
upvotes ותגיות.

### 6. Marketplace
מודעות מכירה / השכרה / החלפה לכל ציוד מוזיקלי — גיטרה יד שניה, מיקרופון
בשבת, תקליט עם חתימה. תמונות, מחיר, מיקום, יצירת קשר ישיר עם המוכר.

### 7. Collabs (הפיצ'ר המרכזי)
פיצ'ר שיתופי הפעולה לפי הבריף שלך:

- **Open mode** — מעלים track בסיס ("פתוח לרווחה"), אחרים יכולים להעלות
  מעליו סטם משלהם והוא מצטרף אוטומטית.
- **Invite mode** — אחרים שולחים סטם, ואתה כבעל הפרויקט מאשר/דוחה כל
  הקלטה לפני שהיא נכנסת לפרויקט.
- כל קולאב כולל ז'אנר, BPM, key, רשימת כלים מבוקשים, והערת זכויות
  יוצרים/חלוקה. מוזיקאים שולחים בדיוק את הסטם שבו הם מנגנים סולו גיטרה
  או סקסופון, ובעל הפרויקט שומע ומחליט אם להוסיף לפרויקט.
- כל הודעה על תרומה חדשה מופיעה בדף הקולאב; אפשר גם לפנות ישירות
  בהודעות לאמן ש"מציע את עצמו לנגן".

### 8. הודעות פרטיות
DM 1:1 בין כל שני משתמשים — מוצג בכל דף פרופיל / מודעה / מורה.

## מבנה הפרויקט

```
.
├── server/         Express API + JSON store + uploads
│   └── src/
│       ├── index.js
│       ├── db.js
│       ├── auth.js
│       ├── upload.js
│       ├── seed.js
│       └── routes/
│           ├── auth.js
│           ├── users.js
│           ├── posts.js
│           ├── playlists.js
│           ├── teachers.js
│           ├── questions.js
│           ├── marketplace.js
│           ├── collabs.js
│           └── messages.js
├── client/         React + Vite frontend
│   └── src/
│       ├── App.jsx, main.jsx, auth.jsx, api.js, styles.css
│       ├── components/  (Layout, Avatar, PostCard)
│       └── pages/       (Login, Register, Feed, Explore, Profile,
│                         EditProfile, Teachers, TeacherDetail,
│                         Community, QuestionDetail,
│                         Marketplace, ListingDetail,
│                         Collabs, CollabDetail, Messages)
└── package.json    (npm workspaces — server + client)
```

## הערות

- ה־JSON store נועד לפיתוח/דמו — לפרודקשן אמיתי כדאי להחליף ל־Postgres
  (השכבה ב־`server/src/db.js` קומפקטית מספיק לכך).
- ה־Spotify connect הוא mock — חיבור OAuth אמיתי דורש app ב־
  Spotify Developer Dashboard והעברת `client_id`/`client_secret`.
- העלאות קבצים נשמרות תחת `server/uploads/` ומוגשות תחת `/uploads/...`.
