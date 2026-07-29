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
                left-0
                right-0
                bottom-0
                h-4
                border-b
                bg-[var(--background)]
                shadow-sm
                border-black/10
                pointer-events-none
              "
            />
            
    </div>
  );
}