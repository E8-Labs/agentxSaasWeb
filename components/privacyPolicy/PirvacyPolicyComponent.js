import Image from 'next/image'
import React from 'react'

function PirvacyPolicyComponent() {
  return (
    <div className="flex flex-col items-center h-screen w-full px-[5vw] overflow-y-auto pb-10">
      <div className="flex w-full px-4 py-3 pt-6 w-full bg-white shadow-lg shadow-[#7902df10] rounded-lg">
        <Image src={'/agentx-logo.png'} alt="logo" width={150} height={150} />
      </div>

      <div className="flex flex-col items-start justify-center w-[65%] mt-[10vh]">
        <div className="text-[40px] font-bold text-black text-center w-full">
          Privacy Policy
        </div>

        <div className="text-[19px] text-black font-bold mt-[17vh]">
          Effective Date: Dec 12, 2024
        </div>

        <div className="text-[19px] text-black font-[400] mt-6">
          Welcome to AssignX.ai, a pioneering AI-powered real estate agent
          platform. We are headquartered in San Francisco, CA, and provide our
          services across the United States and Canada. This Privacy Policy
          explains how we collect, use, protect, and share your information.
          <div className="mt-6">
            1. Introduction
            <br />
            At AssignX.ai, we respect your privacy and are committed to
            protecting your personal data. This policy applies to all
            information collected through our website, mobile application, and
            AI-powered communication tools.
          </div>
          <div className="mt-6">
            2. Information Collection
            <br />
            We collect the following types of information:
            <br />
            <ul className="list-disc list-inside ml-4 text-[17px]">
              <li>
                Agent Personality Data: To create a unique, personalized
                experience for real estate agents.
              </li>
              <li>
                {`Customer Data: Information provided by or about our user's clients`}
                .
              </li>
              <li>
                Agent Data: Information about our users, the real estate agents.
              </li>
            </ul>
          </div>
          <div className="mt-4">
            These data points help us tailor experiences for both agents and
            their customers and improve our AI-driven processes. We do not share
            this data with any third parties.
            <br />
          </div>
          <div className="mt-6">
            3. User Interaction <br />
            Our users interact with our services primarily through an app, SMS,
            and our website. Our services are designed for users in the 30 to 55
            age range.
          </div>
          <div className="mt-6">
            4. Data Security <br />
            We employ industry-standard security measures to ensure the
            protection of your data against unauthorized access and misuse.
          </div>
          <div className="mt-6">
            5. Compliance Requirements <br />
            Given our operations in the United States and Canada, we adhere to:
            <ul className="list-disc list-inside ml-4 text-[17px]">
              <li>The California Consumer Privacy Act (CCPA).</li>
            </ul>
            The Personal Information Protection and Electronic Documents Act
            (PIPEDA) in Canada.
            <br />
            <ul className="list-disc list-inside ml-4 text-[17px]">
              <li>
                These laws provide users with rights regarding their personal
                data.
              </li>
            </ul>
          </div>
          <div className="mt-6">
            6. Cookies and Tracking Technologies <br />
            We use standard cookies and similar technologies to enhance user
            experience and analyze platform usage.
          </div>
          <div className="mt-6">
            7. Data Retention and Deletion
            <br />
            We adhere to industry standards for data retention and deletion.
            Users have the right to request the deletion of their personal data.
          </div>
          <div className="mt-6">
            8. International Data Transfer
            <br />
            Our data operations are confined to the United States and Canada,
            ensuring data remains within these borders.
          </div>
          <div className="mt-6">
            9. User Rights
            <br />
            Users have the right to access, correct, and delete their personal
            data directly from the app they’re using or by requesting through
            our email using hello@myagentx.com
          </div>
          <div className="mt-6">
            10. Contact Information
            <br />
            For any privacy-related inquiries or concerns, please reach out to
            us via our email at hello@myagentx.com.
          </div>
          <div className="mt-6">
            11. Changes to This Policy
            <br />
            We may update this policy periodically. Significant changes will be
            communicated through our platform or via email.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PirvacyPolicyComponent
