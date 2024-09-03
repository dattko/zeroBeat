import React from "react"
import Image from "next/image"
import styles from "./Icon.module.scss"

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
    <div className={styles.zicon} onClick={click}>
      <Image src={iconPath} alt={name} width={width} height={height} />
    </div>
  )
}

export default Zicon

