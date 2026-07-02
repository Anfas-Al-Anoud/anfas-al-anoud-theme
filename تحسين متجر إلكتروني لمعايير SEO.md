لتنفيذ رؤيتك الاستراتيجية في إدارة وتطوير متجر "أنفاس العنود"، تم إعداد المحتوى المطلوب ليتوافق مع أحدث معايير السيو (SEO)، مع بناء هيكلة البيانات المنظمة (Schema Markup) الخاصة بمنصة شوبيفاي لضمان ظهور المنتجات بشكل احترافي في محركات البحث. كما تم تنسيق نصوص الصفحة الرئيسية وسياسة الخصوصية بصيغة HTML، مع تطبيق قاعدة وضع التنوين دائمًا قبل الألف في كامل النصوص، وتضمين نصوص `alt` الوصفية للصور.

### 1. أوصاف المنتجات المتوافقة مع معايير السيو (SEO)

تمت صياغة الأوصاف لتتضمن الكلمات المفتاحية المتعلقة بالسوق الإماراتي، مع التركيز على المنافع العاطفية والعملية للمنتج. (تم تطبيق هذا النموذج على منتجين رئيسيين كمرجع لتعميمه على باقي المنتجات):

**المنتج الأول: بدي أويل غناتي**

* **العنوان التعريفي (Title Tag):** بدي أويل غناتي - زيت جسم للترطيب العميق | أنفاس العنود
* 
**الوصف التعريفي (Meta Description):** زيت جسم خيالي يغلف بشرتك برائحة العود والورد لترطيب عميق ولمعان فخم. تركيبة سريعة الامتصاص تمنحكِ نعومة حريرية وثباتًا طويلًا للعطر.


* **الوصف التفصيلي للمنتج:**
* عيشي فخامة إماراتية تعانق بشرتك بنعومة. صُمم هذا الزيت ليمنحكِ ترطيبًا عميقًا يدوم لساعات طويلة جدًا، مع لمعة فخمة تجعل بشرتك تبرق.


* بفضل تركيبته الفريدة، تتشربه البشرة بثوانٍ معدودة دون أي لزوجة، ليترك جسمك ناعمًا مثل الزبدة والمخمل.


* يغذي البشرة طبيعيًا، ويثبت عطرك ودخونك لفترة أطول بكثير، ليكون دلالك اليومي المليء بالاسترخاء.




* 
**هرم الرائحة:** القمة: أزهار  | القلب: مسك  | القاعدة: خشب.


* 
**السعر:** 36.50 درهم.



**المنتج الثاني: دخون غناتي**

* **العنوان التعريفي (Title Tag):** دخون غناتي - معمول إماراتي فاخر للمجالس | أنفاس العنود
* 
**الوصف التعريفي (Meta Description):** معمول إماراتي برائحة إماراتية ولمسة ملكية يمنحك ثباتًا خياليًا. علبة فاخرة تحتوي على 5 حبات مسلفنة باللون الذهبي (75 غرام) مع تولة زيت عطري.


* **الوصف التفصيلي للمنتج:**
* رائحة تعانق الأصالة والنعومة الفرنسية، صُممت لتعطر منزلك بدفء وفخامة تفتح النفس.


* يتميز بثبات خيالي يدوم لأيام طويلة في الشعر والثياب والمجالس، مع فوحان قوي يملأ المكان من اللحظة الأولى.


* يحترق بهدوء ونظافة دون أي رائحة احتراق، لتتدرج نفحاته العطرية بكل رقي.




* 
**المكونات:** بودرة عود، مسك أبيض وأسود، ماء ورد، عسل، عطر عود الشيخ عبدالله، أخشاب الغاياك والكوباهو، برالين وردي، ورد، وياسمين.


* 
**السعر:** 113 درهم إماراتي.



---

### 2. بنية JSON-LD لـ Shopify Schema (Product)

هذا الكود الجاهز يُزرع في قالب الـ Liquid الخاص بالمنتج (Product Template) لتعزيز ظهوره في محرك بحث جوجل (Rich Snippets).

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  [cite_start]"name": "بدي أويل غناتي [cite: 107]",
  "image": [
    "https://yourdomain.com/image-url.jpg"
  ],
  [cite_start]"description": "زيت خيالي يغلف جسمج بريحة العود والورد، يعطيج ترطيب عميق ولمعة صحية تفتح النفس، ويخلي ريحتج تفوح فخامة طول اليوم بدون أي لزوجة. [cite: 113]",
  "sku": "BODY-OIL-GHANATI",
  "brand": {
    "@type": "Brand",
    "name": "أنفاس العنود"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://yourdomain.com/products/body-oil-ghanati",
    "priceCurrency": "AED",
    "price": "36.50",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition"
  }
}
</script>

