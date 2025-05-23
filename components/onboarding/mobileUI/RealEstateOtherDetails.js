import React from "react";

function RealEstateOtherDetails({
  inputsFields,
  userBrokage,
  userFarm,
  userTransaction,
  handleVerifyPopup,
  setUserFarm,
  setUserBrokage,
  setUserTransaction,
}) {
  return (
    <div className="w-full">
      <div style={styles.headingStyle} className="mt-6">
        {`What’s your market territory`}
      </div>
      <input
        ref={(el) => (inputsFields.current[0] = el)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="done"
        placeholder="Your territory"
        className="border border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
        style={{ ...styles.inputStyle, marginTop: "8px" }}
        value={userFarm}
        onChange={(e) => {
          setUserFarm(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Done") {
            inputsFields.current[1]?.focus(); // Move to the second input
          }
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        Your brokerage
      </div>
      <input
        ref={(el) => (inputsFields.current[1] = el)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="done"
        placeholder="Brokerage"
        className="border border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
        style={{ ...styles.inputStyle, marginTop: "8px" }}
        value={userBrokage}
        onChange={(e) => {
          setUserBrokage(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Done") {
            inputsFields.current[2]?.focus(); // Move to the second input
          }
        }}
      />

      <div style={styles.headingStyle} className="mt-6">
        How many homes did you sell last year
      </div>
      <input
        ref={(el) => (inputsFields.current[2] = el)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        enterKeyHint="done"
        placeholder="Type here"
        type = "number"
        className="border border-[#00000010] w-full rounded p-3 outline-none mb-2 focus:outline-none focus:ring-0"
        style={{ ...styles.inputStyle, marginTop: "8px" }}
        value={userTransaction}
        onChange={(e) => {
          setUserTransaction(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Done") {
            handleVerifyPopup();
          }
        }}
      />
    </div>
  );
}

export default RealEstateOtherDetails;

const styles = {
  headingStyle: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: "500",
    borderRadius: "7px",
  },
  errmsg: {
    fontSize: 12,
    fontWeight: "500",
    borderRadius: "7px",
  },
  verifyPopup: {
    height: "auto",
    bgcolor: "transparent",
    // p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-55%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
};
