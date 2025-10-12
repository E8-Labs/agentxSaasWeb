import { duration } from "@/utilities/PlansService";

export const DurationView = ({
    selectedDuration,
    handleDurationChange,
    from
}) => {
    return (

        <div className='flex flex-col items-end plan-duration-container justify-end'>
            {/* Discount labels row */}
            {
                from !== "SubAccount" && (
                    <div className='flex flex-row items-center justify-end gap-2 px-2 mt-2 me-[7px]'>
                        {
                            duration.map((item) => (
                                item.save && (
                                    <div
                                        key={`discount-${item.id}`}
                                        // className={`bg-white/40 shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)] backdrop-blur-[10px] rounded-tl-xl rounded-tr-xl px-2 py-0.5`}
                                        className={`px-2 py-1 ${selectedDuration?.id === item.id ? "text-white bg-purple shadow-sm shadow-purple" : "text-black"} rounded-tl-lg rounded-tr-lg`}
                                        style={{ fontWeight: "600", fontSize: "13px" }}
                                    >
                                        Save {item.save}
                                    </div>
                                )
                            ))
                        }
                    </div>
                )
            }

            {/* Duration buttons row */}
            <div className='border bg-neutral-100 px-2 flex flex-row items-center gap-[8px] rounded-full py-1.5'
            >
                {
                    duration.map((item) => (

                        <button
                            key={item.id}
                            // className={`px-1 py-[3px] w-full ${selectedDuration?.id === item.id ? "text-white text-[13px] font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
                            className={`px-4 py-1 ${selectedDuration?.id === item.id ? "text-white bg-purple shadow-md shadow-purple rounded-full" : "text-black"}`}
                            onClick={() => {
                                handleDurationChange(item);
                                // getCurrentPlans();
                            }}
                        >
                            {item.title}
                        </button>

                    ))
                }
            </div>
        </div>
    )
}