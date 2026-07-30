"use client";

type TabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: TabsProps) {

  return (
    <div
      className="
              sticky
              top-20
              z-40
              bg-[var(--background)]
              pt-4
              
      "
        style={{
        paddingBottom: "1.2rem",
      }}
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-evenly
          gap-y-4
          
        "
      >
        {tabs.map((tab) => {

          const isActive =
            activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() =>
                onTabChange(tab)
              }
              className={`
                share-tab-minimal
                lowercase

                ${
                  isActive
                    ? "share-tab-minimal-active"
                    : ""
                }
              `}
            >
              {tab}
            </button>
          );
        })}
      </div>
          <div
              className="
                absolute
                left-1/2
                -translate-x-1/2
                w-screen
                bottom-0
                h-4
                border-b
                bg-[var(--background)]
                shadow-sm
                border-black/10
                pointer-events-none
              "
              // The parent (Tabs' sticky wrapper) sits inside a max-w-6xl
              // mx-auto container on every page that renders this — left-0/
              // right-0 would only span that narrower box. Breaking out to
              // full viewport width here relies on that container being
              // horizontally centered (mx-auto), same trick as any
              // full-bleed-from-a-centered-container pattern.
            />
            
    </div>
  );
}