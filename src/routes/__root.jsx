import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b5960" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "Clinical Nutrition Assistant | دستیار تغذیه بالینی" },
      { name: "description", content: "دستیار تغذیه بالینی - وب‌اپ تخصصی کارشناس تغذیه بیمارستان جهت ارزیابی بالینی، محاسبه گاواژ، پرونده بیماران و تنظیم برنامه‌های تغذیه‌ای." },
      { property: "og:title", content: "Clinical Nutrition Assistant | دستیار تغذیه بالینی" },
      { property: "og:description", content: "دستیار تغذیه بالینی - وب‌اپ تخصصی کارشناس تغذیه بیمارستان جهت ارزیابی بالینی، محاسبه گاواژ، پرونده بیماران و تنظیم برنامه‌های تغذیه‌ای." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

function RootDocument({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
