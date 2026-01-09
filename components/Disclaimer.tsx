export function Disclaimer() {
  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto py-3 px-4">
        <div className="flex items-start gap-3 text-sm">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-200">
            <span className="font-semibold text-white">Comparison Site - Not an Insurer:</span>{' '}
            This website provides information to help you compare yoga teacher insurance options.
            We are not an insurance provider or broker. All coverage details, pricing, and terms should be verified directly with insurance providers before purchasing.
            For specific insurance advice, consult a qualified insurance professional or visit the{' '}
            <a
              href="https://www.fca.org.uk/consumers/insurance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 underline"
            >
              FCA Insurance Guidance
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
