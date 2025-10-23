export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'glass-button text-gold hover:shadow-gold',
    secondary: 'glass text-white hover:bg-white/10',
    danger: 'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

