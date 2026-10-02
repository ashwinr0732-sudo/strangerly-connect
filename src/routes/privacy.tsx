import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";
import { LEGAL_EFFECTIVE_DATE, PRIVACY_VERSION } from "@/lib/legal";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Slypp" },
      {
        name: "description",
        content: "How Slypp processes account, consent, chat and security information.",
      },
      { property: "og:title", content: "Privacy Policy — Slypp" },
      {
        property: "og:description",
        content: "What information Slypp processes, why, and your choices.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS: LegalSection[] = [
  {
    title: "Account information from Google",
    body: [
      "Slypp uses Google Sign-In. When you sign in, we receive account information from Google needed to authenticate you, such as a unique account identifier and your email address, and basic profile details Google provides (such as name and profile picture).",
      "This information is used only internally. It is never shown to the people you chat with — they see \"Anonymous Stranger\".",
    ],
  },
  {
    title: "Account and security information",
    body: [
      "Our authentication provider keeps records needed to operate your sign-in session, such as account creation and sign-in times and session tokens.",
    ],
  },
  {
    title: "Consent records",
    body: [
      "When you sign in, we store against your account: confirmation that you are 18 or older, your acceptance of the Terms & Conditions, your acceptance of this Privacy Policy, the versions you accepted, and the time of acceptance.",
    ],
  },
  {
    title: "Chat and session information",
    body: [
      "To match you with others we temporarily store a matchmaking entry: your account identifier, matching mode, chosen interests, and status.",
      "For each chat we store the session (the two participating account identifiers, status, and start/end times).",
      "Text messages you send are stored with the session, your account identifier, and a timestamp so they can be delivered in real time to the other participant.",
    ],
  },
  {
    title: "Premium information",
    body: [
      "If Premium is offered, we may store whether your account holds a Premium entitlement. Payments are not currently processed by Slypp; if they are introduced, payment details would be handled by a payment provider and this policy will be updated.",
    ],
  },
  {
    title: "Security and abuse prevention",
    body: [
      "We use the timing of your messages and match requests to enforce rate limits and prevent spam and abuse.",
    ],
  },
  {
    title: "Browser storage",
    body: [
      "Slypp uses your browser's local storage to keep you signed in and to remember your interests and app preferences on your device. We do not use advertising or analytics cookies.",
    ],
  },
  {
    title: "Infrastructure providers",
    body: [
      "Slypp is built on Lovable Cloud, which uses Supabase for authentication, database, and real-time messaging, and is hosted on Lovable's infrastructure.",
      "Google provides sign-in. These providers process data on our behalf to run the service.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To authenticate you, match you with other users, deliver messages, keep your Premium status and consent records, keep Slypp secure, prevent abuse, and comply with legal obligations.",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "How information is protected",
    body: [
      "Access to data is restricted by database access rules so that users can only read their own records and the chats they take part in. Connections to Slypp use HTTPS.",
      "No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Retention",
    body: [
      "Account and consent records are kept while your account exists and as long as needed for legal compliance.",
      "Matchmaking entries are removed when you leave matching or become inactive. Chat sessions and messages may be retained for safety, abuse investigation, and legal compliance, and may be deleted over time.",
    ],
  },
  {
    title: "Sharing and legal requests",
    body: [
      "We share information only with the infrastructure providers listed above, or where required by law, to respond to valid legal requests, to protect the safety of users or others, or to investigate violations of our Terms.",
      "Messages you send are, by nature, shared with the person you are chatting with.",
    ],
  },
  {
    title: "Account and data deletion",
    body: [
      "You can ask us to delete your account and associated data by contacting us. Some records may be retained where required by law or for legitimate safety reasons.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, delete, or restrict the use of your personal information, and to withdraw consent. Contact us to exercise these rights.",
    ],
  },
  {
    title: "Children",
    body: [
      "Slypp is for adults 18 and older only. We do not knowingly allow minors to use the service and will delete accounts we believe belong to minors.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "We may update this Privacy Policy. When we do, we will update the version and effective date and may ask you to accept the updated policy.",
    ],
  },
  {
    title: "Contact",
    body: ["For privacy questions or requests, contact us at privacy@slypp.app."],
  },
];

function PrivacyPage() {
  return (
    <LegalDoc
      title="Slypp Privacy Policy"
      effective={`${LEGAL_EFFECTIVE_DATE} · Version ${PRIVACY_VERSION}`}
      intro="This Privacy Policy explains what information Slypp processes when you use the service, and why."
      sections={SECTIONS}
    />
  );
}
