import { next30Days } from '@/constants/Constants'
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { getUserPlans } from '@/components/userPlans/UserPlanServices'
import { getFeaturesToLose, getFreePlan } from '@/utilities/PlanComparisonUtils'
import { useUser } from '@/hooks/redux-hooks'
function CancelConfirmation({
    handleContinue
}) {

    const [confirmChecked,setConfirmChecked] = useState(false)
    const [features, setFeatures] = useState([])
    const [nxtCharge,setNxtChage] = useState(null)
    const [currentPlan, setCurrentPlan] = useState(null)
    const [loading, setLoading] = useState(true)

    const { user: reduxUser } = useUser()


    useEffect(()=>{
        getUserData()
        loadCurrentPlanFeatures()
    },[])

    useEffect(()=>{
        console.log('🔍 [CANCELATION FLOW] Redux User:', reduxUser)
    },[reduxUser])

    const getUserData = () =>{
        let data = localStorage.getItem("User")

        if(data){
            let u = JSON.parse(data)
            let date = u.user.nextChargeDate

            date = moment(date).format("MM/DD/YYYY")
            setNxtChage(date)
        }
    }

    

    const loadCurrentPlanFeatures = async () => {
        try {
            setLoading(true)
            
            // Get current user plan - try Redux first, fallback to localStorage
            let userPlan = reduxUser?.plan;
            
            // If Redux doesn't have plan data or shows Free plan, check localStorage  
            if (!userPlan || userPlan.name === 'Free') {
                const localData = localStorage.getItem("User");
                if (localData) {
                    const userData = JSON.parse(localData);
                    userPlan = userData.user?.plan;
                    console.log('🔄 [CANCELATION FLOW] Using localStorage plan data:', userPlan);
                }
            }
            
            if (userPlan) {
                setCurrentPlan(userPlan)
                
                // Get all plans to find the current plan details
                const allPlans = await getUserPlans()
                const currentPlanDetails = allPlans.find(plan => plan.id === userPlan.planId)
                console.log('🔍 [CANCELATION FLOW] All plans:', allPlans)
                console.log('🔍 [CANCELATION FLOW] User plan:', userPlan)
                console.log('🔍 [CANCELATION FLOW] Current plan details:', currentPlanDetails)
                
                if (currentPlanDetails) {
                    // Get free plan for comparison (cancellation means going to free)
                    let freePlan = allPlans.find(plan => plan.name === 'Free' || plan.isFree === 1)
                    
                    // If free plan doesn't have proper capabilities, create a fallback
                    if (freePlan && !freePlan.capabilities) {
                        freePlan = {
                            ...freePlan,
                            capabilities: {
                                maxAgents: 1,
                                maxLeads: 500,
                                maxTeamMembers: 0,
                                allowPrioritySupport: false,
                                allowZoomSupport: false,
                                allowGHLSubaccounts: false,
                                allowLeadSource: false,
                                allowKnowledgeBases: false,
                                allowSuccessManager: false
                            }
                        };
                        console.log('🔧 [CANCELATION FLOW] Added capabilities to free plan:', freePlan);
                    }
                    
                    // Use getFeaturesToLose function to get actual features that will be lost
                    const featuresToLose = getFeaturesToLose(currentPlanDetails, freePlan)
                    
                    // Convert to the format expected by the UI
                    const planFeatures = featuresToLose.map((feature, index) => ({
                        id: index + 1,
                        title: feature
                    }))
                    
                    setFeatures(planFeatures)
                } else {
                    // Fallback to default features if plan details not found
                    setFeatures(getDefaultFeatures())
                }
            } else {
                // Fallback to default features if no plan found
                setFeatures(getDefaultFeatures())
            }
        } catch (error) {
            console.error('Error loading current plan features:', error)
            // Fallback to default features on error
            setFeatures(getDefaultFeatures())
        } finally {
            setLoading(false)
        }
    }

    const getDefaultFeatures = () => {
        return [
            { id: 1, title: 'Mins of AI Credits' },
            { id: 2, title: 'Unlimited AI Agents' },
            { id: 3, title: 'Unlimited Team' },
            { id: 4, title: 'LLMs' },
            { id: 5, title: 'AI Powered CRM' },
            { id: 6, title: 'Lead Enrichment' },
            { id: 7, title: '10,000+ Integrations' },
            { id: 8, title: 'Custom Voicemails' },
            { id: 9, title: 'Geo-Based Phone Access' },
            { id: 10, title: 'DNC Check' },
            { id: 11, title: 'Lead Source' },
            { id: 12, title: 'AI Powered Message' },
            { id: 13, title: 'AI Powered Email' },
            { id: 14, title: 'Zoom Support' },
            { id: 15, title: 'Priority Support' },
            { id: 16, title: 'Tech Support' }
        ]
    }


    return (
        <div className='flex flex-col items-center gap-2 h-full py-4'>

            <Image className='-mt-5'
                src={"/otherAssets/IconAccount.png"}
                height={48} width={48} alt='*'
            />
            <div
                className="text-center mt-2 text-xl font-semibold"

            >
                Confirm Your Cancellation
            </div>

            <div className="flex flex-col items-center justify-center w-full mt-4">
                <div
                    className="text-center text-base font-normal"
                >
                    {`Canceling means you’ll lose access to the features below starting [${nxtCharge||""}]. Still want to move forward?`}
                </div>

                <div
                    className="text-center text-base font-normal mt-3"
                >
                    {`You'll lose access to`}
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center w-full mt-4 h-[33vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple mx-auto mb-2"></div>
                            <div className="text-sm text-gray-600">Loading features...</div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full mt-4 max-h-[33vh] overflow-y-auto">
                        {features.map((item, idx) => (
                            <div key={item.id} className="flex flex-row items-center gap-2">
                                <Image src={'/svgIcons/selectedTickBtn.svg'}
                                    height={24} width={24} alt="cross"
                                    className="flex-shrink-0"
                                />
                                <div className="text-base font-normal text-gray-700">
                                    {item.title}
                                </div>
                            </div>
                        ))}
                    </div>
                )}


            </div>

            <div className='flex flex-row items-center w-full justify-start mt-3 gap-2'>
                <button onClick={()=>{
                    setConfirmChecked(!confirmChecked)
                }}>
                    {confirmChecked ? (
                        <div
                            className="bg-purple flex flex-row items-center justify-center rounded"
                            style={{ height: "24px", width: "24px" }}
                        >
                            <Image
                                src={"/assets/whiteTick.png"}
                                height={8}
                                width={10}
                                alt="*"
                            />
                        </div>
                    ) : (
                        <div
                            className="bg-none border-2 flex flex-row items-center justify-center rounded"
                            style={{ height: "24px", width: "24px" }}
                        ></div>
                    )}
                </button>

                <div className='text-xs font-normal'>
                    I confirm that my account will be cancelled and lose access.
                </div>
            </div>


            <button
                className={`w-full flex items-center rounded-lg justify-center mt-5 border h-[50px] ${!confirmChecked ? "bg-gray-300 text-black" : "bg-purple text-white"}`}
                style={{
                    fontWeight: "400",
                    fontSize: 15.8,
                    outline: "none",
                }}

                disabled = {!confirmChecked}

                onClick={() => {
                    let nextAction = "finalStep"
                    handleContinue(nextAction)
                }}
            >
                Confirm Cancellation
            </button>


        </div >
    )
}

export default CancelConfirmation