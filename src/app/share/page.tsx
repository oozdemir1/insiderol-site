"use client";

import { Suspense, useState } from "react";
import Tabs from "@/components/ui/Tabs";
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";

import SalaryForm from "@/components/forms/SalaryForm";
import ReviewFormSteps from "@/components/forms/ReviewFormSteps";
import WorkStyleForm from "@/components/forms/WorkStyleForm";
import BenefitsForm from "@/components/forms/BenefitsForm";
import CompensationForm from "@/components/forms/CompensationForm";
import InterviewForm from "@/components/forms/InterviewForm";
import {
  ShieldCheck,
} from "lucide-react";

export default function SharePage() {
  return (
    <Suspense fallback={null}>
      <ShareTabs />
    </Suspense>
  );
}

function ShareTabs({
  companyId,
  companyName,
  hqCity,
}: {
  companyId?: number;
  companyName?: string;
  hqCity?: number;
} = {}) {

  const router = useRouter();
  const searchParams =
  useSearchParams();
  const pathname = usePathname();

  const [activeTab, setActiveTab] =
  useState(
    searchParams.get("tab") ||
    "Yorum"
  );

  const tabs = [
    "Yorum",
    "Maaş",
    "Çalışma Biçimi",
    "Yan Hak",
    "Ücret Politikası",
    "Mülakat Süreci",
  ];

  return (
     <>
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Minimal Nav */}

  <Tabs
    tabs={tabs}
    activeTab={activeTab}
    onTabChange={(tab) => {

      setActiveTab(tab);

      router.replace(
        `${pathname}?tab=${encodeURIComponent(tab)}`
      );
    }}
  />

      {/* Page Intro */}
      <div>
 
          {/* Trust Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-3">

        <div
          className="
            flex items-center         
            gap-1 
            px-4 py-1
            text-2xl text-[var(--text-dark)]
           mt-3
          "
        >
          <ShieldCheck
            size={24}
              strokeWidth={2.75}
            className="mr-1 text-[var(--lime)]"
          />

          
          <span className="text-black/50">Anonim</span>
          <span className="font-medium text-[var(--text-dark)]">
            {activeTab}
          </span>
       <span className="text-black/50">Paylaş</span>
          
        </div>
      </div>

       
      </div>

      {/* Content Area */}
      <div className="mt-3 pb-16">
        {/* Yorumlar */}
        {activeTab === "Yorum" && (
          <div
            className="
              flex flex-col gap-4
            "
          >
            <ReviewFormSteps showHeader={false} />
          </div>
        )}

        {/* Maaş */}
        {activeTab === "Maaş" && (
          <div>
            <SalaryForm
              companyId={companyId}
              companyName={companyName}
              hqCity={hqCity}
              showHeader={false}
            />
          </div>
        )}

        {/* Çalışma Biçimi */}
        {activeTab ===
          "Çalışma Biçimi" && (
          <div>
            <WorkStyleForm 
              companyId={companyId} 
              showHeader={false}
            />
          </div>
        )}

        {/* Yan Hak */}
        {activeTab === "Yan Hak" && (
          <div>
            <BenefitsForm 
              companyId={companyId}
              showHeader={false}
            />
          </div>
        )}

        {/* Ücret Politikası */}
        {activeTab ===
          "Ücret Politikası" && (
          <div>
            <CompensationForm 
              companyId={companyId} 
              showHeader={false}
            />
          </div>
        )}

        {/* Mülakat */}
        {activeTab === "Mülakat Süreci" && (
          <div>
            <InterviewForm 
              companyId={companyId} 
              showHeader={false}
            />
          </div>
        )}
      </div>
    </div>
    </>
  );


}
  