import { Calendar } from 'lucide-react'

const UpcomingPage = () => {
  return (
    <div className="min-h-screen bg-warm-charcoal-100 pt-32 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Calendar className="w-10 h-10 text-accent-500" />
          <h1 className="text-5xl font-bold text-cream-50">Upcoming Events</h1>
        </div>

        <p className="text-xl text-cream-100 mb-12">
          Film premieres, live comedy shows, dan acara spesial yang akan datang.
        </p>

        {/* Placeholder */}
        <div className="bg-warm-charcoal-50 rounded-2xl p-12 text-center border border-cream-50/10">
          <Calendar className="w-20 h-20 text-accent-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-cream-50 mb-4">
            Coming Soon
          </h2>
          <p className="text-cream-100">
            Event calendar akan hadir segera. Stay tuned! ☕🎬
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpcomingPage
