import Image from 'next/image'

export function WathiqLogo({ placement }: { placement: 'login' | 'sidebar' | 'mobile' | 'report' }) {
  return (
    <span className={`wathiq-logo ${placement === 'sidebar' ? 'on-navy' : ''}`}>
      <Image
        src="/logo.png"
        alt="شعار وثيق"
        width={797}
        height={931}
        className={`wathiq-logo-image logo-${placement}`}
        priority={placement === 'login' || placement === 'sidebar'}
      />
    </span>
  )
}
