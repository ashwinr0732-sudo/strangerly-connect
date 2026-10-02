import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";
import { LEGAL_EFFECTIVE_DATE, TERMS_VERSION } from "@/lib/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Slypp" },
      {
        name: "description",
        content: "The Terms & Conditions for using Slypp, an 18+ anonymous stranger-chat web app.",
      },
      { property: "og:title", content: "Terms & Conditions — Slypp" },
      {
        property: "og:description",
        content: "Rules, responsibilities and limitations for using Slypp.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS: LegalSection[] = [
  {
    title: "About Slypp",
    body: [
      "Slypp is an 18+ anonymous stranger-chat web application that randomly connects adults for one-to-one text conversations, optionally based on shared interests.",
      "By signing in to or using Slypp you agree to these Terms & Conditions. If you do not agree, do not use Slypp.",
    ],
  },
  {
    title: "Age requirement (18+ only)",
    body: [
      "You must be at least 18 years old to use Slypp.",
      "Users under 18 are not permitted, even with parental or guardian permission.",
      "By confirming your age you state that you are 18 or older. Accounts we reasonably believe belong to minors will be terminated.",
    ],
  },
  {
    title: "Nature of the service and your risk",
    body: [
      "Slypp connects you with strangers. You may encounter adult, sexual, offensive, disturbing, or unexpected conversations or content.",
      "You interact with other users at your own risk and are responsible for your own actions, decisions, and what you choose to share.",
      "Slypp cannot verify or guarantee the identity, intentions, behaviour, safety, or legality of any other user.",
      "Never share information that could identify you or put you at risk, and leave any conversation that makes you uncomfortable.",
    ],
  },
  {
    title: "Prohibited conduct",
    body: [
      "Any illegal activity is strictly prohibited.",
      "Any sexual content involving minors, or any attempt to contact, solicit, or exploit minors, is strictly prohibited and may be reported to the authorities.",
      "Harassment, threats, hate speech, exploitation, fraud, scams, grooming, trafficking, blackmail, extortion, impersonation, spam, and any other unlawful or abusive conduct are prohibited.",
      "You must not attempt to bypass security, rate limits, or access controls, or interfere with the service or other users.",
    ],
  },
  {
    title: "Account and anonymous identity",
    body: [
      "You sign in to Slypp with a Google account. Your account information may be used internally for authentication, security, abuse prevention, Premium ownership, consent records, and legal compliance.",
      "Your account identity is kept separate from your visible chat identity. Other chat users see an anonymous identity such as \"Anonymous Stranger\" — not your Google name, email, or profile picture.",
      "You are responsible for activity carried out through your account.",
    ],
  },
  {
    title: "Premium features",
    body: [
      "Premium features are optional. Core chat is available without Premium.",
      "Premium prices may include applicable taxes such as GST/VAT and other applicable charges.",
      "Payment providers may apply currency conversion or transaction fees.",
      "Premium is provided as part of an evolving web application; features may be added, changed, or removed over time.",
    ],
  },
  {
    title: "Service availability",
    body: [
      "Bugs, downtime, connection failures, browser problems, server or database problems, and third-party service failures can occur.",
      "Slypp will make reasonable efforts to maintain and restore the service but cannot guarantee uninterrupted or error-free operation.",
      "Matching is not guaranteed, and message delivery is not guaranteed to be uninterrupted.",
      "Slypp is not an emergency service. If you or someone else is in danger, contact your local emergency services.",
    ],
  },
  {
    title: "Restriction and termination",
    body: [
      "Slypp may restrict, suspend, or terminate access or accounts that violate these Terms, endanger others, or create legal risk.",
      "You may stop using Slypp at any time.",
    ],
  },
  {
    title: "Disclaimers and limitation of liability",
    body: [
      "To the maximum extent permitted by applicable law, Slypp is provided \"as is\" and \"as available\" without warranties of any kind.",
      "To the maximum extent permitted by applicable law, Slypp is not liable for the conduct or content of other users, or for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.",
      "Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.",
    ],
  },
  {
    title: "Changes to the service and these Terms",
    body: [
      "We may change, suspend, or discontinue any part of Slypp at any time.",
      "We may update these Terms. When we do, we will update the version and effective date, and may ask you to accept the updated Terms before continuing to use Slypp.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These Terms are governed by the laws of India, without regard to conflict-of-law rules. Disputes are subject to the courts of competent jurisdiction in India, except where mandatory local consumer law gives you other rights.",
    ],
  },
];

function TermsPage() {
  return (
    <LegalDoc
      title="Slypp Terms & Conditions"
      effective={`${LEGAL_EFFECTIVE_DATE} · Version ${TERMS_VERSION}`}
      intro="Please read these Terms & Conditions carefully before using Slypp."
      sections={SECTIONS}
    />
  );
}
