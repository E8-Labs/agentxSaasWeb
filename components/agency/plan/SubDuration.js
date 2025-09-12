import React from 'react'

const SubDuration = ({
    planDuration,
    setPlanDuration
}) => {

    const duration = [
        {
            id: 1,
            title: "Monthly",
            value: "monthly"
        },
        {
            id: 2,
            title: "Quaterly",
            value: "quarterly"
        },
        {
            id: 3,
            title: "Yearly",
            value: "yearly"
        },
        // {
        //     id: 4,
        //     title: "Half Yearly",
        //     value: "half-yearly"
        // },
    ]

    //toggle plan duration
    const handleToggle = (item) => {
        setPlanDuration(item.value)
    }

    return (
        <div className='w-full'>
            <div style={styles.regular}>
                Subscription Duration
            </div>
            <div className='flex flex-row items-center gap-4 w-full mt-2 mb-4'>
                {
                    duration.map((item) => {
                        return (
                            <button
                                key={item.id}
                                style={styles.regular}
                                className={`outline-none ${planDuration === item.value ? "border-2 border-purple" : "border-gray-200"} h-[40px] w-[120px] rounded-lg text-center border`}
                                onClick={() => { handleToggle(item) }}
                            >
                                {item.title}
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default SubDuration;


//languages
export const LanguagesSelection = ({
    language,
    setLanguage,
}) => {
    const languages = [
        {
            id: 1,
            title: "English or Spanish",
            value: "english"
        },
        {
            id: 2,
            title: "Multilingual",
            value: "multilingual"
        },
    ]

    //toggle plan duration
    const handleToggle = (item) => {
        setLanguage(item.value)
    }
    return (
        <div className='w-full'>
            <div style={styles.regular}>
                Languages
            </div>
            <div className='flex flex-row items-center gap-4 w-full mt-2 mb-4'>
                {
                    languages.map((item) => {
                        return (
                            <button
                                key={item.id}
                                style={styles.regular}
                                className={`outline-none ${language === item.value ? "border-2 border-purple" : "border-gray-200"} h-[40px] w-[150px] rounded-lg text-center border`}
                                onClick={() => { handleToggle(item) }}
                            >
                                {item.title}
                            </button>
                        )
                    })
                }
            </div>
        </div>
    )
}


const styles = {
    regular: {
        fontSize: "15px", fontWeight: "500"
    },
}
