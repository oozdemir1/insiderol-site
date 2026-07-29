"use client";

import { useEffect, useState } from "react";
import Tabs from "@/components/ui/Tabs";
import MyReviewCard from "./cards/MyReviewCard";
import MySalaryCard from "./cards/MySalaryCard";
import MyBenefitsCard from "./cards/MyBenefitsCard";
import MyWorkStyleCard from "./cards/MyWorkStyleCard";
import MyCompensationCard from "./cards/MyCompensationCard";
import MyInterviewCard from "./cards/MyInterviewCard";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";

import {
  ShieldCheck,
  MessageSquareText,
  Wallet,
  Briefcase,
  Gift,
  TurkishLira,
  Users,
} from "lucide-react";

import EmptyStateCard from "@/components/ui/EmptyStateCard";

type MyPostsClientProps = {
  reviews: any[];
  salaries: any[];
  workStyles: any[];
  benefits: any[];
  compensations: any[];
  interviews: any[];
};


  const MY_POST_TABS = [
    "Yorum",
    "Maaş",
    "Çalışma Biçimi",
    "Yan Hak",
    "Ücret Politikası",
    "Mülakat Süreci",
  ];


export default function MyPostsClient({
  reviews,
  salaries,
  workStyles,
  benefits,
  compensations,
  interviews,
}: MyPostsClientProps) {

  const router = useRouter();
  const DEFAULT_TAB = "Yorum";
  const searchParams =
    useSearchParams();

  const pathname =
    usePathname();

  const [activeTab, setActiveTab] =
  useState(DEFAULT_TAB);

  const [visibleCount, setVisibleCount] =
  useState(10);

  useEffect(() => {
  setVisibleCount(5);
}, [activeTab]);
  

 useEffect(() => {

  const tab =
    searchParams.get("tab");

    if (tab) {

        setActiveTab(tab);

    } else {

        router.replace(
        `${pathname}?tab=Yorum`
        );
    }

    }, [
    searchParams,
    router,
    pathname,
    ]);

  return (
    <>

       <div className="w-full max-w-6xl mx-auto pb-16">

        {/* Minimal Nav */}
        <Tabs
          tabs={MY_POST_TABS}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);

            router.replace(
                `${pathname}?tab=${encodeURIComponent(tab)}`
            );
            }}
        />

        {/* Page Intro */}
        <div className=" -mb-4 mt-3">

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-3">

            <div
              className="
                flex items-center
                gap-1

                px-4 py-1

                text-2xl
                text-[var(--text-dark)]
              "
            >

              <ShieldCheck
                size={24}
                strokeWidth={2.75}
                className="
                  mr-1
                  text-[var(--lime)]
                "
              />

              <span className="hidden md:inline text-black/50">
                Anonim
              </span>

              <span className="font-medium text-[var(--text-dark)]">
                {activeTab}
              </span>

              <span className="text-black/50">
                Paylaşımlarım
              </span>

            </div>

          </div>

        </div>

        {/* Content Area */}
        <div className="mt-6">

          {activeTab === "Yorum" && (

            <div
              className="
                flex flex-col
                gap-4
              "
            >

              {reviews.length === 0 ? (

                    <EmptyStateCard
                      icon={MessageSquareText}
                      title="Henüz bir yorum paylaşmadınız!"
                      description="İlk yorumunuzu paylaşarak diğer aday ve çalışanlara yardımcı olun."
                      buttonText="Yorum Paylaş"
                      onClick={() => router.push("/share?tab=Yorum")}
                    />

                  ) : (

                    <>
                      {reviews
                        ?.slice(0, visibleCount)
                        .map((review) => (

                          <MyReviewCard
                            key={review.id}
                            review={review}
                          />

                        ))}
                    </>

                  )}
                {visibleCount < reviews.length && (

                <LoadMoreButton
                    onClick={() =>
                        setVisibleCount(
                        (prev) => prev + 5
                        )
                    }
                    />

                )}
            </div>

          )}

         {activeTab === "Maaş" && (

            <div
                className="
                flex flex-col
                gap-4
                "
            >

                {salaries.length === 0 ? (

                    <EmptyStateCard
                      icon={Wallet}
                      title="Henüz bir maaş paylaşmadınız!"
                      description="İlk maaş paylaşımınızı yaparak diğer aday ve çalışanlara yardımcı olun."
                      buttonText="Maaş Paylaş"
                      onClick={() => router.push("/share?tab=Maaş")}
                    />

                  ) : (

                    <>
                      {salaries
                        .slice(0, visibleCount)
                        .map((salary) => (

                          <MySalaryCard
                            key={salary.id}
                            salary={salary}
                          />

                        ))}
                    </>

                  )}

                {visibleCount < (salaries?.length || 0) && (

                <LoadMoreButton
                    onClick={() =>
                    setVisibleCount(
                        (prev) => prev + 5
                    )
                    }
                />

                )}

            </div>

            )}

            {activeTab === "Çalışma Biçimi" && (

              <div
                className="
                  flex flex-col
                  gap-4
                "
              >

                 {workStyles.length === 0 ? (

                    <EmptyStateCard
                      icon={Briefcase}
                      title="Henüz bir çalışma biçimi paylaşmadınız!"
                      description="İlk çalışma biçimi paylaşımınızı yaparak diğer aday ve çalışanlara yardımcı olun."
                      buttonText="Çalışma Biçimi Paylaş"
                      onClick={() =>
                        router.push("/share?tab=Çalışma Biçimi")
                      }
                    />

                  ) : (

                    <>
                      {workStyles
                        .slice(0, visibleCount)
                        .map((workStyle) => (

                          <MyWorkStyleCard
                            key={workStyle.id}
                            workStyle={workStyle}
                          />

                        ))}
                    </>

                  )}

                {visibleCount < (workStyles?.length || 0) && (

                  <LoadMoreButton
                    onClick={() =>
                      setVisibleCount(
                        (prev) => prev + 5
                      )
                    }
                  />

                )}

              </div>

            )}

            {activeTab === "Yan Hak" && (

          <div
            className="
              flex flex-col
              gap-4
            "
          >

           {benefits.length === 0 ? (

              <EmptyStateCard
                icon={Gift}
                title="Henüz bir yan hak paylaşmadınız!"
                description="İlk yan hak paylaşımınızı yaparak diğer aday ve çalışanlara yardımcı olun."
                buttonText="Yan Hak Paylaş"
                onClick={() => router.push("/share?tab=Yan Hak")}
              />

            ) : (

              <>
                {benefits
                  .slice(0, visibleCount)
                  .map((benefit) => (

                    <MyBenefitsCard
                      key={benefit.id}
                      benefit={benefit}
                    />

                  ))}
              </>

            )}

            {visibleCount < (benefits?.length || 0) && (

              <LoadMoreButton
                onClick={() =>
                  setVisibleCount(
                    (prev) => prev + 5
                  )
                }
              />

            )}

          </div>

        )}

        {activeTab === "Ücret Politikası" && (

            <div
              className="
                flex flex-col
                gap-4
              "
            >

             {compensations.length === 0 ? (

                  <EmptyStateCard
                    icon={TurkishLira}
                    title="Henüz ücret politikası paylaşmadınız!"
                    description="İlk ücret politikası paylaşımınızı yaparak diğer aday ve çalışanlara yardımcı olun."
                    buttonText="Ücret Politikası Paylaş"
                    onClick={() =>
                      router.push("/share?tab=Ücret Politikası")
                    }
                  />

                ) : (

                  <>
                    {compensations
                      .slice(0, visibleCount)
                      .map((compensation) => (

                        <MyCompensationCard
                          key={compensation.id}
                          compensation={compensation}
                        />

                      ))}
                  </>

                )}
              {visibleCount < (compensations?.length || 0) && (

                <LoadMoreButton
                  onClick={() =>
                    setVisibleCount(
                      (prev) => prev + 5
                    )
                  }
                />

              )}

            </div>

          )}

          {activeTab === "Mülakat Süreci" && (

            <div
              className="
                flex flex-col
                gap-4
              "
            >
              {interviews.length === 0 ? (

                <EmptyStateCard
                  icon={Users}
                  title="Henüz bir mülakat deneyimi paylaşmadınız!"
                  description="İlk mülakat deneyiminizi paylaşarak diğer adaylara yardımcı olun."
                  buttonText="Mülakat Deneyimi Paylaş"
                  onClick={() =>
                    router.push("/share?tab=Mülakat Süreci")
                  }
                />

              ) : (

                <>
                  {interviews
                    .slice(0, visibleCount)
                    .map((interview) => (

                      <MyInterviewCard
                        key={interview.id}
                        interview={interview}
                      />

                    ))}
                </>

              )}
              {visibleCount < (interviews?.length || 0) && (

                <LoadMoreButton
                  onClick={() =>
                    setVisibleCount(
                      (prev) => prev + 5
                    )
                  }
                />

              )}

            </div>

          )}

        </div>

      </div>

    </>
  );
}