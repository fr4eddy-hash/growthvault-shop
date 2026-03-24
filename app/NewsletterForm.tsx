'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Replace with your Beehiiv subscribe URL
    const beehiivUrl = `https://your-pub.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`;
    window.open(beehiivUrl, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p style={{ color: 'var(--green)', fontWeight: 500 }}>
        ✓ Check your inbox to confirm your subscription.
      </p>
    );
  }

  return (
    <form className="email-form" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn btn--primary">Subscribe</button>
    </form>
  );
}
