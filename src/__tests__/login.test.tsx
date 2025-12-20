import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/auth/login/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock useAuth hook
jest.mock('@/lib/hooks/use-auth', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}))

// Mock sonner
jest.mock('sonner', () => ({
  toast: jest.fn(),
}))

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})