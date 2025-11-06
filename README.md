# No Nasties - E-commerce Website Clone

A Next.js clone of the No Nasties sustainable fashion e-commerce website.

## Features

- 🎨 Modern, responsive design built with Next.js 16 and Tailwind CSS
- 🛍️ Product listings for "Her" and "Him" collections
- 🌱 Sustainability-focused content and messaging
- 📱 Mobile-responsive navigation
- ⚡ Fast, SEO-friendly pages with TypeScript
- 🎯 Full e-commerce structure (products, collections, cart)

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build

Build the production version:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── her/               # Her collection page
│   ├── him/               # Him collection page
│   ├── collections/       # Collections listing
│   ├── sustainability/    # Sustainability page
│   ├── login/             # Login page
│   ├── cart/              # Shopping cart
│   └── about/             # About page
├── components/
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Footer
│   └── home/              # Homepage components
│       ├── Hero.tsx
│       ├── ForHer.tsx
│       ├── ForHim.tsx
│       ├── ImpactStats.tsx
│       ├── Azulejo.tsx
│       ├── Testimonials.tsx
│       └── Features.tsx
└── public/                # Static assets
```

## Pages

- **Homepage** (`/`) - Hero, new arrivals, sustainability stats, collections
- **Shop for Her** (`/her`) - Women's clothing collection
- **Shop for Him** (`/him`) - Men's clothing collection
- **Collections** (`/collections`) - Browse themed collections
- **Sustainability** (`/sustainability`) - Environmental impact and practices
- **Login** (`/login`) - User authentication
- **Cart** (`/cart`) - Shopping cart

## Features to Implement

- [ ] Product detail pages
- [ ] User authentication system
- [ ] Payment integration
- [ ] Search functionality
- [ ] Product filtering and sorting
- [ ] Checkout process
- [ ] Order tracking
- [ ] User dashboard

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License

This project is created for educational purposes.