```

---

### 3. هيكل HTML للصفحة الرئيسية (Homepage)

تم بناء هيكل الصفحة باستخدام وسوم دلالية (Semantic HTML)، مع مراعاة وضع نصوص `alt`، وتطبيق التنوين قبل الألف.

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>متجر أنفاس العنود</title>
</head>
<body>

    <div class="top-bar">
        [cite_start]<marquee>استغلي وقتج الذهبي.. توصيل مجاني اليوم لعيونج [cite: 2] [cite_start]– عروض عيد الأضحى... [cite: 2] ما عيبج المنتج؟ [cite_start]ما تحاتين رديه خلال 3 أيام [cite: 2]</marquee>
    </div>

    <header>
        <div class="header-right">
            [cite_start]<img src="icon-menu.png" alt="أيقونة الخطوط الثلاثة للقائمة المنسدلة [cite: 10]">
            <nav class="main-menu">
                <ul>
                    [cite_start]<li>حسابج (وضع قائمة منسدلة: حسابج – سوي حساب – دخلي حسابج) [cite: 4]</li>
                    [cite_start]<li>سلتج [cite: 5]</li>
                    [cite_start]<li>دوري اللي بخاطرج [cite: 6]</li>
                </ul>
            </nav>
        </div>
        <div class="logo-center">
            [cite_start]<img src="logo.png" alt="لوجو أنفاس العنود [cite: 8]">
        </div>
    </header>

    <section class="hero-section">
        [cite_start]<img src="hero-products.jpg" alt="صورة للمنتجات من الأعلى [cite: 12]" class="hero-img-left">
        <div class="hero-text-right">
            [cite_start]<h1>عيشي جوج.. وخلج غير عنهم [cite: 12]</h1>
            [cite_start]<p>تميزي بخلطات ما تتقلد، تعطيج حضورًا قويًا وتلفت الانتباه [cite: 12]</p>
        </div>
    </section>

    <section class="main-categories">
        <ul>
            [cite_start]<li><img src="dokhoon-icon.png" alt="أيقونة دخون السنع [cite: 14, 15][cite_start]"> دخون السنع [cite: 15]</li>
            [cite_start]<li><img src="perfume-icon.png" alt="أيقونة عطور الكشخة [cite: 14, 16][cite_start]"> عطور الكشخة [cite: 16]</li>
            [cite_start]<li><img src="care-icon.png" alt="أيقونة دلع وعناية [cite: 14, 17][cite_start]"> دلع وعناية [cite: 17]</li>
            [cite_start]<li><img src="box-icon.png" alt="أيقونة بوكسات الزين [cite: 14, 18][cite_start]"> بوكسات الزين [cite: 18]</li>
        </ul>
    </section>

    <section class="mood-categories">
        [cite_start]<h2>اختاري اللي يلوق على جوج [cite: 19]</h2>
        <div class="row-1">
            <div class="card">
                [cite_start]<img src="morning-perfume.jpg" alt="عطور الدوام والطلعات [cite: 20, 21]">
                [cite_start]<h3>حق الدوام والطلعات [cite: 21]</h3>
                [cite_start]<p>عطور باردة وهادية تفتح النفس من الصبح وتثبت معاج طول اليوم... وتخلي كل من سلم عليج يسألج عن ريحتج! [cite: 21]</p>
            </div>
            <div class="card">
                [cite_start]<img src="shower-care.jpg" alt="منتجات الدلع والشاور [cite: 20, 22]">
                [cite_start]<h3>الدلع والشاور [cite: 22]</h3>
                <p>إحساس النظافة اللي يرد الروح! [cite_start]منتجات تدلع بشرتج وشعرج وتخليج تحسين إنج غيمة تمشي على الأرض. [cite: 22]</p>
            </div>
            <div class="card">
                [cite_start]<img src="majlis-dokhoon.jpg" alt="دخون ومرشات الميلس [cite: 20, 23]">
                [cite_start]<h3>فخامة الميلس والمواجيب [cite: 23]</h3>
                [cite_start]<p>بيّضي ويهج جدام خطاريج... دخون ومرشات تخلي ريحة البيت والميلس تفوح قبل لا يدخلون من الباب. [cite: 23]</p>
            </div>
        </div>
        <div class="row-2">
            <div class="card">
                [cite_start]<img src="evening-perfume.jpg" alt="عطور السهرات والعزايم [cite: 20, 24]">
                [cite_start]<h3>للسهرات والعزايم [cite: 24]</h3>
                [cite_start]<p>تبين تلفتين الانتباه من أول ما تدخلين الصالة؟ [cite: 24] [cite_start]هذي الروايح الفخمة حق المناسبات اللي تبين تكونين فيها 'حديث الموسم'. [cite: 25]</p>
            </div>
            <div class="card">
                [cite_start]<img src="bride-box.jpg" alt="بوكسات زْهبة العروس [cite: 20, 26]">
                [cite_start]<h3>زْهبة العروس [cite: 26]</h3>
                [cite_start]<p>لأن هالليلة ليلتج ومحد بيطوفج.. جهزتالج بوكسات ومجموعات ملكية تخلي ريحتج خيال، وتبقى ذكرى ما تنسی في أهم يوم بحياتج. [cite: 26]</p>
            </div>
        </div>
    </section>

    <section class="best-sellers">
        [cite_start]<h2>البيست سيلر اللي طاروا فيه البنات [cite: 27]</h2>
        [cite_start]<p>هذي أكثر المنتجات اللي حبوها البنات ورجعوا طلبوها مرة ثانية.. جربيها وما بتندمين. [cite: 28]</p>
        [cite_start]<div class="carousel">قائمة كاروسيل تعرض أفضل المنتجات مبيعًا [cite: 29]</div>
    </section>

    <section class="gifts-section">
        [cite_start]<h2>تبين تهدين حد غالي؟ [cite: 30]</h2>
        [cite_start]<p>لا تحاتين غناتي، مجهزين لج بوكسات تبيض الويه وتفرح القلب، بس اختاري وبنوصلها للي يعزون عليج. [cite: 31]</p>
    </section>

    <section class="testimonials">
        [cite_start]<h2>شو قالوا عنا الحبايب؟ [cite: 32]</h2>
        [cite_start]<p>تصفحي سوالف وتجارب البنات اللي وثقوا فينا، وشوفي كيف منتجاتي غيرت مزاجهم وكملت كشختهم في مناسباتهم. [cite: 33]</p>
    </section>

    <section class="quality-banner">
        [cite_start]<img src="ingredients-banner.jpg" alt="صورة تعبر عن جودة المكونات [cite: 34, 35]">
        [cite_start]<h2>سر الزين في تفاصيلنا.. أنا دايمًا أختار لج أصفى المكونات عشان تميزج في كل خطوة. [cite: 35]</h2>
        [cite_start]<button>اكتشفي أسرار منتجاتي [cite: 36]</button>
    </section>

    <section class="faq-section">
        <h2>في خاطرج سؤال؟ [cite_start]أنا حاضرة عشانج [cite: 37]</h2>
        <ul>
            [cite_start]<li>شو نوع الدخون اللي عندج؟ [cite: 39]</li>
            [cite_start]<li>ايش هي طرق الدفع المتوفرة عندج؟ [cite: 40]</li>
            [cite_start]<li>كم حبة دخون في الغرشة؟ [cite: 41]</li>
            [cite_start]<li>كيف أطلب؟ [cite: 42]</li>
            [cite_start]<li>اقدر أدفع بتابي أو تمارا؟ [cite: 43]</li>
            [cite_start]<li>وين توصلين؟ [cite: 44]</li>
            [cite_start]<li>ايش هي العروض اللي عاملتيها؟ [cite: 45]</li>
            [cite_start]<li>هل في شحن لخارج الإمارات؟ [cite: 46]</li>
            [cite_start]<li>ايش أسوي لو المنتج لو ما عيبني؟ [cite: 47]</li>
            [cite_start]<li>هل الروائح عندج مناسبة للنساء والرجال؟ [cite: 48]</li>
        </ul>
    </section>

    <section class="features-section">
        <div class="feature">
            [cite_start]<img src="delivery-icon.png" alt="أيقونة التوصيل [cite: 54]">
            [cite_start]<p>لحد باب دارج: وين ما كنتي في الإمارات، طلبج يوصل بأسرع وقت. [cite: 55]</p>
        </div>
        <div class="feature">
            [cite_start]<img src="payment-icon.png" alt="أيقونة الدفع الآمن [cite: 54]">
            [cite_start]<p>دفعج بأمان وراحة: طرق دفع متعددة ومضمونة، اختاري اللي يريّحج ويسهل عليج. [cite: 56]</p>
        </div>
        <div class="feature">
            [cite_start]<img src="quality-icon.png" alt="أيقونة جودة المنتجات [cite: 54]">
            [cite_start]<p>جودة تبيّض الويه: منتجاتي أصلية 100%، ومضمونة عشان تزيدج فخامة وسنع. [cite: 57]</p>
        </div>
        <div class="feature">
            [cite_start]<img src="support-icon.png" alt="أيقونة خدمة العملاء [cite: 54]">
            [cite_start]<p>حاضرة للطيبين: دايمًا موجودة عشان أخدمج، وأرد على استفساراتج من عيوني. [cite: 58]</p>
        </div>
    </section>

    <footer>
        <div class="footer-right">
            [cite_start]<h3>رمسيني.. وريّحي بالج [cite: 60]</h3>
            [cite_start]<p>أي شي بخاطرج، سواء استشارة أو متابعة لطلبيتج، كلميني ومابقصر وياج، رضاج وراحتج هي غايتي. [cite: 61]</p>
            [cite_start]<a href="#"><img src="whatsapp-icon.png" alt="رمز الواتساب للتواصل [cite: 62]"></a>
        </div>
        <div class="footer-center">
            <ul>
                [cite_start]<li><a href="#">وين طلبج؟ [cite: 64]</a></li>
                [cite_start]<li><a href="#">أمانج وخصوصيتج [cite: 64]</a></li>
                [cite_start]<li><a href="#">اتفاقنا الحلو [cite: 64]</a></li>
                [cite_start]<li><a href="#">إذا ما عيبج؟ [cite: 64]</a></li>
                [cite_start]<li><a href="#">دفعي باللي يريّحج [cite: 64]</a></li>
            </ul>
        </div>
        <div class="footer-left">
            [cite_start]<h3>لمتنا أحلى وياج [cite: 66]</h3>
            [cite_start]<p>خلك قريبة من القلب وتابعينا.. عشان تشوفين نصايحي السريعة للسنع، وأجدد عروضي، وتكونين جزءًا من عايلتنا. [cite: 67]</p>
            <div class="social-icons">
                [cite_start]<img src="facebook.png" alt="فيسبوك [cite: 68]">
                [cite_start]<img src="instagram.png" alt="انستجرام [cite: 68]">
                [cite_start]<img src="tiktok.png" alt="تيكتوك [cite: 68]">
                [cite_start]<img src="snapchat.png" alt="سناب شات [cite: 68]">
                [cite_start]<img src="threads.png" alt="ثريدز [cite: 68]">
            </div>
        </div>
        <div class="newsletter-bottom">
            [cite_start]<input type="email" placeholder="حطي إيميلج هنيه [cite: 70]">
            [cite_start]<button>خلينا على تواصل [cite: 70]</button>
        </div>
    </footer>

    <div class="chat-popup">
        [cite_start]<img src="anoud-avatar.png" alt="صورة العنود للمساعدة [cite: 49]">
        [cite_start]<h4>سولفي وياي [cite: 50]</h4>
        <p>محتارة شو اللي يلوق على شخصيتج؟ [cite_start]أنا هنيه عشان أساعدج تختارين صح. [cite: 51]</p>
        [cite_start]<p>خبريني عن ذوقج والمود اللي تحبينه، وبختار لج الريحة اللي تترجم إحساسج وتزيدج ثقة وسنع. [cite: 52]</p>
    </div>

</body>
</html>

```

