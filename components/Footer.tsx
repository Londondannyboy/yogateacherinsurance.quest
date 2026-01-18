import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Comparison Site Disclaimer */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <p className="text-blue-400 text-sm text-center">
            <span className="font-semibold">Comparison Site</span> — We are an independent comparison site helping you find suitable yoga teacher insurance. All prices shown are provisional indications only. We are not an insurance provider. Verify details and final pricing directly with insurance providers. Check providers are authorised by the <a href="https://www.fca.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Financial Conduct Authority (FCA)</a>.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          <div className="col-span-2">
            <h3 className="text-white font-bold mb-4">Yoga Teacher Insurance UK</h3>
            <p className="text-slate-400 text-sm mb-4">
              Compare <strong>yoga teacher insurance</strong> quotes from specialist UK providers.
              Get professional indemnity & public liability cover for yoga instructors.
            </p>
            <p className="text-slate-500 text-xs">
              Helping UK yoga teachers find affordable insurance since 2024.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Insurance Types</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/yoga-instructor-insurance-uk" className="hover:text-white transition-colors">Yoga Instructor Insurance</Link></li>
              <li><Link href="/yoga-teacher-liability-insurance" className="hover:text-white transition-colors">Liability Insurance</Link></li>
              <li><Link href="/public-liability-insurance-yoga-teachers" className="hover:text-white transition-colors">Public Liability</Link></li>
              <li><Link href="/yoga-studio-insurance" className="hover:text-white transition-colors">Studio Insurance</Link></li>
              <li><Link href="/trainee-yoga-teacher-insurance" className="hover:text-white transition-colors">Trainee Insurance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Yoga Styles</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/hot-yoga-insurance" className="hover:text-white transition-colors">Hot Yoga Insurance</Link></li>
              <li><Link href="/aerial-yoga-insurance" className="hover:text-white transition-colors">Aerial Yoga Insurance</Link></li>
              <li><Link href="/meditation-teacher-insurance" className="hover:text-white transition-colors">Meditation Teacher</Link></li>
              <li><Link href="/pilates-instructor-insurance" className="hover:text-white transition-colors">Pilates Insurance</Link></li>
              <li><Link href="/fitness-instructor-insurance-uk" className="hover:text-white transition-colors">Fitness Instructor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Guides</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/how-much-yoga-teacher-insurance-cost" className="hover:text-white transition-colors">Insurance Costs</Link></li>
              <li><Link href="/compare-yoga-teacher-insurance-uk" className="hover:text-white transition-colors">Compare Providers</Link></li>
              <li><Link href="/best-yoga-teacher-insurance-uk" className="hover:text-white transition-colors">Best Insurance UK</Link></li>
              <li><Link href="/do-you-need-yoga-teacher-insurance" className="hover:text-white transition-colors">Do You Need Insurance?</Link></li>
              <li><Link href="/yoga-alliance-insurance-uk" className="hover:text-white transition-colors">Yoga Alliance Insurance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/articles" className="hover:text-white transition-colors">All Articles</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs">External Resources:</p>
              <ul className="space-y-1 text-xs text-slate-500 mt-2">
                <li><a href="https://www.gov.uk/business-insurance" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">Gov.uk Business Insurance</a></li>
                <li><a href="https://www.hse.gov.uk/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">Health & Safety Executive</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Yoga Teacher Insurance UK. All rights reserved.</p>
          <p className="mt-2 text-xs max-w-3xl mx-auto">
            We are a comparison website helping UK yoga teachers, yoga instructors, and fitness professionals find suitable insurance coverage.
            All prices shown are provisional indications only. Always verify final pricing and policy details directly with insurance providers.
          </p>
        </div>
      </div>
    </footer>
  )
}
