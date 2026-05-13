import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import type { GoogleUser } from '../lib/auth'
import { useAuth } from '../lib/auth'

type Props = {
  onClose: () => void
}

type GoogleJwtPayload = {
  sub: string
  email: string
  name: string
  picture: string
}

export function GoogleLoginModal({ onClose }: Props) {
  const { login } = useAuth()

  function handleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return
    const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential)
    const user: GoogleUser = {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    }
    login(user)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                fill="#e0e7ff"
              />
              <path d="M12 13a3 3 0 100-6 3 3 0 000 6z" fill="#6366f1" />
              <path
                d="M5.5 19.5a7.5 7.5 0 0113 0"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Sign in to publish</h2>
          <p className="mt-2 text-sm text-slate-500">
            Connect your Google account to create and manage your live resume website.
          </p>
          <div className="mt-6 w-full">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.error('Google login failed')}
              useOneTap={false}
              shape="pill"
              size="large"
              width="280"
              text="signin_with"
              theme="outline"
            />
          </div>
          <p className="mt-4 text-xs text-slate-400">
            We only use your name and photo. No data is stored on any server.
          </p>
        </div>
      </div>
    </div>
  )
}
