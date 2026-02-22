import { Link } from '@tanstack/react-router'

import { UserMenu } from './UserMenu'

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-gray-800 p-4 text-white shadow-lg">
      <div className="flex items-center">
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/">
            <img src="/tanstack-word-logo-white.svg" alt="TanStack Logo" className="h-10" />
          </Link>
        </h1>
      </div>

      <UserMenu />
    </header>
  )
}
