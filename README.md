# ContentFlow

Production-ready AI content marketing SaaS built with **Next.js App Router, TypeScript, Tailwind CSS, Supabase, PostgreSQL, and Google Gemini**.

ContentFlow transforms a business topic, target audience, niche, and marketing objective into a structured weekly content campaign. It supports brand profiles, niche-specific generation, reusable content templates, AI quality validation, generation history, usage limits, and an administrative analytics dashboard.

## Features

- AI-powered content generation using Google Gemini
- Structured weekly content campaigns
- Instagram carousel generation
- Reel and TikTok scripts
- Pinterest content
- Platform-specific content planning
- Caption and hook generation
- CTA variations
- Engagement prompts
- Niche-specific marketing strategies
- Reusable brand profiles
- Content generation templates
- Generation history
- Markdown and TXT export
- Monthly usage limits
- Free and Pro plan architecture
- AI output validation and retry handling
- Separate admin dashboard
- User and generation analytics
- Supabase authentication and PostgreSQL persistence

## AI Generation

ContentFlow uses Google Gemini with structured JSON output and server-side validation.

The generation pipeline includes:

```text
User Input
    ↓
Authentication
    ↓
Usage Validation
    ↓
Brand Profile
    ↓
Content Template
    ↓
Niche Context
    ↓
Prompt Construction
    ↓
Google Gemini
    ↓
JSON Validation
    ↓
Quality Validation
    ↓
Database Storage
    ↓
Content Pack
```

The system supports retry handling and model fallback when generation fails.

Default Gemini models:

- `gemini-2.5-flash`
- `gemini-2.0-flash` as fallback

## Content Templates

ContentFlow currently provides four marketing-oriented generation templates:

- Authority Builder
- Engagement Engine
- Conversion Focus
- Launch Campaign

These templates influence the strategy, messaging, hooks, CTAs, and overall structure of the generated campaign.

## Supported Niches

Built-in niche-specific guidance currently includes:

- Real Estate
- Fitness / Gym
- Restaurants
- Coaches / Consultants / Mentors
- General businesses

Each niche can provide specialized vocabulary, emotional triggers, hook styles, CTA strategies, and content angles.

## Brand Profiles

Users can create reusable brand profiles containing:

- Brand name
- Business description
- Target audience
- Offer
- Tone of voice
- CTA style
- Platform focus
- Brand keywords
- Forbidden phrases
- Writing style
- Posting goals

Brand information is incorporated into the AI generation context to maintain consistency across content.

## Supported Platforms

ContentFlow supports content planning and generation for:

- Instagram
- TikTok
- LinkedIn
- Pinterest
- YouTube Shorts
- Facebook

## AI Quality Control

Generated content is validated before being stored.

The validation system checks for:

- Missing required content
- Incomplete workflows
- Extremely short output
- Placeholder content
- Generic unfinished text
- Forbidden brand phrases
- Invalid JSON structures

Failed generations can be retried automatically, and usage can be refunded when generation fails.

## Usage and Billing

ContentFlow includes a SaaS usage and billing architecture.

The default Free plan provides:

- 5 generations per month
- Core content generation
- Supported platform workflows

The Pro plan is designed for:

- Unlimited generations
- Premium output quality
- Priority processing
- Future premium integrations

The monthly free-generation limit can be configured through environment variables.

Payment processing requires a configured billing provider.

## Admin Dashboard

ContentFlow includes a separate administrative application for monitoring the platform.

The admin dashboard provides:

- Total users
- Total generations
- Free and Pro users
- Monthly generation statistics
- Weekly active users
- Generation trends
- Signup trends
- Plan distribution
- Recent users
- Recent generations

The admin application uses privileged server-side Supabase access and should never expose service-role credentials to the client.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | Application framework |
| React 19 | UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Authentication and database |
| PostgreSQL | Persistent data |
| Google Gemini | AI generation |
| Chart.js | Admin analytics |
| ESLint | Code quality |

## Project Structure

```text
AI-Content-Repurposer/
├── apps/
│   └── admin/
│       ├── src/
│       └── package.json
│
├── scripts/
│   ├── admin-env-sync.mjs
│   └── generate-admin-hash.mjs
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── login/
│   │
│   ├── components/
│   │   └── dashboard/
│   │
│   ├── lib/
│   │   ├── ai/
│   │   ├── billing/
│   │   ├── brand-profiles/
│   │   ├── content-pack/
│   │   ├── prompts/
│   │   ├── supabase/
│   │   └── usage/
│   │
│   └── types/
│
├── package.json
└── README.md
```

## Quick Start

Clone the repository and install dependencies:

```bash
git clone https://github.com/codebyrifaf/AI-Content-Repurposer.git
cd AI-Content-Repurposer
npm install
```

Start the main application:

```bash
npm run dev:web
```

The web application runs on:

```text
http://localhost:3000
```

To run the admin application:

```bash
npm run dev:admin
```

The admin application runs on:

```text
http://localhost:3001
```

To run both applications:

```bash
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
GEMINI_MODEL=

NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_FREE_MONTHLY_LIMIT=
```

The admin application also requires secure server-side configuration for administrator authentication and session management.

Never commit API keys, Supabase service-role keys, session secrets, or other credentials to the repository.

## Commands

### Development

```bash
npm run dev
npm run dev:web
npm run dev:admin
```

### Production Build

```bash
npm run build
npm run build:web
npm run build:admin
```

### Production Start

```bash
npm run start
npm run start:web
npm run start:admin
```

### Code Quality

```bash
npm run lint
```

## Authentication

Authentication is handled through Supabase Auth.

Protected dashboard routes and API endpoints require an authenticated user.

The application uses separate browser-side and server-side Supabase clients to handle authentication and database operations securely.

## Database

Supabase PostgreSQL is used for persistent application data, including:

- User profiles
- Brand profiles
- Generation history
- Usage tracking
- Subscription information
- Application analytics

## Current Scope

ContentFlow currently focuses on AI-assisted content planning and generation.

It generates platform-specific content and structured weekly campaigns but does not currently provide automatic publishing directly to social-media platforms.

The billing system provides the architecture for SaaS subscriptions but requires a configured payment provider for live transactions.

## Roadmap

Planned or potential future improvements include:

- Social-media scheduling
- Direct social-media publishing
- Canva integration
- Additional niche-specific strategies
- Advanced content analytics
- Additional AI models
- AI image generation
- Automated content calendars
- Team and workspace functionality
- Additional billing providers

## Author

**Rifaf Rahman**

GitHub: https://github.com/codebyrifaf
