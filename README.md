# Clinical Nutrition Assistant

A Persian, right-to-left web application for hospital clinical nutrition specialists. It supports inpatient nutrition assessment and follow-up, ICU enteral-feeding calculations, hospital protocol and formula management, and AI-assisted extraction of clinical information.

## Key Features

- **No account required:** Open the app and start using the clinical assessment workflow without signing in.
- **On-device records:** Patient records, visits, and library data are stored in the browser on the current device using IndexedDB with a localStorage fallback.
- **Backup and restore:** Export and restore application data with a JSON backup file (`nutrition-assessment-backup.json`). Keep backups in a secure location because they may contain patient information.
- **Clinical calculation tools:** Includes BMI, ideal and adjusted body weight, NRS-2002 screening, nutrition targets, and an ICU enteral-feeding module. Review calculations and clinical decisions against current patient information and applicable guidance.
- **AI-assisted workflows:** Google Gemini can help extract information from text and lab images and draft nutrition-care suggestions. AI output is a draft for review by a qualified clinician.

## Local Setup

### Requirements

- Node.js 22 or later
- npm

### Run the app

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the local environment template:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

3. Add your Gemini API key to `.dev.vars`:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```

   Keep `.dev.vars` private; do not commit API keys.

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs at <http://localhost:3000>.

## Build and Deploy

Build the application:

```bash
npm run build
```

To deploy to Cloudflare Workers, configure the Gemini key as a Worker secret and deploy:

```bash
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

## Data and Privacy

Patient records, visits, and library settings are stored in the browser on the user's device. They are not automatically synchronized to a cloud database. Data stays in that browser profile, so use the backup and restore feature when moving to another device or browser.

AI features send the information needed for the requested task to the server-side Gemini integration, including submitted text, selected assessment details, or lab images as applicable. Do not submit information unless you are authorized to do so and the use complies with your organization's privacy requirements. Lab images are processed for the request and are not saved in the application's patient database. The Gemini API key is kept on the server and must not be exposed in browser code.

## Clinical Use

This application is a decision-support tool. It does not replace professional assessment, clinical judgment, or local protocols. Verify AI-generated content and calculations before using them in patient care.

---

# دستیار تغذیه بالینی

وب‌اپلیکیشنی فارسی و راست‌چین برای کارشناسان تغذیهٔ بالینی بیمارستان است. این برنامه از ارزیابی و پیگیری تغذیه‌ای بیماران بستری، محاسبات تغذیهٔ انترال در ICU، مدیریت پروتکل‌ها و فرمول‌ها و استخراج هوشمند اطلاعات بالینی پشتیبانی می‌کند.

## ویژگی‌های اصلی

- **بدون نیاز به حساب کاربری:** برنامه را باز کنید و مستقیماً از فرایند ارزیابی بالینی استفاده کنید.
- **ذخیرهٔ اطلاعات روی دستگاه:** پرونده‌های بیماران، ویزیت‌ها و اطلاعات کتابخانه در مرورگر همان دستگاه و با استفاده از IndexedDB و روش جایگزین localStorage ذخیره می‌شوند.
- **پشتیبان‌گیری و بازیابی:** اطلاعات برنامه را با فایل پشتیبان JSON (`nutrition-assessment-backup.json`) دریافت یا بازیابی کنید. چون فایل پشتیبان ممکن است حاوی اطلاعات بیمار باشد، آن را در محل امن نگهداری کنید.
- **ابزارهای محاسبات بالینی:** شامل BMI، وزن ایده‌آل و تعدیل‌شده، غربالگری NRS-2002، نیازهای تغذیه‌ای و ماژول تغذیهٔ انترال در ICU. محاسبات و تصمیم‌های بالینی را با اطلاعات به‌روز بیمار و راهنماهای معتبر تطبیق دهید.
- **قابلیت‌های مبتنی بر هوش مصنوعی:** Google Gemini می‌تواند در استخراج اطلاعات از متن و تصویر آزمایش‌ها و تهیهٔ پیش‌نویس پیشنهادهای مراقبت تغذیه‌ای کمک کند. خروجی هوش مصنوعی پیش‌نویس است و باید توسط کارشناس واجد صلاحیت بازبینی شود.

## راه‌اندازی محلی

### پیش‌نیازها

- Node.js نسخهٔ ۲۲ یا بالاتر
- npm

### اجرای برنامه

۱. وابستگی‌ها را نصب کنید:

   ```bash
   npm install
   ```

۲. فایل نمونهٔ متغیرهای محیطی را کپی کنید:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

۳. کلید Gemini را در فایل `.dev.vars` قرار دهید:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```

   فایل `.dev.vars` را محرمانه نگه دارید و کلید API را در مخزن ثبت نکنید.

۴. سرور توسعه را اجرا کنید:

   ```bash
   npm run dev
   ```

   برنامه در نشانی <http://localhost:3000> در دسترس خواهد بود.

## ساخت و استقرار

برای ساخت برنامه:

```bash
npm run build
```

برای استقرار روی Cloudflare Workers، کلید Gemini را به‌عنوان Worker Secret تنظیم و برنامه را منتشر کنید:

```bash
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

## داده‌ها و حریم خصوصی

پرونده‌های بیماران، ویزیت‌ها و تنظیمات کتابخانه در مرورگر دستگاه کاربر ذخیره می‌شوند و به‌طور خودکار با پایگاه دادهٔ ابری همگام‌سازی نمی‌شوند. این اطلاعات به همان نمایهٔ مرورگر وابسته‌اند؛ برای انتقال به دستگاه یا مرورگر دیگر از قابلیت پشتیبان‌گیری و بازیابی استفاده کنید.

قابلیت‌های هوش مصنوعی، اطلاعات لازم برای انجام درخواست را به اتصال سروری Gemini ارسال می‌کنند؛ این اطلاعات بسته به قابلیت مورد استفاده می‌تواند شامل متن واردشده، جزئیات ارزیابی انتخاب‌شده یا تصویر آزمایش باشد. اطلاعاتی را ارسال کنید که مجاز به استفاده از آن هستید و با الزامات حریم خصوصی محل کارتان سازگار است. تصویر آزمایش برای پردازش همان درخواست استفاده می‌شود و در پایگاه دادهٔ بیماران برنامه ذخیره نمی‌شود. کلید Gemini در سمت سرور نگهداری می‌شود و نباید در کد مرورگر افشا شود.

## استفادهٔ بالینی

این برنامه ابزار پشتیبان تصمیم‌گیری است و جایگزین ارزیابی تخصصی، قضاوت بالینی یا پروتکل‌های محلی نیست. محاسبات و محتوای تولیدشده با هوش مصنوعی را پیش از استفاده در مراقبت از بیمار بررسی کنید.
