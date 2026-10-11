import LegalLayout from "../components/LegalLayout";

/**
 * /terms — plain-language terms of operation for the portfolio site.
 * Real substance, written like a human, still covers the bases.
 */
export default function TermsPage() {
  return (
    <LegalLayout
      docId="SYS-02"
      title="TERMS OF OPERATION."
      subtitle="The deal between you and this website. Browsing it means you accept these terms. It's a short document because the site is a portfolio, not a bank."
      updated="OCT 2026"
      otherPage={{ to: "/privacy", label: "PRIVACY PROTOCOL" }}
      sections={[
        {
          id: "acceptance",
          heading: "ACCEPTANCE",
          body: (
            <p>
              By accessing or using this site (aadrit's portfolio, including all
              pages under it), you agree to these terms. If you don't agree,
              the exit is the same button you came in through — close the tab,
              no hard feelings.
            </p>
          ),
        },
        {
          id: "the-service",
          heading: "WHAT THIS SERVICE IS (AND ISN'T)",
          body: (
            <>
              <p>
                This site is a personal portfolio: a showcase of projects, a
                way to contact the developer, and a place to host a few easter
                eggs. It is provided "as is" and "as available", with no
                guarantee of uptime, accuracy, or that any given easter egg
                still works after a refactor.
              </p>
              <p>
                It is not a storefront, a SaaS product, or professional advice.
                Nothing here is an offer of employment, a contract for services,
                or a promise that the coffee reserve percentage is scientifically
                measured.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          heading: "INTELLECTUAL PROPERTY",
          body: (
            <>
              <p>
                The design, text, and visual identity of this site are ©{" "}
                {new Date().getFullYear()} Aadrit. All rights reserved. Don't
                clone the site wholesale and claim it as yours; being inspired
                is fine, copy-paste identity theft isn't.
              </p>
              <p>
                The linked project repositories (conduit, filemorph,
                FormulaVault, printbridge, prompt-forge and others on
                github.com/AadritIND) are separate works under their respective
                licenses — check each repository for what you may do with its
                code.
              </p>
              <p>
                Any quoted material (such as the Robert C. Martin quote in the
                about section) belongs to its original author.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          heading: "ACCEPTABLE USE",
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Don't attack, overload, or probe the site with hostile traffic.</li>
              <li>
                Don't hammer the GitHub API endpoints the telemetry section uses
                — it's the public API's rate limit, not mine, but still.
              </li>
              <li>Don't scrape the site to train models on my writing without asking.</li>
              <li>
                Don't impersonate me or use the contact address for spam,
                phishing, or anything you wouldn't want read out loud in court.
              </li>
            </ul>
          ),
        },
        {
          id: "third-party",
          heading: "THIRD-PARTY LINKS & SERVICES",
          body: (
            <p>
              Links to GitHub, live project demos, and embedded font CDNs point
              at services I don't operate. I'm not responsible for their
              content, availability, or practices. Live demos especially — they
              are experiments and may be down, updated, or completely
              re-imagined at any time.
            </p>
          ),
        },
        {
          id: "easter-eggs",
          heading: "EASTER EGGS & HIDDEN FEATURES",
          body: (
            <p>
              This site contains hidden interactions (the konami code works,
              for instance). They exist for fun, are entirely optional, are not
              part of any agreement, and may be added, changed, or silently
              removed without notice. Finding them earns you nothing except
              bragging rights — which, let's be honest, is the real currency.
            </p>
          ),
        },
        {
          id: "liability",
          heading: "LIMITATION OF LIABILITY",
          body: (
            <p>
              To the maximum extent permitted by law, I am not liable for any
              damages arising from your use of, or inability to use, this site
              or its linked projects — including lost data, lost profits, or
              that feeling when you realize you just spent 20 minutes in the
              terminal view of someone's portfolio.
            </p>
          ),
        },
        {
          id: "governing-law",
          heading: "GOVERNING LAW",
          body: (
            <p>
              These terms are governed by the applicable laws of India, without
              regard to conflict-of-law principles. Any dispute will first be
              attempted to be resolved with a friendly conversation over email.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "CHANGES TO THESE TERMS",
          body: (
            <p>
              I may update these terms as the site evolves. The LAST UPDATED
              stamp at the top of this document always shows the current
              version. Continued use after a change means you accept the new
              terms.
            </p>
          ),
        },
      ]}
    />
  );
}
