'use client'

import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import DialerModal from '@/components/dialer/DialerModal'
import IncomingCallBanner from '@/components/dialer/IncomingCallBanner'
import {
    selectIsDialerOpen,
    selectCallStatus,
    selectPreventClose,
    selectLeadData,
    closeDialer,
    forceCloseDialer,
} from '@/store/slices/dialerSlice'

export default function AgencyDialerProvider() {
    const dispatch = useDispatch()
    const isDialerOpen = useSelector(selectIsDialerOpen)
    const callStatus = useSelector(selectCallStatus)
    const preventClose = useSelector(selectPreventClose)
    const leadData = useSelector(selectLeadData)

    const handleDialerClose = useCallback(() => {
        if (preventClose && ['in-call', 'ringing', 'connecting'].includes(callStatus)) {
            if (window.confirm('You have an active call. Are you sure you want to close?')) {
                dispatch(forceCloseDialer())
            }
        } else {
            dispatch(closeDialer())
        }
    }, [preventClose, callStatus, dispatch])

    return (
        <>
            <IncomingCallBanner />
            <DialerModal
                key="global-dialer-modal"
                open={isDialerOpen}
                onClose={handleDialerClose}
                initialPhoneNumber={leadData?.phoneNumber || ''}
                leadId={leadData?.leadId}
                leadName={leadData?.leadName}
            />
        </>
    )
}