import Image from 'next/image'
import React from 'react'

const LabelingHeader = ({ img, title, description }) => {
  return (
    <div
      className="w-full h-[152px] rounded-lg p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/agencyIcons/plansBannerBg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Brand Color Overlay */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundColor: 'hsl(var(--brand-primary) / 0.8)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        <Image
          src={img}
          alt="brandConfig"
          width={52}
          height={52}
          className="mb-2"
        />
        <div className="text-white" style={styles.semiBoldHeading}>
          {title}
        </div>
        <div className="text-white" style={styles.smallRegular}>
          {description}
        </div>
      </div>
    </div>
  )
}

export default LabelingHeader

const styles = {
  semiBoldHeading: { fontSize: 22, fontWeight: '600' },
  smallRegular: { fontSize: 13, fontWeight: '400' },
  regular: { fontSize: 16, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
