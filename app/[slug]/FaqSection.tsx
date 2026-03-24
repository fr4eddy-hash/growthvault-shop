'use client';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqSection({ items }: { items: FaqItem[] }) {
  const toggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.classList.toggle('open');
  };

  return (
    <div className="faq-list reveal">
      {items.map((item, i) => (
        <div key={i} className="faq-item" onClick={toggle}>
          <div className="faq-q">
            <span>{item.q}</span>
            <span className="faq-icon">+</span>
          </div>
          <div className="faq-a">{item.a}</div>
        </div>
      ))}
    </div>
  );
}
