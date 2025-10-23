export const Card = ({ children, className = '', glow = null }) => {
  const glowClasses = {
    hot: 'glow-hot',
    warm: 'glow-warm',
    cold: 'glow-cold'
  };

  return (
    <div className={`glass-card rounded-2xl p-6 ${glow ? glowClasses[glow] : ''} ${className}`}>
      {children}
    </div>
  );
};

