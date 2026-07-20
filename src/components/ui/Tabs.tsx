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
        paddingBottom: "1rem",
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
                fixed
                left-0
                right-0
                h-4
                border-b
                bg-[var(--background)]
                shadow-sm
                border-black/10
                pointer-events-none
              "
              style={{
                marginTop: "1.75px",
              }}
            />
            
    </div>
  );
}