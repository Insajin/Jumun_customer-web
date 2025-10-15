import { BottomTabBar } from '@/components/BottomTabBar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pb-16">
      {children}
      <BottomTabBar />
    </div>
  )
}
