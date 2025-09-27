import { duration } from "@/utilities/PlansService";

export const DurationView = ({
    selectedDuration,
    handleDurationChange
}) => {
    return (

        <div className='flex flex-col items-center plan-duration-container'>
            {/* Discount labels row */}
            <div className='flex flex-row items-center mb-0' style={{ gap: '8px' }}>
                {
                    duration.map((item) => (
                        <div key={`discount-${item.id}`} className='flex items-center justify-center' style={{ minWidth: '70px' }}>
                            {item.save ? (
                                <div className={`bg-white/40 shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)] backdrop-blur-[10px] rounded-tl-xl rounded-tr-xl px-2 py-0.5`}>
                                    <div
                                        className={`text-[11px] font-medium whitespace-nowrap ${selectedDuration?.id === item.id ? "text-purple" : "text-neutral-400"}`}
                                    >
                                        Save {item.save}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: '24px' }}></div>
                            )}
                        </div>
                    ))
                }
            </div>

            {/* Duration buttons row */}
            <div className='flex flex-row items-center border bg-neutral-100 px-1 pb-0.5 rounded-full' style={{ gap: '8px' }}>
                {
                    duration.map((item) => (
                        <div key={`button-${item.id}`} className='flex items-center justify-center' style={{ minWidth: '70px' }}>
                            <button
                                className={`px-1 py-[3px] w-full ${selectedDuration?.id === item.id ? "text-white text-[13px] font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
                                onClick={() => {
                                    handleDurationChange(item);
                                    // getCurrentPlans();
                                }}
                            >
                                {item.title}
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}