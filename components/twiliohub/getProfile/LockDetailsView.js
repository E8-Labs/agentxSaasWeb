import { Lock } from '@phosphor-icons/react'
import React from 'react'

const LockDetailsView = ({
  description = 'Customer Profile needs to be approved to continue.',
  btnTitle = 'Complete CNAM',
  profileStatus,
  handleShowAddModal,
  showBtn = false,
  unLockDescription,
  businessProfileData,
}) => {
  const styles = {
    normalFont: {
      fontSize: 15,
      fontWeight: '500',
    },
  }

  return (
    <div
      className="bg-[#00000005] px-4 py-2 rounded-b-lg w-full flex flex-row items-center justify-between"
      style={{ borderTop: '1px solid #00000010' }}
    >
      <div className="flex flex-row items-center gap-2">
        {!showBtn && profileStatus ? (
          <div className="lock-icon-outline">
            <Lock
              size={18}
              weight="regular"
              style={{
                color: 'hsl(var(--brand-primary))',
              }}
            />
          </div>
        ) : (
          ''
        )}
        {profileStatus ? (
          <div style={styles.normalFont}>{description}</div>
        ) : (
          <div style={styles.normalFont}>{unLockDescription}</div>
        )}
      </div>
      {
        // (!showBtn && !profileStatus && businessProfileData && businessProfileData.profileType !== "individual") && (
        !showBtn &&
          !profileStatus &&
          (!businessProfileData ||
            businessProfileData.profileType !== 'individual') && (
            <button
              className="border-none outline-none text-brand-primary"
              style={styles.normalFont}
              onClick={handleShowAddModal}
            >
              {btnTitle}
            </button>
          )
      }
      {businessProfileData &&
        businessProfileData.profileType == 'individual' && (
          <button
            // className='border-none outline-none text-purple'
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
            // style={styles.normalFont}
            // onClick={handleShowAddModal}
          >
            You need a Business Primary Profile
          </button>
        )}
    </div>
  )
}

export default LockDetailsView
