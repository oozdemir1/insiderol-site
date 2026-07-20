"use client";

import { useState } from "react";
import CompanyTabsNav from "./CompanyTabsNav";
import CompanyTabs from "./CompanyTabs";

export default function CompanyPageClient({
  company,
  reviews,
  companyId,
  companyName,
  hqCity,
  children,
  initialTab,
}: {
  company: any;
  reviews: any[];
  companyId: number;
  companyName: string;
  hqCity: number;
  children: React.ReactNode;
  initialTab?: string;
})

{
  const [activeTab, setActiveTab] =
    useState(initialTab || "yorum");

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

    <CompanyTabs
      companyId={companyId}
      companyName={companyName}
      hqCity={hqCity}
      reviews={reviews}
      showNav={false}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  </div>
);
}