---

### 4. هيكل HTML لسياسة الخصوصية

تم الالتزام بوضع التنوين قبل الألف بدقة (مثل: دائمًا، نهائيًا).

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>أمانج وخصوصيتج | متجر أنفاس العنود</title>
</head>
<body>

    <main class="privacy-policy">
        [cite_start]<h1>أمانج وخصوصيتج [cite: 71]</h1>

        [cite_start]<h2>شو اللي بحتاجه منج؟ [cite: 72]</h2>
        [cite_start]<p>عشان أقدر أضبطج وأطرش لج طلبيتج لين باب البيت، بحتاج منج شوية معلومات أساسية وبسيطة: [cite: 73]</p>
        <ul>
            [cite_start]<li><strong>اسمچ الكريم:</strong> عشان أعرف أزقرج وأحفظ طلبيتج بيه. [cite: 74]</li>
            [cite_start]<li><strong>رقم تليفونج:</strong> عشان أقدر أتواصل وياج ويوصلج طلبج بسرعة. [cite: 75]</li>
            [cite_start]<li><strong>إيميلج:</strong> عشان أطرش لج الفاتورة، وأبشرج بكل يديد عندنا. [cite: 76]</li>
            [cite_start]<li><strong>عنوانج بالضبط:</strong> عشان الطلبية ما تضيع وتوصلج للباب. [cite: 77]</li>
            [cite_start]<li><strong>معلومات الدفع:</strong> وهذي تطمني، تمر بأنظمة آمنة ومحفوظة. [cite: 78]</li>
        </ul>

        [cite_start]<h2>ليش نطلب هالبيانات؟ [cite: 79]</h2>
        <ul>
            [cite_start]<li>عشان نجهز طلبيتج بأسرع وقت ممكن وأبدًا ما نتأخر عليج. [cite: 80]</li>
            [cite_start]<li>عشان أخبرج بالتشكيلات اليديدة والعروض اللي متأكدة بتعجبج. [cite: 81]</li>
            [cite_start]<li>عشان لو عندج أي استفسار أو واجهتي أي مشكلة، أقدر أرد عليج وأخدمج بعيوني. [cite: 82]</li>
        </ul>

        [cite_start]<h2>سرك في بير [cite: 83]</h2>
        <p>تطمني يا الغالية، معلوماتج مستحيل نعطيها لأي حد غريب. [cite_start]إحنا بس نشارك الأشياء الضرورية مع "شركاء النجاح" عشان تكتمل الخدمة، مثل: [cite: 84]</p>
        <ul>
            [cite_start]<li><strong>المندوب (شركة التوصيل):</strong> نعطيه بس رقمج وعنوانج عشان يندل بيتج. [cite: 85]</li>
            [cite_start]<li><strong>بوابات الدفع:</strong> عشان تكتمل عملية الشراء بأمان وراحة تامة. [cite: 86]</li>
        </ul>

        [cite_start]<h2>الكوكيز [cite: 87]</h2>
        [cite_start]<p>موقعنا بسوي شي اسمه "كوكيز" (Cookies) هذي عبارة عن ملفات صغيرة تساعدنا نفهم ذوقج والأشياء اللي تهمج، عشان المرة الياية يوم تدخلين المتجر، نطلع لج الأشياء اللي تحبينها وتكون تجربتج أسرع وأرتب. [cite: 88]</p>

        [cite_start]<h2>قفل ومفتاح [cite: 89]</h2>
        <p>حاطين الموقع ورا بيبان مقفلة! [cite_start]نستخدم أحسن أنظمة الأمان والتشفير في السوق، عشان تتسوقين وإنتي مرتاحة ومطمنة، ومحد يقدر يوصل لمعلوماتج الشخصية أبدًا. [cite: 90]</p>

        [cite_start]<h2>الشور شورج [cite: 91]</h2>
        [cite_start]<p>في النهاية، هذي بياناتج وإنتي لج الحرية الكاملة فيها، يعني: [cite: 92]</p>
        <ul>
            [cite_start]<li>تقدرين في أي وقت تدخلين حسابج في الموقع وتعدلين أي معلومة تبينها براحتج. [cite: 93]</li>
            [cite_start]<li>إذا حبيتي في يوم نحذف بياناتج من عندنا نهائيًا، بس عطينا خبر وفالج طيب، بنمسحها على طول. [cite: 94]</li>
        </ul>

        [cite_start]<h2>تبين تسألين عن شي؟ [cite: 95]</h2>
        [cite_start]<p>لو عندج أي سؤال عن هالسياسة، أو بس حابة تسولفين وتستفسرين عن طلبيتج، أنا دايمًا موجودة لج. [cite: 96]</p>
        [cite_start]<p>لا تترددين، وتواصلي وياي على: (رقم الواتس) [cite: 97]</p>
    </main>

</body>
</html>

```