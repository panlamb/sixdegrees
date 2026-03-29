import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="max-w-[680px] mx-auto px-6 py-12">
        <div className="font-mono text-xs text-lime mb-8"><Link href="/">← SIX°</Link></div>
        <h1 className="font-serif text-3xl font-black mb-2">Terms of Service</h1>
        <p className="font-mono text-xs text-[#666] mb-12">Last updated: March 2026</p>

        {[
          {
            title: "1. The experiment",
            body: `Six° is a social experiment that lets you build verified chains of connections between people. By using Six°, you agree to participate in good faith — adding only people you genuinely believe are connections, and verifying only connections you can personally confirm.`
          },
          {
            title: "2. Your account",
            body: `You are responsible for maintaining the security of your account. You must provide accurate information when creating your account. You must be at least 16 years old to use Six°.`
          },
          {
            title: "3. Acceptable use",
            body: `You agree not to use Six° to harass, impersonate, or harm others. You agree not to add people as intermediaries without a genuine belief that they are a connection. You agree not to abuse the verification system by confirming connections you cannot personally verify.`
          },
          {
            title: "4. Intermediaries",
            body: `When you add someone as an intermediary, you are responsible for having a reasonable basis to believe they are a genuine connection. Six° is not responsible for the accuracy of connections claimed by users.`
          },
          {
            title: "5. Content",
            body: `You retain ownership of any content you submit to Six°. By submitting content, you grant Six° a limited license to store and display that content as part of the service.`
          },
          {
            title: "6. Termination",
            body: `We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your Profile page.`
          },
          {
            title: "7. Disclaimer",
            body: `Six° is provided as-is, without warranties of any kind. We are not responsible for the accuracy of connections or the outcomes of chains. The six degrees of separation theory is a social hypothesis — Six° does not guarantee any specific result.`
          },
          {
            title: "8. Contact",
            body: `For questions about these terms, contact us at hello@sixdegrees.app.`
          },
        ].map((section, i) => (
          <div key={i} className="mb-8">
            <h2 className="font-mono text-sm font-bold text-white mb-3">{section.title}</h2>
            <p className="font-mono text-sm text-[#888] leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
