import { CircularProgress } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { GetFormattedDateString } from '@/utilities/utility'

import { formatFractional2 } from '../agency/plan/AgencyUtilities'
import Apis from '../apis/Apis'
import TransactionDetailsModal from '../modals/TransactionDetailsModal'

function BillingHistory({ selectedUser }) {
  const PAGE_SIZE = 20
  //stoores payment history
  const [PaymentHistoryData, setPaymentHistoryData] = useState([])
  const [historyLoader, setHistoryLoader] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const loadMoreRef = useRef(null)
  const observerRef = useRef(null)

  //transaction details modal variables
  const [transactionDetailsModal, setTransactionDetailsModal] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState(null)
  const [transactionDetailsLoader, setTransactionDetailsLoader] =
    useState(false)
  const [clickedTransactionId, setClickedTransactionId] = useState(null)

  const userIdParam = useMemo(() => {
    return selectedUser?.id ? String(selectedUser.id) : null
  }, [selectedUser?.id])

  const buildPaymentHistoryUrl = useCallback(
    (nextOffset) => {
      const url = new URL(Apis.getPaymentHistory)
      if (userIdParam) url.searchParams.set('userId', userIdParam)
      url.searchParams.set('offset', String(nextOffset))
      url.searchParams.set('limit', String(PAGE_SIZE))
      return url.toString()
    },
    [PAGE_SIZE, userIdParam],
  )

  //function to get payment history
  const getPaymentHistory = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setHistoryLoader(true)
      } else {
        setIsLoadingMore(true)
      }

      let AuthToken = null
      let localDetails = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const LocalDetails = JSON.parse(localData)
        localDetails = LocalDetails
        AuthToken = LocalDetails.token
      }

      const nextOffset = reset ? 0 : offset
      const ApiPath = buildPaymentHistoryUrl(nextOffset)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          const nextItems = Array.isArray(response.data.data)
            ? response.data.data
            : []

          setPaymentHistoryData((prev) =>
            reset ? nextItems : [...prev, ...nextItems],
          )

          const reachedEnd = nextItems.length < PAGE_SIZE
          setHasMore(!reachedEnd)
          setOffset(nextOffset + nextItems.length)
        }
      }
    } catch (error) {
      console.error('Error occured in get history api is', error)
    } finally {
      setHistoryLoader(false)
      setIsLoadingMore(false)
    }
  }

  // Initial load / reload when selected user changes
  useEffect(() => {
    setPaymentHistoryData([])
    setOffset(0)
    setHasMore(true)
    getPaymentHistory({ reset: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdParam])

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return
    if (historyLoader || isLoadingMore) return

    const el = loadMoreRef.current
    if (!el) return

    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) {
          getPaymentHistory({ reset: false })
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 },
    )

    observerRef.current.observe(el)
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [hasMore, historyLoader, isLoadingMore, offset])

  //function to get transaction details
  const getTransactionDetails = async (transactionId) => {
    try {
      setTransactionDetailsLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const Data = JSON.parse(localData)
        AuthToken = Data.token
      }

      let ApiPath = `${Apis.getTransactionDetails}?transactionId=${transactionId}`
      if (selectedUser) {
        ApiPath = ApiPath + `&userId=${selectedUser.id}`
      }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setTransactionDetails(response.data.data)
          setTransactionDetailsModal(true)
        } else {
          console.error(
            'Failed to fetch transaction details:',
            response.data.message,
          )
        }
      }
    } catch (error) {
      console.error('Error occurred in get transaction details api:', error)
    } finally {
      setTransactionDetailsLoader(false)
      setClickedTransactionId(null)
    }
  }

  //function to handle transaction click
  const handleTransactionClick = (item) => {
    if (item.transactionId) {
      setClickedTransactionId(item.transactionId)
      getTransactionDetails(item.transactionId)
    } else {
      console.error('Transaction ID not available')
    }
  }

  return (
    <div
      className={`w-full flex flex-col items-start pl-8 py-2 h-screen overflow-y-auto overflow-x-hidden`}
      // ${selectedUser ? 'h-[70vh]' : 'h-screen'}
      style={{
        paddingBottom: '50px',
        scrollbarWidth: 'none', // For Firefox
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex flex-col">
        <div style={{ fontSize: 22, fontWeight: '700', color: '#000' }}>
          Billing
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#00000090',
          }}
        >
          {'Account > Billing'}
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: '700', marginTop: 40 }}>
        My Billing History
      </div>

      <div className="w-full flex flex-row justify-between mt-10 px-6 gap-3">
        <div className="w-4/12">
          <div style={styles.text}>Name</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Amount</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Status</div>
        </div>
        <div className="w-4/12">
          <div style={styles.text}>Date</div>
        </div>
      </div>

      <div className="w-full h-auto">
        {historyLoader ? (
          <div className="w-full flex flex-row items-center justify-center mt-8 pb-12">
            <CircularProgress size={35} thickness={2} />
          </div>
        ) : (
          <div className="w-full">
            {PaymentHistoryData.map((item) => (
              <div
                key={item.id}
                className={`w-full flex flex-row items-center gap-3 mt-10 px-6 rounded-lg py-2 transition-colors ${
                  transactionDetailsLoader
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:bg-gray-50'
                }`}
                onClick={() =>
                  !transactionDetailsLoader && handleTransactionClick(item)
                }
              >
                <div className="w-4/12 flex flex-row gap-2">
                  <div className="truncate" style={styles.text2}>
                    {item.title}
                  </div>
                </div>
                <div className="w-2/12">
                  <div style={styles.text2}>
                    ${formatFractional2(item.price)}
                  </div>
                </div>
                <div className="w-2/12 items-start">
                  {clickedTransactionId === item.transactionId &&
                  transactionDetailsLoader ? (
                    <div className="flex items-center justify-center">
                      <CircularProgress size={20} thickness={2} />
                    </div>
                  ) : (
                    <div
                      className="p-2 flex flex-row gap-2 items-center justify-center"
                      style={{
                        backgroundColor:
                          item.processingStatus === 'failed'
                            ? '#FF000010'
                            : '#01CB7610',
                        borderRadius: 20,
                        // padding: '2px',
                        width: '4vw',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          color:
                            item.processingStatus === 'failed'
                              ? '#FF0000'
                              : '#01CB76',
                          fontWeight: 500,
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                      >
                        {item.processingStatus === 'failed' ? 'Failed' : 'Paid'}
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-4/12">
                  <div style={styles.text2}>
                    {moment(item?.createdAt).format('MMM DD YYYY  h:mm A')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Infinite scroll sentinel + loader */}
      <div className="w-full flex flex-row items-center justify-center py-6">
        {hasMore ? (
          <div ref={loadMoreRef} className="w-full flex justify-center">
            {isLoadingMore && (
              <CircularProgress size={22} thickness={2} />
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No more transactions
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        open={transactionDetailsModal}
        onClose={() => setTransactionDetailsModal(false)}
        transactionDetails={transactionDetails}
        isLoading={transactionDetailsLoader}
      />
    </div>
  )
}

export default BillingHistory

const styles = {
  text: {
    fontSize: 12,
    color: '#00000090',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: 500,
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  paymentModal: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
  gitTextStyle: {
    fontSize: 15,
    fontWeight: '700',
  },

  //style for plans
  cardStyles: {
    fontSize: '14',
    fontWeight: '500',
    border: '1px solid #00000020',
  },
  pricingBox: {
    position: 'relative',
    // padding: '10px',
    borderRadius: '10px',
    // backgroundColor: '#f9f9ff',
    display: 'inline-block',
    width: '100%',
  },
  triangleLabel: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderTop: '50px solid #7902DF', // Increased height again for more padding
    borderLeft: '50px solid transparent',
  },
  labelText: {
    position: 'absolute',
    top: '10px', // Adjusted to keep the text centered within the larger triangle
    right: '5px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    transform: 'rotate(45deg)',
  },
  content: {
    textAlign: 'left',
    paddingTop: '10px',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: '#7902DF65',
    fontSize: 18,
    fontWeight: '600',
  },
  discountedPrice: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: '10px',
  },
}
