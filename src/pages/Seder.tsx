import React, { useState, useEffect } from 'react';
import { Wine, Clock, Users, BookOpen, ChevronRight, ChevronLeft, Play, Pause, RotateCcw, CheckCircle2, Circle, Lightbulb, Gamepad2 } from 'lucide-react';

const SEDER_STEPS = [
  { 
    id: 'kadesh', 
    name: 'קַדֵּשׁ', 
    adult: 'קידוש על כוס ראשונה של יין.', 
    kid: 'שותים מיץ ענבים טעים ואומרים תודה להשם!',
    tasks: ['למזוג כוס ראשונה לכולם', 'לכוון לצאת ידי חובת קידוש וארבע כוסות', 'לשתות בהסבת שמאל'],
    insight: 'המילה "קדש" מזכירה לנו שהחירות האמיתית מתחילה בקידוש הזמן והמטרה. אנחנו לא סתם בני חורין לעשות מה שבא לנו, אלא בני חורין לקדש את החיים.',
    text: 'יוֹם הַשִּׁשִּׁי. וַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ וְכָל צְבָאָם...\n\nבָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן.\n\nבָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל עָם...\n\nבָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה.'
  },
  { 
    id: 'urchatz', 
    name: 'וּרְחַץ', 
    adult: 'נטילת ידיים ללא ברכה לפני אכילת הכרפס.', 
    kid: 'נוטלים ידיים כמו גדולים, אבל בלי לברך!',
    tasks: ['ליטול ידיים (3 פעמים כל יד)', 'לא לברך "על נטילת ידיים"'],
    insight: 'המים מטהרים. לפני שאנחנו ניגשים לאכול את הכרפס שמסמל את הדמעות והקושי, אנחנו מטהרים את הידיים שלנו, סמל לעשייה נקייה וטהורה.'
  },
  { 
    id: 'karpas', 
    name: 'כַּרְפַּס', 
    adult: 'אכילת ירק (כרפס/תפוח אדמה) טבול במי מלח.', 
    kid: 'אוכלים ירק טבול במי מלח, זכר לדמעות במצרים.',
    tasks: ['לטבול חתיכת ירק במי מלח', 'לברך "בורא פרי האדמה"', 'לכוון לפטור גם את המרור', 'לאכול פחות מכזית'],
    insight: 'המילה "כרפס" מורכבת מהאותיות ס\' פרך. 60 (ס\') ריבוא (600,000) בני ישראל עבדו בעבודת פרך. מי המלח מסמלים את הדמעות.',
    text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הָאֲדָמָה.'
  },
  { 
    id: 'yachatz', 
    name: 'יַחַץ', 
    adult: 'חציית המצה האמצעית, החצי הגדול נשמר לאפיקומן.', 
    kid: 'שוברים את המצה! החצי הגדול מתחבא לאפיקומן.',
    tasks: ['לקחת את המצה האמצעית', 'לחצות אותה ל-2', 'להצפין את החצי הגדול לאפיקומן', 'להחזיר את החצי הקטן לקערה'],
    insight: 'המצה מסמלת את האדם. ה"יחץ" מלמד אותנו שהשבר הוא חלק מהחיים, אבל דווקא החלק הגדול והחשוב יותר (האפיקומן) נשמר לעתיד, לגאולה.'
  },
  { 
    id: 'magid', 
    name: 'מַגִּיד', 
    adult: 'סיפור יציאת מצרים, מה נשתנה, עבדים היינו.', 
    kid: 'החלק הכי מעניין! שואלים קושיות ומספרים סיפורים.',
    tasks: ['למזוג כוס שנייה', 'לומר "הא לחמא עניא"', 'לשאול "מה נשתנה" (הילדים)', 'לספר את סיפור יציאת מצרים', 'לשתות כוס שנייה בהסבה'],
    insight: 'עבד לא שואל שאלות. עצם היכולת לשאול "למה?", להטיל ספק, להסתקרן - זוהי המהות של אדם חופשי. היהדות מעודדת שאלות.',
    text: 'הָא לַחְמָא עַנְיָא דִּי אֲכָלוּ אַבְהָתָנָא בְּאַרְעָא דְמִצְרָיִם. כָּל דִכְפִין יֵיתֵי וְיֵיכֹל, כָּל דִצְרִיךְ יֵיתֵי וְיִפְסַח...\n\nמַה נִּשְׁתַּנָּה הַלַּיְלָה הַזֶּה מִכָּל הַלֵּילוֹת?\nשֶׁבְּכָל הַלֵּילוֹת אָנוּ אוֹכְלִין חָמֵץ וּמַצָּה, הַלַּיְלָה הַזֶּה כֻּלּוֹ מַצָּה...\n\nעֲבָדִים הָיִינוּ לְפַרְעֹה בְּמִצְרָיִם, וַיּוֹצִיאֵנוּ יְיָ אֱלֹהֵינוּ מִשָּׁם בְּיָד חֲזָקָה וּבִזְרוֹעַ נְטוּיָה...'
  },
  { 
    id: 'rachtza', 
    name: 'רָחְצָה', 
    adult: 'נטילת ידיים עם ברכה לקראת הסעודה.', 
    kid: 'שוב נוטלים ידיים, והפעם מברכים!',
    tasks: ['ליטול ידיים', 'לברך "על נטילת ידיים"', 'לא לדבר עד אכילת המצה'],
    text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל נְטִילַת יָדַיִם.'
  },
  { 
    id: 'motzi', 
    name: 'מוֹצִיא', 
    adult: 'ברכת המוציא לחם מן הארץ על המצות.', 
    kid: 'מברכים על המצה כמו שמברכים על לחם.',
    tasks: ['לאחוז בשלושת המצות', 'לברך "המוציא לחם מן הארץ"'],
    text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמּוֹצִיא לֶחֶם מִן הָאָרֶץ.'
  },
  { 
    id: 'matzah', 
    name: 'מַצָּה', 
    adult: 'ברכת על אכילת מצה ואכילת כזית מצה.', 
    kid: 'אוכלים את המצה הקריספית והטעימה.',
    tasks: ['לשמוט את המצה התחתונה', 'לברך "על אכילת מצה"', 'לאכול כזית (רצוי 2 כזיתים) בהסבת שמאל'],
    text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל אֲכִילַת מַצָּה.'
  },
  { 
    id: 'maror', 
    name: 'מָרוֹר', 
    adult: 'אכילת מרור (חסה/חזרת) זכר לשיעבוד.', 
    kid: 'אוכלים משהו קצת מר, כדי לזכור שהיה קשה במצרים.',
    tasks: ['לקחת כזית מרור', 'לטבול מעט בחרוסת', 'לברך "על אכילת מרור"', 'לאכול ללא הסבה'],
    text: 'בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל אֲכִילַת מָרוֹר.'
  },
  { 
    id: 'korech', 
    name: 'כּוֹרֵךְ', 
    adult: 'אכילת מצה ומרור יחד (כריכת הלל).', 
    kid: 'עושים סנדוויץ\' מיוחד ממצה ומרור!',
    tasks: ['לקחת כזית מהמצה התחתונה', 'לקחת כזית מרור', 'לטבול בחרוסת', 'לומר "זכר למקדש כהלל"', 'לאכול בהסבת שמאל'],
    text: 'זֵכֶר לְמִקְדָּשׁ כְּהִלֵּל. כֵּן עָשָׂה הִלֵּל בִּזְמַן שֶׁבֵּית הַמִּקְדָּשׁ הָיָה קַיָּם: הָיָה כּוֹרֵךְ מַצָּה וּמָרוֹר וְאוֹכֵל בְּיַחַד, לְקַיֵּם מַה שֶּׁנֶּאֱמַר: עַל מַצּוֹת וּמְרֹרִים יֹאכְלֻהוּ.'
  },
  { 
    id: 'shulchan_orech', 
    name: 'שֻׁלְחָן עוֹרֵךְ', 
    adult: 'סעודת החג.', 
    kid: 'יאמי! אוכלים את סעודת החג הטעימה.',
    tasks: ['לאכול את סעודת החג', 'נהוג להתחיל בביצה קשה במי מלח', 'לא לאכול יותר מדי כדי להשאיר מקום לאפיקומן']
  },
  { 
    id: 'tzafun', 
    name: 'צָפוּן', 
    adult: 'אכילת האפיקומן זכר לקרבן פסח.', 
    kid: 'מוצאים את האפיקומן ואוכלים אותו לקינוח.',
    tasks: ['למצוא את האפיקומן', 'לאכול כזית מצה זכר לקרבן פסח', 'לאכול בהסבת שמאל', 'לסיים לאכול לפני חצות הלילה']
  },
  { 
    id: 'barech', 
    name: 'בָּרֵךְ', 
    adult: 'ברכת המזון וכוס שלישית.', 
    kid: 'אומרים תודה להשם על האוכל הטעים.',
    tasks: ['למזוג כוס שלישית', 'לברך ברכת המזון', 'לשתות כוס שלישית בהסבת שמאל', 'למזוג כוס רביעית וכוס של אליהו הנביא'],
    text: 'שִׁיר הַמַּעֲלוֹת, בְּשׁוּב יְיָ אֶת שִׁיבַת צִיּוֹן הָיִינוּ כְּחֹלְמִים...\n\nבָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַזָּן אֶת הָעוֹלָם כֻּלּוֹ בְּטוּבוֹ בְּחֵן בְּחֶסֶד וּבְרַחֲמִים...\n\n(בסיום הברכה:) בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן.'
  },
  { 
    id: 'hallel', 
    name: 'הַלֵּל', 
    adult: 'קריאת ההלל וכוס רביעית.', 
    kid: 'שרים שירים שמחים להשם!',
    tasks: ['לפתוח את הדלת לאליהו הנביא', 'לומר "שפוך חמתך"', 'לקרוא את ההלל', 'לברך "יהללוך" ו"בורא פרי הגפן"', 'לשתות כוס רביעית בהסבת שמאל', 'ברכה אחרונה (על הגפן)'],
    text: 'שְׁפֹךְ חֲמָתְךָ אֶל הַגּוֹיִם אֲשֶׁר לֹא יְדָעוּךָ וְעַל מַמְלָכוֹת אֲשֶׁר בְּשִׁמְךָ לֹא קָרָאוּ...\n\nהַלְלוּיָהּ הַלְלוּ עַבְדֵי יְיָ, הַלְלוּ אֶת שֵׁם יְיָ...\n\n(בסיום ההלל:) בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן.'
  },
  { 
    id: 'nirtzah', 
    name: 'נִרְצָה', 
    adult: 'סיום הסדר ושירת פיוטים (חד גדיא, אחד מי יודע).', 
    kid: 'שרים "אחד מי יודע" ו"חד גדיא" והולכים לישון שמחים!',
    tasks: ['לומר "לשנה הבאה בירושלים הבנויה"', 'לשיר את פיוטי החג (אחד מי יודע, חד גדיא)'],
    insight: 'הסדר נרצה והתקבל ברצון. עכשיו אנחנו מוכנים לצאת לדרך חדשה, בני חורין אמיתיים, עם הפנים לירושלים.',
    text: 'חֲסַל סִדּוּר פֶּסַח כְּהִלְכָתוֹ, כְּכָל מִשְׁפָּטוֹ וְחֻקָּתוֹ...\nלְשָׁנָה הַבָּאָה בִּירוּשָׁלָיִם הַבְּנוּיָה!\n\nאַדִּיר הוּא יִבְנֶה בֵּיתוֹ בְּקָרוֹב...\n\nאֶחָד מִי יוֹדֵעַ? אֶחָד אֲנִי יוֹדֵעַ...\n\nחַד גַּדְיָא, חַד גַּדְיָא...'
  }
];

