'use client';

const items = [
  'Bureau of Labor Statistics',
  'O*NET',
  'U.S. Census Bureau',
  'Real-Time Job Market Data',
  '50,000+ Employers',
  'BLS Wage Data',
  'Regional Demographics',
];

export function Marquee() {
  return (
    <div className="marquee-wrapper py-6">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-sm font-medium text-gray-400 tracking-wide"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
