import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '💰', title: 'Financial dashboard', text: 'See your income, expenses and what is actually left at a glance.' },
  { icon: '📊', title: 'Budget planner', text: 'Set limits per category and get warned before you overspend.' },
  { icon: '🧠', title: 'Money Confidence Score', text: 'A score for your habits and knowledge — never for your wealth.' },
  { icon: '📚', title: 'Learning hub', text: 'Short lessons on budgeting, credit, saving, investing and scams.' },
  { icon: '🧮', title: 'Calculators', text: 'Savings, emergency fund and debt repayment — worked out for you.' },
  { icon: '🤖', title: 'MoneyWise assistant', text: 'Ask a money question in plain language and get an educational breakdown.' },
]

const SA_CONTEXT = [
  'Taxi and transport fares',
  'Data and airtime bundles',
  'Prepaid electricity',
  'Money sent to family',
  'Stokvel contributions',
  'Funeral cover',
  'NSFAS allowances',
  'Social grants',
  'Gig and freelance income',
  'School fees',
]

const STEPS = [
  { n: '01', title: 'Enter your reality', text: 'Your income and what it costs to live each month.' },
  { n: '02', title: 'Get the picture', text: 'Where the money goes, what is left, and what needs attention.' },
  { n: '03', title: 'Build the habit', text: 'Goals, challenges and lessons that turn insight into confidence.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm font-black text-gold-300">
              R
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              MoneyWise <span className="text-brand-600">SA</span>
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/app/learn" className="hidden px-3 text-sm font-semibold text-slate-500 hover:text-slate-800 sm:block">
              Financial tips
            </Link>
            <Link to="/app" className="mw-btn-primary py-2 text-xs sm:text-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#d9f3e5_0%,transparent_45%),radial-gradient(circle_at_85%_0%,#fdf3d7_0%,transparent_40%)]" />
          <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              🇿🇦 Built for South Africans
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Understand your money.{' '}
              <span className="text-brand-600">Build confidence.</span> Reach your goals.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Take control of your financial journey with simple budgeting tools, financial education and
              personalised money insights — built around how young South Africans actually earn and spend.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/app" className="mw-btn-primary px-6 py-3">
                Get started →
              </Link>
              <Link to="/app/learn" className="mw-btn-secondary px-6 py-3">
                Explore financial tips
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div className="mw-card p-3 text-center">
                <p className="text-xl font-black text-brand-600">R8,000</p>
                <p className="text-[11px] text-slate-500">sample salary</p>
              </div>
              <div className="mw-card p-3 text-center">
                <p className="text-xl font-black text-brand-600">7 tools</p>
                <p className="text-[11px] text-slate-500">in one app</p>
              </div>
              <div className="mw-card p-3 text-center">
                <p className="text-xl font-black text-gold-600">1 goal</p>
                <p className="text-[11px] text-slate-500">money confidence</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">The problem</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Access is not the same as confidence.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Many people can reach banking and credit, yet still feel unsure about everyday money decisions:
              <em className="not-italic font-semibold text-slate-800"> “Can I afford this?”</em>,
              <em className="not-italic font-semibold text-slate-800"> “Why does my money disappear so quickly?”</em> and
              <em className="not-italic font-semibold text-slate-800"> “How do I start an emergency fund?”</em> Existing
              apps show transactions and balances. MoneyWise SA helps you understand them and act on them.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className="mw-card">
                  <p className="text-xs font-black text-gold-500">{step.n}</p>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">What is inside</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Everything you need to make better money decisions
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="mw-card transition hover:border-brand-200 hover:shadow-md">
                <div className="text-2xl">{feature.icon}</div>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-300">South African context</p>
            <h2 className="mt-2 max-w-xl text-2xl font-black tracking-tight sm:text-3xl">
              Designed around real life here — not a generic template
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {SA_CONTEXT.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-brand-100"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-brand-200">
              Income from salaries, gig work, NSFAS allowances, social grants or informal business — and expenses from
              rent to taxi fares, data, electricity and family support — are first-class in MoneyWise SA.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Social impact</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                A digital financial-confidence platform
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                MoneyWise SA helps South Africans understand their finances, develop healthier money habits and make
                more informed decisions — one decision at a time. It is financial education and budgeting support, not
                regulated personalised financial advice.
              </p>
            </div>
            <div className="mw-card bg-gold-100/60 border-gold-200">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-700">Try it now</p>
              <h3 className="mt-2 text-lg font-black text-slate-900">See your Money Confidence Score</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                The sample profile is already loaded with a realistic first-salary budget.
              </p>
              <Link to="/app/insights" className="mw-btn-gold mt-3">
                Open my insights
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-xs leading-relaxed text-slate-500">
          <p className="font-bold text-slate-700">MoneyWise SA — Building financial confidence, one decision at a time.</p>
          <p className="mt-2">
            Educational tool only. Nothing in this app is personalised financial, investment, credit or tax advice.
            Data is stored on your device until you connect the MoneyWise API.
          </p>
        </div>
      </footer>
    </div>
  )
}