export function Seder({ user }: { user: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isKidMode, setIsKidMode] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [showInsight, setShowInsight] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Reset insight and text when changing steps
  useEffect(() => {
    setShowInsight(false);
    setShowText(false);
  }, [currentStep]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, SEDER_STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const toggleTask = (taskIndex: number) => {
    const key = `${currentStep}-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const stepData = SEDER_STEPS[currentStep];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול ליל הסדר</h1>
          <p className="text-gray-600 mt-1">המדריך האינטראקטיבי המלא לניהול הסדר</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600">מצב ילדים</span>
          <button 
            onClick={() => setIsKidMode(!isKidMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isKidMode ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isKidMode ? 'left-1 translate-x-0' : 'right-1 translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Timer & Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center">
          <h2 className="text-gray-500 font-medium mb-2 flex items-center gap-2"><Clock size={18} /> זמן מתחילת הסדר</h2>
          <div className="text-4xl font-mono font-bold text-blue-900 mb-4">{formatTime(timeElapsed)}</div>
          <div className="flex gap-3">
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 ${isTimerRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
              {isTimerRunning ? 'השהה' : 'התחל'}
            </button>
            <button onClick={() => { setIsTimerRunning(false); setTimeElapsed(0); }} className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2">
              <RotateCcw size={18} /> איפוס
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>התקדמות הסדר</span>
            <span>{Math.round((currentStep / (SEDER_STEPS.length - 1)) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (SEDER_STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {SEDER_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentStep === idx ? 'bg-blue-600 text-white shadow-md' : 
                currentStep > idx ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {step.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 text-center py-8 px-4 bg-blue-50/50 rounded-2xl border border-blue-100 relative min-h-[300px] flex flex-col justify-center">
            <h2 className="text-5xl font-bold text-blue-900 mb-6">{stepData.name}</h2>
            
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm max-w-2xl mx-auto w-full">
              <p className="text-xl text-gray-800 leading-relaxed">
                {isKidMode ? stepData.kid : stepData.adult}
              </p>
            </div>
            
            {stepData.insight && !isKidMode && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowInsight(!showInsight)}
                  className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-full font-medium transition-colors"
                >
                  <Lightbulb size={18} />
                  {showInsight ? 'הסתר ווארט' : 'ווארט לשולחן הסדר'}
                </button>
                
                {showInsight && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-right animate-in fade-in slide-in-from-top-2">
                    <p className="leading-relaxed">{stepData.insight}</p>
                  </div>
                )}
              </div>
            )}

            {stepData.text && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowText(!showText)}
                  className="inline-flex items-center gap-2 text-blue-700 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-full font-medium transition-colors"
                >
                  <BookOpen size={18} />
                  {showText ? 'הסתר טקסט מההגדה' : 'קרא בהגדה'}
                </button>
                
                {showText && (
                  <div className="mt-4 p-6 bg-white border border-blue-200 rounded-xl text-blue-900 text-right animate-in fade-in slide-in-from-top-2 shadow-sm max-h-[400px] overflow-y-auto">
                    <p className="leading-relaxed whitespace-pre-wrap font-serif text-lg md:text-xl">{stepData.text}</p>
                  </div>
                )}
              </div>
            )}

            {isKidMode && (
              <div className="mt-6 inline-flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-full font-medium">
                <Gamepad2 size={18} />
                זמן למשחק או שאלה לילדים!
              </div>
            )}
            
            <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4">
              <button onClick={nextStep} disabled={currentStep === SEDER_STEPS.length - 1} className="p-3 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105">
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4">
              <button onClick={prevStep} disabled={currentStep === 0} className="p-3 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Checklist Area */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={20} />
              רשימת פעולות ל{stepData.name}
            </h3>
            
            <div className="space-y-3">
              {stepData.tasks?.map((task, idx) => {
                const key = `${currentStep}-${idx}`;
                const isCompleted = completedTasks[key];
                
                return (
                  <button
                    key={idx}
                    onClick={() => toggleTask(idx)}
                    className="w-full flex items-start gap-3 text-right group"
                  >
                    <div className={`mt-0.5 shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <span className={`text-sm md:text-base transition-all ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {task}
                    </span>
                  </button>
                );
              })}
              
              {(!stepData.tasks || stepData.tasks.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">אין פעולות מיוחדות לשלב זה.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
