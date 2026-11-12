Clinical Nutrition Assistant
A specialized Persian-language web application for hospital clinical nutrition specialists, designed for assessing hospitalized patients, monitoring periodic visits, calculating enteral feeding (gavage) in the ICU, managing hospital protocols and formulas, and intelligently extracting lab results and clinical information.

Key Features
1. Instant Start Without Login or Account:

The app runs directly from the clinical assessment page and requires no Google account, email, or login.
2. Fully Local and Secure Storage on Device (Local Storage / IndexedDB):

All patient data, visits, and the library are stored on the user’s own device (mobile phone, tablet, or computer).
Data loads quickly and fully offline, and no patient data is ever sent to external servers.
3. Easy File Backup and Transfer:

Ability to download a backup file (nutrition-assessment-backup.json) directly to the device’s download folder.
Ability to quickly restore records from a backup file when switching phones or browsers.
4. Definitive and Standard Clinical Calculations:

Accurate calculation of BMI, weight classification, ideal body weight (IBW), and adjusted body weight (ABW).
Nutrition screening based on the NRS-2002 index.
Determination of calorie, protein, fluid, and electrolyte requirements based on ESPEN and ASPEN clinical guidelines.
A specialized ICU gavage module based on standard regimens and specific diseases.
5. Intelligent Extraction and Clinical Suggestion Assistant (Google Gemini):

Reading images of medical and laboratory test reports with AI and extracting abnormal values.
Extracting patient history and information from free text or speech.
Drafting nutrition care plans and food–drug interaction tips.
Local Setup and Running
Prerequisites
Node.js version 22 or higher
npm
Running Steps
Install dependencies:
bash
npm install
Configure environment variables:
bash
cp .dev.vars.example .dev.vars
Place your Gemini API key in the .dev.vars file:

env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
Start the development server:
bash
npm run dev
The app will be available at http://localhost:3000.

Build & Deploy
To build the final version:

bash
npm run build
Deploy on Cloudflare Workers:

bash
npx wrangler secret put GEMINI_API_KEY
npm run deploy
Privacy and Data Security
All patient records, visit figures, and library settings are stored only in the device’s browser local memory.
In the AI features (lab OCR and care plan drafts), images are temporary and are never saved on any server or database.
The AI API key is stored server-side and is never exposed in the browser code.





# دستیار تغذیه بالینی (Clinical Nutrition Assistant)

وب‌اپلیکیشن تخصصی و فارسی برای کارشناسان تغذیه بالینی بیمارستان جهت ارزیابی بالینی بیماران بستری، پایش ویزیت‌های دوره‌ای، محاسبه گاواژ انترال در ICU، مدیریت پروتکل‌ها و فرمولاهای بیمارستان و استخراج هوشمند آزمایش‌ها و اطلاعات بالینی.

---

## ویژگی‌های اصلی

1. **شروع فوری و بدون نیاز به ورود یا حساب کاربری:**
   - برنامه مستقیماً از صفحهٔ ارزیابی بالینی اجرا می‌شود و نیازی به حساب گوگل، ایمیل یا لاگین ندارد.

2. **ذخیره‌سازی کاملاً محلی و امن روی دستگاه (Local Storage / IndexedDB):**
   - تمامی اطلاعات بیماران، ویزیت‌ها و کتابخانه روی خود دستگاه کاربر (تلفن همراه، تبلت یا رایانه) ذخیره می‌شوند.
   - داده‌ها به صورت کاملاً آفلاین و سریع بارگذاری می‌شوند و هیچ دادهٔ بیماری به سرورهای خارجی فرستاده نمی‌شود.

3. **پشتیبان‌گیری و جابه‌جایی آسان فایل‌ها:**
   - امکان دانلود فایل پشتیبان (`nutrition-assessment-backup.json`) مستقیماً در پوشهٔ دانلودهای دستگاه.
   - امکان بازیابی سریع پرونده‌ها از روی فایل پشتیبان در صورت تعویض گوشی یا مرورگر.

4. **محاسبات بالینی قطعی و استاندارد:**
   - محاسبه دقیق BMI، طبقه‌بندی وزن، وزن ایده‌آل (IBW) و وزن تعدیل‌شده (ABW).
   - غربالگری تغذیه طبق شاخص NRS-2002.
   - تعیین نیازهای کالری، پروتئین، مایعات و الکترولیت‌ها بر اساس گایدلاین‌های بالینی ESPEN و ASPEN.
   - ماژول تخصصی گاواژ ICU بر حسب رژیم‌های استاندارد و بیماری‌های خاص.

5. **دستیار هوشمند استخراج و پیشنهاد بالینی (Google Gemini):**
   - خواندن تصاویر برگه‌های آزمایش پزشکی و آزمایشگاهی با هوش مصنوعی و استخراج مقادیر غیرطبیعی.
   - استخراج شرح حال و اطلاعات بیمار از متن آزاد یا گفتار.
   - تهیه پیش‌نویس طرح مراقبت تغذیه‌ای و نکات تداخل غذا-دارو.

---

## راه‌اندازی و اجرای محلی

### پیش‌نیازها
- Node.js نسخهٔ ۲۲ یا بالاتر
- npm

### گام‌های اجرا

۱. نصب وابستگی‌ها:
```bash
npm install
```

۲. تنظیم متغیرهای محیطی:
```bash
cp .dev.vars.example .dev.vars
```
در فایل `.dev.vars` کلید Gemini API را قرار دهید:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

۳. اجرای سرور توسعه:
```bash
npm run dev
```
برنامه روی آدرس `http://localhost:3000` در دسترس خواهد بود.

---

## ساخت و استقرار (Build & Deploy)

برای ساخت نسخهٔ نهایی:
```bash
npm run build
```

انتشار روی Cloudflare Workers:
```bash
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

---

## حریم خصوصی و امنیت داده‌ها

- کلیه پرونده‌های بیماران، ارقام ویزیت‌ها و تنظیمات کتابخانه فقط در حافظهٔ محلی مرورگر دستگاه نگهداری می‌شوند.
- در قابلیت‌های هوش مصنوعی (OCR آزمایش‌ها و پیش‌نویس طرح)، تصاویر موقت بوده و در هیچ سرور یا دیتابیسی ذخیره نمی‌شوند.
- کلید API هوش مصنوعی در سمت سرور نگهداری شده و هرگز در کد مرورگر افشا نمی‌شود.
