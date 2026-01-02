import React from 'react'
import { CircularProgress } from '@mui/material'
import Image from 'next/image'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDecimalValue } from '@/components/agency/agencyServices/CheckAgencyData'
import FeatureLine from '@/components/userPlans/FeatureLine'
import { renderBrandedIcon } from '@/utilities/iconMasking'
import SignupHeaderMobile from './SignupHeaderMobile'
import { useSelector } from 'react-redux'

function PlansListMobile({
    loading,
    currentPlans,
    selectedPlan,
    selectedDuration,
    duration,
    durationSaving,
    showPlanDetails,
    subPlanLoader,
    onPlanSelect,
    onDurationChange,
    onShowPlanDetails,
    onGetStarted,
    getMonthlyPrice,
    getCurrentPlans,
}) {
    const reduxUser = useSelector((state) => state.user.user)
    return (



        <div className="flex flex-col items-center h-full w-full min-h-screen">
            <SignupHeaderMobile title={reduxUser?.userRole == 'Agency' ? "Get an AI AaaS Agency" : "Grow Your Business"} description={reduxUser?.userRole == 'Agency' ? "Gets more done than coffee. Cheaper too.😉" : "Gets more done than coffee. Cheaper too. Cancel anytime.😉"} />

            <div
                style={{
                    position: 'absolute',
                    top: '20vh',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                className="px-6 h-[75vh] overflow-y-auto w-[90%] bg-white rounded-xl p-2 mt-2  shadow-2xl"
            >
                <div className="flex flex-col items-end w-full mt-2 mb-2">
                    {
                        reduxUser?.userRole !== 'AgencySubAccount' && (

                            <div className="flex mt-3 flex-row items-center justify-end gap-5 px-2 me-[15px] md:me-[7px] w-full">
                                {durationSaving.map((item) => {
                                    return (
                                        <button
                                            key={item.id}
                                            className={`px-2 py-1 rounded-tl-lg rounded-tr-lg font-semibold text-[13px] ${selectedDuration.id === item.id
                                                ? 'text-white bg-brand-primary outline-none border-none'
                                                : 'text-muted-foreground'
                                                }`}
                                            onClick={() => {
                                                onDurationChange(item)
                                                getCurrentPlans()
                                            }}
                                        >
                                            {item.title}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    <div className="w-auto flex md:w-auto flex-col items-center md:items-end justify-center md:justify-end">
                        <div className="border flex flex-row items-center bg-neutral-100 px-5 gap-[8px] rounded-full py-1.5 w-[90%] md:w-auto justify-center md:justify-start">
                            {duration?.map((item) => (
                                <button
                                    key={item.id}
                                    className={`px-4 py-1 rounded-full ${selectedDuration.id === item.id
                                        ? 'text-white bg-brand-primary outline-none border-none shadow-md shadow-brand-primary/50'
                                        : 'text-foreground'
                                        }`}
                                    onClick={() => {
                                        onDurationChange(item)
                                        getCurrentPlans()
                                    }}
                                >
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Plan Selection */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <CircularProgress size={35} />
                    </div>
                ) : currentPlans.length > 0 ? (
                    <div className="space-y-3">
                        {currentPlans.map((plan, index) => (
                            <div
                                key={plan.id}
                                onClick={() => onPlanSelect(plan)}
                                className={`p-2 pb-4 rounded-xl border-2 transition-all cursor-pointer ${selectedPlan?.id === plan.id
                                    ? 'border-none bg-gradient-to-b from-brand-primary to-brand-primary/40 rounded-lg'
                                    : 'border-gray-200 hover:border-brand-primary/30'
                                    } h-auto`}
                            >
                                <div className="flex items-center flex-col">
                                    {plan.tag && (
                                        <div className="flex flex-row items-center gap-2 pb-1">
                                            {selectedPlan?.id === plan.id ? (
                                                <Image
                                                    src="/svgIcons/powerWhite.svg"
                                                    height={24}
                                                    width={24}
                                                    alt="*"
                                                />
                                            ) : (
                                                renderBrandedIcon('/svgIcons/power.svg', 24, 24)
                                            )}
                                            <div
                                                className={`text-base font-bold ${selectedPlan?.id === plan.id
                                                    ? 'text-white'
                                                    : 'text-brand-primary'
                                                    }`}
                                            >
                                                {plan.tag}
                                            </div>
                                            {selectedPlan?.id === plan.id ? (
                                                <Image
                                                    src="/svgIcons/enterArrowWhite.svg"
                                                    height={20}
                                                    width={20}
                                                    alt="*"
                                                />
                                            ) : (
                                                renderBrandedIcon('/svgIcons/enterArrow.svg', 20, 20)
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col items-center w-full bg-white rounded-lg">
                                        <div className="flex items-center flex-col gap-2 w-full">
                                            <h3 className="font-bold text-2xl text-black capitalize mt-2">
                                                {plan.title || plan.name}
                                            </h3>

                                            <div className="flex items-baseline gap-2 mt-4">
                                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-primary">
                                                    ${formatDecimalValue(getMonthlyPrice(plan))}
                                                </span>
                                            </div>

                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-sm text-gray-500 capitalize">
                                                    {plan.planDescription || plan.details}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Continue Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onGetStarted(plan)
                                            }}
                                            disabled={subPlanLoader}
                                            className={`w-[90%] py-3 mt-4 rounded-xl font-regular text-white text-base transition-all bg-brand-primary hover:opacity-90 shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {subPlanLoader && selectedPlan?.id === plan.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <CircularProgress size={20} color="inherit" />
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                plan?.hasTrial == true ? (
                                                    <span className="text-base font-normal">

                                                        {plan?.trialValidForDays} Day Free Trial
                                                    </span>
                                                ) : (
                                                    <span className="text-base font-normal">
                                                        Get Started
                                                    </span>
                                                )
                                            )}
                                        </button>

                                        {showPlanDetails && plan.id === selectedPlan?.id && (
                                            <div className="flex flex-col items-start w-[95%] flex-1 mt-4 min-h-0">
                                                <div className="flex flex-col items-start w-full flex-1 pr-2">
                                                    {index > 0 && (
                                                        <div className="w-full mb-3 flex-shrink-0">
                                                            <div className="text-sm font-semibold text-foreground mb-2 text-left">
                                                                Everything in {getCurrentPlans()[index - 1]?.title},
                                                                and:
                                                            </div>
                                                        </div>
                                                    )}

                                                    {Array.isArray(plan?.features) &&
                                                        plan?.features?.map((feature) => (
                                                            <div
                                                                key={feature.text}
                                                                className="flex flex-row items-start gap-3 mb-3 w-full"
                                                            >
                                                                <Checkbox
                                                                    checked={true}
                                                                    className="!rounded-full h-4 w-4 flex-shrink-0 border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                                                />
                                                                <FeatureLine
                                                                    text={feature.text}
                                                                    info={feature.subtext}
                                                                    max={16}
                                                                    min={10}
                                                                    gap={6}
                                                                    iconSize={16}
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}


                                        <button
                                            className="mt-4 mb-4"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onShowPlanDetails(plan)
                                            }}
                                        >
                                            <div className="flex flex-row items-center gap-2">
                                                <span className="text-sm text-brand-primary capitalize underline">
                                                    {showPlanDetails && plan.id === selectedPlan?.id
                                                        ? 'Hide Plan Details'
                                                        : 'Show Plan Details'}
                                                </span>

                                                {showPlanDetails && plan.id === selectedPlan?.id ? (
                                                    renderBrandedIcon('/svgIcons/upArrow.svg', 20, 20)
                                                ) : (
                                                    renderBrandedIcon('/svgIcons/downArrow.svg', 20, 20)
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No plans available</div>
                )}
            </div>
        </div >
    )
}

export default PlansListMobile

