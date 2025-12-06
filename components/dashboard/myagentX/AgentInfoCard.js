import Image from 'next/image'

const AgentInfoCard = ({ name, value, icon, bgColor, iconColor }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {/* Icon */}
      <Image src={icon} height={24} color={bgColor} width={24} alt="icon" />

      <div style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>
        {name}
      </div>
      <div style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>
        {value}
      </div>
    </div>
  )
}

export default AgentInfoCard
