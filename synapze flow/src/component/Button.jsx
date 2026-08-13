export default function Button({ onClick, children, className = '' }) {
    const combinedClasses = `btn ${className}`.trim();
  return (
    <button
      onClick={onClick}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}