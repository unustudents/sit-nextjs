import Link from "next/link";
import { BarChart3, QrCode, Settings } from "lucide-react";

type PageSubNavProps = {
  pageId: string;
  activeTab: "edit" | "analytics" | "qr";
};

export function PageSubNav({ pageId, activeTab }: PageSubNavProps) {
  const tabs = [
    {
      id: "edit",
      label: "Pengaturan & Konten",
      href: `/dashboard/pages/${pageId}/edit`,
      icon: Settings,
    },
    {
      id: "analytics",
      label: "Analytics & Statistik",
      href: `/dashboard/pages/${pageId}/analytics`,
      icon: BarChart3,
    },
    {
      id: "qr",
      label: "QR Code",
      href: `/dashboard/pages/${pageId}/qr`,
      icon: QrCode,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Halaman"
      className="mb-6 flex overflow-x-auto border-b border-slate-200 dark:border-slate-800"
    >
      <div className="flex gap-2 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
