import React from "react"
import Image from "next/image"

interface IconProps {
  name: string
  width?: number
  height?: number
  click?: () => void
}

const Zicon: React.FC<IconProps> = ({
  name,
  width = 24,
  height = 24,
  click,
}) => {
  const iconPath = `/icon/${name}.svg`

  return (
    <div style={iconBox} onClick={click}>
      <Image src={iconPath} alt={name} width={width} height={height} />
    </div>
  )
}

export default Zicon

const iconBox: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "32px",
  height: "32px",
  borderRadius: "4px",
  cursor: "pointer",
}
