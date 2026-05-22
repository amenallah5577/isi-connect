# Security Policy

ISI Connect is currently a frontend-first static application. It is safe to publish as a portfolio/demo interface, but real production use needs a backend before handling student accounts or private data.

## Public Demo Rules

- Demo admin access is disabled by default.
- Do not deploy with `VITE_ENABLE_DEMO_ADMIN=true`.
- Do not collect real student card images in the static demo.
- Do not use the frontend-only account system for real authentication.

## Required Before Real Campus Use

- Server-side authentication with hashed passwords.
- Server-side role checks for admin and moderator actions.
- Private file storage for student cards and uploaded resources.
- Database-backed account approval, post moderation, chat, points, and notifications.
- Rate limiting and abuse reporting.
- A privacy policy explaining what student data is stored and who can see it.
