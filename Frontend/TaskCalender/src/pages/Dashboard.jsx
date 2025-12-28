import TopLeft from "../components/TopLeft";
import TopCenter from "../components/TopCenter";
import TopRight from "../components/TopRight";
import BottomLeft from "../components/BottomLeft";
import BottomCenter from "../components/BottomCenter";
import BottomRight from "../components/BottomRight";

export default function Dashboard() {
  return (
    <div
      className="
        min-h-screen w-full bg-background p-3 
        flex flex-col gap-3
        overflow-y-auto
        md:overflow-hidden
      "
    >
      {/* 🔹 Top Row */}
      <div className="flex flex-col md:flex-row gap-3 md:h-[30%]">
        
        {/* TopLeft */}
        <div className="md:w-[20%] w-full min-h-[200px] md:h-full
                        order-2 md:order-1">
          <TopLeft />
        </div>

        {/* TopCenter — FIRST on mobile */}
        <div className="md:w-[60%] w-full min-h-[200px] md:h-full
                        order-1 md:order-2">
          <TopCenter />
        </div>

        {/* TopRight */}
        <div className="md:w-[20%] w-full min-h-[200px] md:h-full
                        order-3 md:order-3">
          <TopRight />
        </div>
      </div>

      {/* 🔹 Bottom Row */}
      <div className="flex flex-col md:flex-row gap-3 md:h-[70%]">
        <div className="md:w-[20%] w-full min-h-[250px] md:h-full">
          <BottomLeft />
        </div>

        <div className="md:w-[60%] w-full min-h-[300px] md:h-full">
          <BottomCenter />
        </div>

        <div className="md:w-[20%] w-full min-h-[250px] md:h-full">
          <BottomRight />
        </div>
      </div>
    </div>
  );
}

