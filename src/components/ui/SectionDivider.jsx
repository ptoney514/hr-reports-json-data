import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * Section divider page — mimics Keynote section break slides.
 * Uses the Creighton blue background with church illustration
 * and overlays the section title in white serif text.
 */

const sectionTitles = {
  headcount: 'Headcount',
  demographics: 'Demographics',
  recruiting: 'Recruiting',
  turnover: 'Turnover',
  promotions: 'Promotions',
  'exit-survey': 'Exit Survey',
  other: 'Other',
};

const SectionDivider = () => {
  const { section } = useParams();
  const title = sectionTitles[section] || section;

  return (
    <div
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        height: 'calc(100vh - 64px)',
        backgroundColor: '#3563a8',
      }}
    >
      {/* Background image */}
      <img
        src="/images/section-divider-bg.png"
        alt=""
        role="presentation"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Title overlay */}
      <h1
        className="relative z-10 text-white text-center px-8"
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: 'clamp(3rem, 8vw, 6rem)',
          fontWeight: 400,
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </h1>
    </div>
  );
};

export default SectionDivider;
