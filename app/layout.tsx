import './globals.css'

export const metadata = {
  title: 'Приглашение на день рождения Селин',
  description: 'Особенный вечер в честь первого дня рождения',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}