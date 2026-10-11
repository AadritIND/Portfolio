import LegalLayout from "../components/LegalLayout";

/**
 * /privacy — the actual policy for this static site. Short, honest, no
 * dark patterns because there's nothing to be dark-patterned about.
 */
export default function PrivacyPage() {
  return (
    <LegalLayout
      docId="SYS-01"
      title="PRIVACY PROTOCOL."
      subtitle="What this site knows about you, what it stores, and what it phones home about. Spoiler: almost nothing, your browser, and one public API."
      updated="OCT 2026"
      otherPage={{ to: "/terms", label: "TERMS OF OPERATION" }}
      sections={[
        {
          id: "what-this-is",
          heading: "WHAT THIS SITE IS",
          body: (
            <>
              <p>
                This is a personal portfolio — a static, single-page application
                hosted on Vercel. There is no backend server of mine receiving
                your requests, no database, no accounts, and no analytics or
                tracking scripts of any kind.
              </p>
              <p>
                Everything you see runs in your browser. When you leave, nothing
                about your visit lingers anywhere I control.
              </p>
            </>
          ),
        },
        {
          id: "what-i-collect",
          heading: "WHAT I COLLECT (SHORT ANSWER: NOTHING)",
          body: (
            <>
              <p>
                I don't collect, log, or profile any personal data. No cookies
                are set by this site. No IP addresses, device fingerprints or
                visit histories reach me — I genuinely have nowhere for them to
                go.
              </p>
              <p>
                The contact form is not a form that submits anywhere: it opens
                your own email client with the message pre-filled via a{" "}
                <code className="font-mono-code text-xs bg-zinc-100 px-1.5 py-0.5 rounded">
                  mailto:
                </code>{" "}
                link. If you send that email, you're emailing me directly — the
                message travels through your email provider and mine, and I use
                it only to reply to you.
              </p>
            </>
          ),
        },
        {
          id: "local-storage",
          heading: "WHAT'S STORED IN YOUR BROWSER",
          body: (
            <>
              <p>
                A few small things live in your browser's localStorage so the
                site behaves between visits. None of it is ever transmitted
                anywhere, and clearing your browser data erases it instantly:
              </p>
              <ul className="list-none space-y-1.5 font-mono-code text-xs text-zinc-500">
                <li>
                  <span className="text-zinc-800">portfolio_loaded</span> — so
                  the boot preloader doesn't replay every visit
                </li>
                <li>
                  <span className="text-zinc-800">portfolio_skin_v2</span> — your
                  chosen accent color (the SKIN switcher)
                </li>
                <li>
                  <span className="text-zinc-800">github_telemetry_v1</span> — a
                  30-minute cache of the public GitHub stats shown on the home
                  page, so the API isn't hammered on every scroll
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "third-parties",
          heading: "THIRD-PARTY SERVICES INVOLVED",
          body: (
            <>
              <p>
                A portfolio can't exist in a vacuum; these services are involved
                and each handles data under its own policy:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>GitHub public API</strong> — the LIVE TELEMETRY
                  section requests public profile and repository data (repo
                  counts, stars, push dates). These are unauthenticated requests
                  made from your browser; GitHub sees your IP and applies its
                  own privacy policy and rate limits.
                </li>
                <li>
                  <strong>Vercel</strong> — hosts this site. Serving any website
                  involves standard edge/network logs on their infrastructure.
                </li>
                <li>
                  <strong>cdnfonts.com &amp; Google Fonts</strong> — deliver the
                  display and monospace fonts. Loading fonts is a standard
                  request to their CDNs.
                </li>
              </ul>
              <p>
                I don't embed ads, social pixels, or any analytics product.
              </p>
            </>
          ),
        },
        {
          id: "external-links",
          heading: "EXTERNAL LINKS",
          body: (
            <p>
              The site links out to GitHub repositories and live demos of my
              projects (conduit, filemorph, FormulaVault, printbridge,
              prompt-forge, etc.). Those are separate properties with their own
              terms and privacy practices — this policy covers only this
              portfolio.
            </p>
          ),
        },
        {
          id: "your-rights",
          heading: "YOUR DATA, YOUR CALLS",
          body: (
            <p>
              Since nothing about you is collected or stored by me, there's
              nothing for me to export, correct, or delete — the "right to be
              forgotten" here is just closing the tab. If you've emailed me and
              want that email gone from my inbox, say the word and it's deleted.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "CHANGES TO THIS POLICY",
          body: (
            <p>
              If the site ever gains features that change this story (a real
              backend, a newsletter, actual analytics), this page gets updated
              and the LAST UPDATED stamp moves — before the feature ships, not
              after. The current stamp is always at the top of this document.
            </p>
          ),
        },
      ]}
    />
  );
}
