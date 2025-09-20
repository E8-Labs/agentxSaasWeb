import React, { useEffect } from 'react'

const SubDuration = ({
    planDuration,
    setPlanDuration,
    isEditPlan
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
            <div style={styles.labels}>
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
                                disabled={isEditPlan}
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
    selectedLanguage,
    setLanguageTitle,
    languageTitle
}) => {
    const languages = [
        {
            id: 1,
            title: "English or Spanish",
            value: "english",
            label: "English"
        },
        {
            id: 2,
            title: "Multilingual",
            value: "multilingual",
            label: "Spanish"
        },
    ]

    useEffect(() => {
        console.log("Language to show", selectedLanguage);
        if (selectedLanguage === true) {
            console.log("Select multilingual");
            setLanguage("multilingual")
            setLanguageTitle("Spanish")
        } else if (selectedLanguage === false) {
            console.log("Select english");
            setLanguage("english")
            setLanguageTitle("English")
        }
    }, [selectedLanguage])

    //toggle plan duration
    const handleToggle = (item) => {
        setLanguage(item.value)
        setLanguageTitle(item.label)
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
                                className={`outline-none ${languageTitle.toLowerCase() === item.label.toLowerCase() || language.toLowerCase() === item.value.toLowerCase() ? "border-2 border-purple" : "border-gray-200"} h-[40px] w-[150px] rounded-lg text-center border`}
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
    labels: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#00000050",
    },
    inputs: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#000000",
    },
}
