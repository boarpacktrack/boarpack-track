import './globals.css'

export const metadata = {
  title: 'BoarPack Track',
  description: 'Built by coaches. For coaches.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
