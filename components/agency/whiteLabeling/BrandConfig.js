import React, { useState } from "react";
import Image from "next/image";
import WhiteLAbelTooltTip from "./WhiteLAbelTooltTip";
import UploadImageButton from "./UploadImageButton";
import LabelingHeader from "./LabelingHeader";

const BrandConfig = () => {

  //tool tip
  const Logo1Tip = "Logo should be maximum 512kb for better rendering";
  const FaviconTip = "Image should be maximum 512kb and should be square";

  const [companyName, setCompanyName] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#C90202");
  const [secondaryColor, setSecondaryColor] = useState("#2302C9");

  //logo image selector
  const handleLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  //favicon image selector
  const handleFaviconUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => setFaviconPreview(reader.result);
    reader.readAsDataURL(file);
  };

  //primary color selector
  const handlePrimaryColorChange = (color) => {
    setPrimaryColor(color);
  };

  //secondary color selector
  const handleSecondaryColorChange = (color) => {
    setSecondaryColor(color);
  };

  //reset all the values to default
  const handleReset = () => {
    setCompanyName("");
    setBrandTagline("");
    setLogoPreview(null);
    setFaviconPreview(null);
    setPrimaryColor("#C90202");
    setSecondaryColor("#2302C9");
  };

  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/copied.png"}
        title={"Define how to be seen"}
        description={"Set your default brand elements to determine how Stripe products appear to your customers."}
      />

      {/* Brand Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">

          {/* Company Name */}
          <div className="w-full">
            <div className="text-start mb-2" style={styles.regular}>Company Name</div>
            <input
              style={styles.inputs}
              className="w-full border border-gray-200 outline-none focus:ring-0 rounded p-2"
              placeholder="Type here"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* Brand Tagline */}
          <div className="w-full">
            <div className="text-start mb-2" style={styles.regular}>Brand Tagline</div>
            <input
              style={styles.inputs}
              className="w-full border border-gray-200 outline-none focus:ring-0 rounded p-2"
              placeholder="Type here"
              value={brandTagline}
              onChange={(e) => setBrandTagline(e.target.value)}
            />
          </div>

          {/* Logo Upload */}
          <div className="self-stretch inline-flex justify-between items-center gap-[3px]">
            <div className="inline-flex flex-col justify-start items-start">
              <div className="inline-flex justify-start items-center gap-[3px]">
                <div className="text-black text-base font-normal leading-normal">Logo</div>
                <WhiteLAbelTooltTip tip={Logo1Tip} />
              </div>
            </div>

            <UploadImageButton
              onFileSelect={handleLogoUpload}
              preview={logoPreview}
            />
          </div>

          {/* Favicon Upload */}
          <div className="self-stretch inline-flex justify-between items-center gap-[3px]">
            <div className="inline-flex flex-col justify-start items-start">
              <div className="inline-flex justify-start items-center gap-[3px]">
                <div className="text-black text-base font-normal leading-normal">Favicon</div>
                <WhiteLAbelTooltTip tip={FaviconTip} />
              </div>
            </div>

            <UploadImageButton
              onFileSelect={handleFaviconUpload}
              preview={faviconPreview}
            />
          </div>

          <div className="self-stretch inline-flex justify-start items-center gap-[3px]">
            <div className="flex-1 flex justify-start items-center gap-[3px]">
              <div className="justify-start text-black text-base font-normal font-['Inter'] leading-normal">Primary color</div>
              <WhiteLAbelTooltTip
                tip={Logo1Tip}
              />
            </div>
            <div className="w-32 self-stretch bg-white/80 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-900/10 inline-flex flex-col justify-start items-start gap-[5px] overflow-hidden">
              <div className="self-stretch h-12 p-2.5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-start items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full shadow-[0px_5.591172695159912px_12.160799980163574px_0px_rgba(0,0,0,0.20)] border-[2.80px] border-white cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => document.getElementById('primary-color-picker').click()}
                ></div>
                <div className="flex-1 justify-start text-black text-base font-medium font-['Inter'] leading-snug">{primaryColor}</div>
                <input
                  id="primary-color-picker"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => handlePrimaryColorChange(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-[3px]">
            <div className="flex-1 flex justify-start items-center gap-[3px]">
              <div className="justify-start text-black text-base font-normal font-['Inter'] leading-normal">Secondary color</div>
              <WhiteLAbelTooltTip
                tip={Logo1Tip}
              />
            </div>
            <div className="w-32 self-stretch bg-white/80 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-neutral-900/10 inline-flex flex-col justify-start items-start gap-[5px] overflow-hidden">
              <div className="self-stretch h-12 p-2.5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white inline-flex justify-start items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full shadow-[0px_5.591172695159912px_12.160799980163574px_0px_rgba(0,0,0,0.20)] border-[2.80px] border-white cursor-pointer"
                  style={{ backgroundColor: secondaryColor }}
                  onClick={() => document.getElementById('secondary-color-picker').click()}
                ></div>
                <div className="flex-1 justify-start text-black text-base font-medium font-['Inter'] leading-snug">{secondaryColor}</div>
                <input
                  id="secondary-color-picker"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => handleSecondaryColorChange(e.target.value)}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="self-stretch inline-flex justify-between items-center mt-4">
            <div
              className="px-4 py-2 bg-white/40 rounded-md outline outline-1 outline-slate-200 flex justify-center items-center gap-2.5 cursor-pointer"
              onClick={handleReset}
            >
              <div className="text-slate-900 text-base font-normal leading-relaxed">Reset</div>
            </div>
            <div className="px-4 py-2 bg-purple-700 rounded-md flex justify-center items-center gap-2.5 cursor-pointer">
              <div className="text-white text-base font-normal leading-relaxed">Save Changes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandConfig;

const styles = {
  semiBoldHeading: { fontSize: 22, fontWeight: "600" },
  smallRegular: { fontSize: 13, fontWeight: "400" },
  regular: { fontSize: 16, fontWeight: "400" },
  inputs: { fontSize: "15px", fontWeight: "500", color: "#000000" },
};
