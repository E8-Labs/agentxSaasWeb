/**
 * Classify Gmail watch errors for display in the UI.
 * Matches backend messages from gmailWatchService and MailIntegrationController.
 *
 * @param {{ provider?: string, watchStatus?: string, watchError?: string | null }} account - Mail integration (Gmail) account
 * @returns {{ type: 'refresh_token' | 'quota' | 'scope' | null, shortLabel: string, actionHint: string, actionLabel: string } | null }
 */
export function getGmailWatchErrorInfo(account) {
  if (account?.provider !== 'gmail') return null
  const err = account.watchError
  const status = account.watchStatus
  if (!err && status !== 'failed') return null

  const msg = (err || '').toLowerCase()

  // 1) Refresh token expired or revoked
  if (
    msg.includes('refresh token') &&
    (msg.includes('expired') || msg.includes('revoked'))
  ) {
    return {
      type: 'refresh_token',
      shortLabel: 'Reconnect required',
      actionHint: 'Refresh token expired or revoked. Please reconnect your Gmail account.',
      actionLabel: 'Reconnect to fix',
    }
  }

  // 2) Gmail API quota or Pub/Sub permissions
  if (
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('pub/sub') ||
    msg.includes('insufficient permissions')
  ) {
    return {
      type: 'quota',
      shortLabel: 'Quota or permissions',
      actionHint:
        'Gmail API quota exceeded or insufficient permissions. Check Pub/Sub permissions and quotas in Google Cloud Console.',
      actionLabel: 'Check Pub/Sub & quotas',
    }
  }

  // 3) gmail.readonly scope required
  if (msg.includes('gmail.readonly') || msg.includes('read your email')) {
    return {
      type: 'scope',
      shortLabel: 'Read scope required',
      actionHint:
        'Gmail watch requires the "Read your email" scope (gmail.readonly). Ensure OAuth includes gmail.readonly and reconnect your Gmail account.',
      actionLabel: 'Reconnect with read scope',
    }
  }

  // Generic failed watch
  if (status === 'failed' && err) {
    return {
      type: null,
      shortLabel: 'Watch error',
      actionHint: err,
      actionLabel: 'Reconnect to fix',
    }
  }

  return null
}
