export default function CompanyTabsNav({
  activeTab,
  setActiveTab,
  tabList,
}: any) {
  return (
   
        <div
            className="
              sticky
              top-20
              z-40
              bg-[var(--background)]
              pt-4
              pb-2
              mb-7
             "
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
                
              {tabList.slice(0, -1).map((tab: string) => (
                <button
                  key={tab}
                    className={
                      `company-tab ${
                        activeTab === tab ||
                        (activeTab === "Yorum Ekle" && tab === "yorum")
                          ? "company-tab-active"
                          : ""
                      }`
                    }
                  onClick={() => {
                    setActiveTab(tab);
                    }}
                >
                  {tab}
                </button>
              ))}
            </div>
       <div className="relative">
          <div className="
                        absolute left-1/2
                        -translate-x-1/2
                        w-screen 
                        bg-[var(--background)]
                        border-b
                        backdrop-blur-2xl
                        border-black/10
                        shadow-sm
                        py-2
                       " />
        </div>
          </div>

  );
}