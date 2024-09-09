import Link from 'next/link'
import { LockIcon } from 'lucide-react'

export default function NotLoginLink() {
  return (
    <div className="not-login">
      <div className="not-login__card">
        <div className="not-login__title">
          <LockIcon className="not-login__icon" />
          <span >이용불가</span>
        </div>
        <span className="not-login__description">
          로그인이 필요한 서비스 입니다.
        </span>
        <Link href="/login" className="not-login__button">
          로그인
        </Link>
      </div>
    </div>
  )
}