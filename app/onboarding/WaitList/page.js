"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = ({ handleContinue, DefaultData }) => {
  const styles = {
    modalsStyle: {
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

  const backgroundImage = {
    backgroundImage: 'url("/assets/background.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "100svh",
    overflow: "hidden",
  };

  return (
    <div
      style={backgroundImage}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div
        style={{ width: "100%" }}
        className="overflow-y-none flex flex-row justify-center items-center"
      >
        <div
          className="bg-white rounded-2xl mx-2 w-full md:w-10/12 h-[94%] py-4 flex flex-col "
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex flex-col items-center max-h-[89vh] ">
            {/* header */}
            <div className=" w-full h-[10%] px-4 flex flex-row items-center">
              <Image
                className="ms-6"
                src="/assets/agentX.png"
                style={{ height: "29px", width: "122px", resize: "contain" }}
                height={29}
                width={122}
                alt="*"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col items-center px-4 w-full h-[95%] -mt-4">
              <div className="w-full flex flex-row items-center justify-center">
                {/* <div className='h-[198px] bg-gray-200 rounded w-full flex flex-col justify-center pb-[10px] items-center'> */}
                <img
                  src={"/otherAssets/waitAvt.png"}
                  style={{ width: "162px", height: "70px", resize: "contain" }}
                  alt="*"
                />
                {/* </div> */}
              </div>

              <div
                className="mt-2 w-11/12 md:text-4xl text-lg font-[700]"
                style={{ textAlign: "center" }}
              >
                {`You’ve Joined the AgentX Waitlist`}
              </div>

              <div
                className="mt-4 w-full md:w-9/12 lg:w-7/12 font-[400] overflow-auto"
                style={{ textAlign: "", fontSize: 15, scrollbarWidth: "none" }}
              >
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    lineHeight: "1.6",
                    margin: "1rem",
                  }}
                >
                  <p>
                    <em>A letter from our Founder</em>
                  </p>

                  <h2
                    style={{ fontWeight: "bold", marginTop: 25 }}
                  >{`You’re Part of the Revolution.`}</h2>
                  <p className="mt-1">
                    {`AgentX isn’t just a product; it’s a bold step forward. By joining the waitlist, you’ve
                                        aligned yourself with the future of AI, lead generation, and communication.`}
                  </p>
                  <p className="mt-4">
                    {`Our team is working tirelessly to craft something extraordinary. We don’t do “good enough.”
                                        We’re building a tool that will empower you to connect, engage, and succeed like never before.`}
                  </p>

                  <h3 style={{ fontWeight: "bold", marginTop: 20 }}>
                    Why the Wait?
                  </h3>
                  <p className="">
                    {`Because excellence takes time. We’re perfecting AgentX to ensure it not only meets but
                                        surpasses your expectations.`}
                  </p>

                  <h3 style={{ fontWeight: "bold", marginTop: 20 }}>
                    What’s Next?
                  </h3>
                  <p>
                    {`Keep an eye on your inbox for updates and early access opportunities. When AgentX launches,
                                        you’ll be among the first to lead the charge.`}
                  </p>

                  <h3 style={{ fontWeight: "bold", marginTop: 20 }}>
                    The Future is Coming. Get Ready 🚀🚀.
                  </h3>
                  <p>
                    {`We’re thrilled to have you on board. The best is yet to come.`}
                  </p>

                  <p
                    style={{ fontWeight: "bold", marginTop: 20 }}
                  >{`– Noah The Developer`}</p>
                </div>
              </div>

              <div className="w-6/12 flex flex-row items-center justify-center">
                <Link
                  href={"/"}
                  className="bg-purple h-[50px] w-full flex flex-row items-center justify-center rounded-xl w-full rounded-xl text-white"
                  style={{
                    fontWeight: "600",
                    fontSize: 15,
                    textDecoration: "none",
                  }}
                >
                  Done
                </Link>
              </div>
            </div>
          </div>

          {/* <div className="h-[10%]">
            <div className="mb-8" style={{ height: "40px" }}>
              
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Page;
