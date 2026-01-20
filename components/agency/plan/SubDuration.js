import React, { useEffect } from 'react'

import { PersistanceKeys } from '@/constants/Constants'

const SubDuration = ({ planDuration, setPlanDuration, isEditPlan }) => {
  const duration = [
    {
      id: 1,
      title: 'Monthly',
      value: 'monthly',
    },
    {
      id: 2,
      title: 'Quarterly',
      value: 'quarterly',
    },
    {
      id: 3,
      title: 'Yearly',
      value: 'yearly',
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
    <div className="w-full">
      <div style={styles.labels}>Subscription Duration <span className="text-red-500">*</span></div>
      <div className="flex flex-row items-center gap-4 w-full mt-2 mb-4">
        {duration.map((item) => {
          return (
            <button
              key={item.id}
              style={styles.regular}
              className={`outline-none ${planDuration === item.value ? 'border-2 border-brand-primary' : 'border-gray-200'} h-[40px] w-[120px] rounded-lg text-center border`}
              onClick={() => {
                handleToggle(item)
              }}
            >
              {item.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SubDuration

//languages
export const LanguagesSelection = ({
  language,
  setLanguage,
  selectedLanguage,
  setLanguageTitle,
  languageTitle,
}) => {
  const languages = [
    {
      id: 1,
      title: 'English or Spanish',
      value: 'english',
      label: 'English and Spanish Compatible',
    },
    {
      id: 2,
      title: 'Multilingual',
      value: 'multilingual',
      label: 'Multilingual Compatible',
    },
  ]

  const languageLabel = {
    EnglistSpanish: 'English and Spanish Compatible',
    Multilingual: 'Multilingual Compatible',
  }

  useEffect(() => {
    if (selectedLanguage === true) {
      setLanguage('multilingual')
      setLanguageTitle('Multilingual Compatible')
    } else if (selectedLanguage === false) {
      setLanguage('english')
      setLanguageTitle('English and Spanish Compatible')
    }
  }, [selectedLanguage])

  //toggle plan duration
  const handleToggle = (item) => {
    if (item.value === language) {
      setLanguage('')
    } else {
      setLanguage(item.value)
    }

    if (item.label === languageTitle) {
      setLanguageTitle('')
    } else {
      setLanguageTitle(item.label)
    }
  }

  //css
  const getLanguageBorderClass = (language, languageTitle, item) => {
    const lang = typeof language === 'string' ? language.toLowerCase() : ''
    const title =
      typeof languageTitle === 'string' ? languageTitle.toLowerCase() : ''
    const itemValue = item?.value?.toLowerCase() || ''
    const itemLabel = item?.label?.toLowerCase() || ''

    if (title === 'multilingual compatible' || lang === 'multilingual') {
      return 'border-2 border-brand-primary'
    }

    if (title === itemLabel || lang === itemValue) {
      return 'border-2 border-brand-primary'
    }

    return 'border-gray-200'
  }
  // ${languageTitle === "Multilingual Compatible" ? "border-2 border-purple" : language === "multilingual" ? "border-2 border-purple" : languageTitle?.toLowerCase() === item.label?.toLowerCase() || language?.toLowerCase() === item.value?.toLowerCase() ? "border-2 border-purple" : "border-gray-200"}

  return (
    <div className="w-full">
      <div style={styles.regular}>Languages</div>
      <div className="flex flex-row items-center gap-4 w-full mt-2 mb-4">
        {languages.map((item) => {
          return (
            <button
              key={item.id}
              style={styles.regular}
              className={`outline-none h-[40px] w-[150px] rounded-lg text-center border ${getLanguageBorderClass(language, languageTitle, item)}`}
              onClick={() => {
                handleToggle(item)
              }}
            >
              {item.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  regular: {
    fontSize: '15px',
    fontWeight: '500',
  },
  labels: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#00000050',
  },
  inputs: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#000000',
  },
}
