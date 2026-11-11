# دستیار تغذیه بالینی

وب‌اپ فارسی برای ارزیابی تغذیهٔ بیماران بستری، ثبت ویزیت‌های پی‌درپی، یادآوری موعد پیگیری، کتابخانهٔ پروتکل و فرمولا، و محاسبهٔ تغذیهٔ گاواژی. برنامه برای یک کارشناس تغذیه است و به Base44 وابسته نیست.

## چه چیزی کجا می‌ماند

- ورود فقط با حساب گوگل انجام می‌شود و توکن در حافظهٔ مرورگر می‌ماند.
- بیماران، ویزیت‌ها و کتابخانه در یک فایل خصوصی `nutrition-assessment.json` داخل Google Drive همان حساب ذخیره می‌شوند.
- متن بیمار یا عکس برگهٔ آزمایش فقط برای استخراج به Google Gemini API فرستاده می‌شود. عکس در برنامه ذخیره نمی‌شود؛ متن استخراج‌شده را پیش از ثبت اصلاح کنید.
- کلید Gemini فقط در Secret سرور است.
- BMI، NRS-2002، انرژی، پروتئین، مایع و گاواژ در `src/lib/clinical.js` محاسبه می‌شوند. متن هوش مصنوعی پیش‌نویس است.
- اگر تنظیمات Gemini نباشد، محاسبات قطعی همچنان نمایش داده می‌شوند و دلیل نبودن پیش‌نویس روی نتیجه دیده می‌شود.

## توسعهٔ محلی

به Node.js نیاز است.

```powershell
npm install
Copy-Item .env.example .env
Copy-Item .dev.vars.example .dev.vars
npm run dev
```

در `.env` مقدار `VITE_GOOGLE_CLIENT_ID` و `VITE_OWNER_EMAIL` را بگذارید. در `.dev.vars` مقدار `GEMINI_API_KEY`، نام مدل در `GEMINI_MODEL` و `OWNER_GOOGLE_EMAIL` را وارد کنید. ایمیل هر دو فایل باید یکی باشد. این فایل‌ها در Git نمی‌آیند.

## Google Cloud

1. در Google Cloud Console یک پروژه بسازید و Drive API را فعال کنید.
2. OAuth consent screen را روی Testing بگذارید و ایمیل خودتان را Test user کنید.
3. یک OAuth Client از نوع Web application بسازید.
4. در بخش Authorized JavaScript origins، origin دقیق صفحه‌ای را که برنامه را از آن باز می‌کنید اضافه کنید: `http://localhost:5173` و بعد از انتشار، آدرس `https://....workers.dev`. اگر در شبکهٔ محلی با IP باز می‌کنید، `http://<LAN-IP>:5173` را هم اضافه کنید. origin باید scheme، میزبان و port مطابق آدرس مرورگر باشد و مسیر صفحه را شامل نمی‌شود.
5. Client ID را در `.env` و هنگام ساخت نسخهٔ نهایی در محیط build قرار دهید.

برنامه فقط scope `drive.file` می‌خواهد و فقط فایلی را می‌بیند که خودش ساخته است.

## راه‌اندازی Google Gemini API

1. در [Google AI Studio](https://aistudio.google.com/) یک Gemini API key بسازید. کلید API را در سرور نگه دارید؛ آن را به مرورگر یا متغیرهای `VITE_*` اضافه نکنید.
2. برای `GEMINI_MODEL` مقدار `gemini-3.8-flash` را بگذارید؛ این مدل پایدار از متن و تصویر ورودی و خروجی ساختاریافته پشتیبانی می‌کند و طبق صفحهٔ قیمت‌گذاری Google در Free Tier قابل استفاده است. محدودیت واقعی به tier و سهمیهٔ همان پروژه بستگی دارد. در این برنامه یک مدل برای استخراج متن، خواندن تصویر آزمایش و تهیهٔ پیش‌نویس استفاده می‌شود.
3. کلید و نام مدل را در `.dev.vars` محلی قرار دهید:

```dotenv
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.8-flash
OWNER_GOOGLE_EMAIL=your-google-account@example.com
```

برای این اتصال به endpoint یا deployment در Azure نیاز نیست. جزئیات سهمیه، هزینه و سیاست نگهداری/استفاده از داده را در حساب و شرایط Google بررسی کنید.

## انتشار روی Cloudflare Workers

```powershell
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GEMINI_MODEL
npx wrangler secret put OWNER_GOOGLE_EMAIL
$env:VITE_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
$env:VITE_OWNER_EMAIL="your-google-account@example.com"
npm run deploy
```

بعد از گرفتن آدرس سایت، همان origin را در Google OAuth اضافه کنید و یک‌بار دیگر `npm run deploy` را با همان متغیرهای `VITE_` اجرا کنید. پلن رایگان Workers برای استفادهٔ یک نفر کافی است.

## حریم داده

فایل Drive شامل نام، شماره پرونده و سابقهٔ ویزیت است. متن ورودی یا تصویر آزمایش برای استخراج و داده‌های ارزیابی برای تهیهٔ پیش‌نویس به Google Gemini API ارسال می‌شود؛ عکس در برنامه یا Drive ذخیره نمی‌شود. پیش از استفاده با اطلاعات واقعی بیمار، سیاست داده و شرایط سرویس Google را بررسی کنید و فقط در صورت مجاز بودن پردازش این داده‌ها ادامه دهید.
