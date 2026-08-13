import Image from "next/image"

export function C3PayLogo() {
  return (
    <Image
      src="/images/c3pay-edenred-logo.png"
      alt="C3 Pay by Edenred"
      width={168}
      height={84}
      priority
      className="h-16 w-auto object-contain"
    />
  )
}
