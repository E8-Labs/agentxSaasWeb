'use client'

import React from 'react'
import Perplexity from './Perplexity'
import NoPerplexity from './NoPerplexity'
import ConfirmPerplexityModal from './CofirmPerplexityModal'

const InsightsTabCN = ({
  selectedLeadsDetails,
  showConfirmPerplexity,
  setshowConfirmPerplexity,
  userLocalData,
  handleEnrichLead,
  loading,
  creditCost,
}) => {
  return (
    <>
      {selectedLeadsDetails?.enrichData ? (
        <Perplexity selectedLeadsDetails={selectedLeadsDetails} />
      ) : (
        <NoPerplexity
          setshowConfirmPerplexity={setshowConfirmPerplexity}
          user={userLocalData}
          handleEnrichLead={handleEnrichLead}
          loading={loading}
          creditCost={creditCost}
        />
      )}

      <ConfirmPerplexityModal
        showConfirmPerplexity={showConfirmPerplexity}
        setshowConfirmPerplexity={setshowConfirmPerplexity}
        selectedLeadsDetails={selectedLeadsDetails}
        handleEnrichLead={handleEnrichLead}
        loading={loading}
        creditCost={creditCost}
      />
    </>
  )
}

export default InsightsTabCN

