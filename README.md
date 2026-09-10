# Strangerly Connect

Use the uploaded UI reference images as the visual design source for this project.

The application brand is strangerly. Do not call the application "Mice". Any mouse/ghost mascot shown in the references is only a visual mascot.

Build the application using:

React

TypeScript

Tailwind CSS

shadcn/ui

Lucide React icons

Do not connect Supabase yet. We are building the frontend and application structure first.

BRAND

Brand name:

strangerly

The visual identity should remain consistent across every page:

Very dark background

Black / deep navy surfaces

Purple/violet primary accent

Subtle gradients

Glass-like cards

Thin borders

Large rounded corners

Soft glow effects

Clean modern typography

Minimal but polished animations

Do not redesign the visual language from the uploaded references.

ROUTES

Create the following routes:

/
Landing page

/interests
Interest selection

/matching
Finding a stranger

/chat
Main anonymous chat

/premium
Premium upgrade

/payment
Premium checkout

/payment-success
Successful payment

/settings
User preferences

/about
About strangerly

/privacy
Privacy policy

/terms
Terms of service

APPLICATION STATE

Create a simple frontend state architecture that can later be replaced/connected to Supabase.

Create types for:

UserSession
ChatSession
Message
Interest
PremiumPlan

Message types must support:

"text"
"image"
"voice"

Message state should support:

"sent"
"delivered"
"viewed"

Image messages must also support:

isViewOnce
viewedAt
expiresAt

Do not implement fake backend matchmaking yet.

ANONYMOUS USER

The application must NOT have:

Login page

Signup page

Username registration

Profile creation

The eventual application will identify users using an anonymous session ID.

For now, create a temporary frontend session abstraction that can later be connected to Supabase anonymous authentication.

IMPORTANT PRODUCT RULES

Interests are FREE for every user.

Free users can:

Start anonymous chats

Select interests

Match based on interests

Send text messages

Next stranger

End chat

Premium users can additionally:

Send view-once images

Send voice messages

Priority matching

Region preference

Advanced matching

Ad-free experience

Do NOT make interest selection a premium feature.

PREMIUM LOCKING

Premium-only features should not simply disappear for free users.

Show the feature in the UI with a small lock indicator.

For example:

Image button:

📷 🔒

Voice button:

🎙️ 🔒

Clicking a locked premium feature should open the Premium upgrade UI.

Create a reusable:

PremiumFeatureLock

component.

RESPONSIVE DESIGN

The application must work on:

Desktop

Tablet

Mobile

The chat interface should be mobile-first.

On desktop the chat can have a sidebar.

On mobile:

Sidebar becomes a drawer

Chat occupies the entire viewport

Composer remains accessible at the bottom

COMPONENT STRUCTURE

Create reusable components:

components/
brand/
StrangerlyLogo

layout/
AppShell
Header
Sidebar
MobileNavigation

chat/
ChatHeader
MessageList
MessageBubble
MessageComposer
TypingIndicator
VoiceMessage
ViewOnceMessage
ViewOnceViewer

matching/
InterestSelector
MatchingAnimation
MatchStatus

premium/
PremiumModal
PremiumFeatureLock
PlanSelector

common/
PrimaryButton
GlassCard
StatusIndicator

Do not create unnecessary abstractions.

NAVIGATION

Landing:

Start Chatting
→ /interests

Interests:

Start Matching
→ /matching

Matching:

When a future backend match is available
→ /chat

For now provide a temporary development mechanism to enter /chat so we can test the interface.

Premium:

Upgrade button
→ /payment

Payment:

Successful mock payment
→ /payment-success

Payment success:

Start Chatting
→ /interests

IMPORTANT

Do not implement:

Supabase

Database

Real matchmaking

Real payment processing

WebRTC

Real voice upload

Real image upload

yet.

We will implement those separately.

First create a clean, maintainable frontend foundation matching the uploaded UI references exactly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/51b7797a-a526-4b0e-82ca-8d85c40ba5cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
