"use client";

import { useState, useEffect } from "react";
import CompanyTabsNav from "./CompanyTabsNav";
import CompanyTabs from "./CompanyTabs";
import CompanyOverviewBars from "./CompanyOverviewBars";

export default function CompanyPageClient({
  company,
  reviews,
  salaries,
  companyId,
  companyName,
  hqCity,
  children,
  initialTab,
  subRatingAverages,
  salaryRange,
  reviewCount,
}: {
  company: any;
  reviews: any[];
  salaries: any[];
  companyId: number;
  companyName: string;
  hqCity: number;
  children: React.ReactNode;
  initialTab?: string;
  subRatingAverages: {
    work_life_balance: number;
    management: number;
    career_growth: number;
    work_environment: number;
    transparency: number;
    employee_value: number;
  };
  salaryRange: { min: number; max: number } | null;
  reviewCount: number;
})

{
  const [activeTab, setActiveTab] =
    useState(initialTab || "yorum");

  // Keep the URL's ?tab= in sync with the active tab so a refresh or a
  // copied/shared link lands back on the same tab — plain history.replaceState
  // (not the Next router) so switching tabs never triggers a server refetch.
  useEffect(() => {
    if (activeTab === "Yorum Ekle") return;

    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  const tabList = [
    "yorum",
    "maaş",
    "çalışma biçimi",
    "yan hak",
    "ücret politikası",
    "mülakat süreci",
    "+ Yorum Ekle",
  ];

 return (
  <div>

    <CompanyTabsNav
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      tabList={tabList}
    />

    {children}

    <CompanyOverviewBars
      subRatingAverages={subRatingAverages}
      salaryRange={salaryRange}
      reviewCount={reviewCount}
    />

    <CompanyTabs
      companyId={companyId}
      companyName={companyName}
      hqCity={hqCity}
      reviews={reviews}
      salaries={salaries}
      showNav={false}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  </div>
);
}