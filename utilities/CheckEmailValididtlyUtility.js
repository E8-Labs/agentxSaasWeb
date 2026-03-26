import { toast } from '@/utils/toast'

let formatToastTimeoutId = null

const clearPendingFormatToast = () => {
    if (formatToastTimeoutId) {
        clearTimeout(formatToastTimeoutId)
        formatToastTimeoutId = null
    }
}

export const toastMsg = () => {
    clearPendingFormatToast()
    formatToastTimeoutId = setTimeout(() => {
        formatToastTimeoutId = null
        toast.error('Use a proper email')
    }, 700)
}

export const EmailFormatMessage = {
    emailErrMsg: 'Use a proper email',
}

/** Domains that are always rejected (case-insensitive), including subdomains. */
const BLOCKED_EMAIL_DOMAINS = ['pindush.com', 'pindush.net']

const isBlockedEmailDomain = (domain) => {
    const d = domain.toLowerCase()
    return BLOCKED_EMAIL_DOMAINS.some(
        (blocked) => d === blocked || d.endsWith(`.${blocked}`),
    )
}

/**
 * Returns true when the email is not in an acceptable format (invalid).
 * Returns false when the format looks acceptable for further checks (e.g. API).
 * On invalid format, also shows toast via //toastMsg().
 */
export const checkEmailFormat = (email) => {
    if (typeof email !== 'string') {
        //toastMsg()
        return true
    }
    const trimmed = email.trim()
    if (!trimmed) {
        //toastMsg()
        return true
    }

    const parts = trimmed.split('@')
    if (parts.length !== 2) {
        //toastMsg()
        return true
    }

    const [local, domain] = parts
    if (!local || !domain) {
        //toastMsg()
        return true
    }
    if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) {
        //toastMsg()
        return true
    }

    if (isBlockedEmailDomain(domain)) {
        return true
    }

    const labels = domain.split('.')
    if (labels.length < 2) {
        //toastMsg()
        return true
    }
    if (labels.some((label) => !label)) {
        //toastMsg()
        return true
    }

    const tld = labels[labels.length - 1]
    if (!/^[a-zA-Z]{2,}$/.test(tld)) {
        //toastMsg()
        return true
    }

    if (/^\d+$/.test(labels[0])) {
        //toastMsg()
        return true
    }

    const labelOk = (label) =>
        label.length === 1
            ? /^[a-zA-Z0-9]$/.test(label)
            : /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(label)

    if (!labels.every(labelOk)) {
        //toastMsg()
        return true
    }
    clearPendingFormatToast()
    return false
}
