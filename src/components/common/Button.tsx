import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

const variantStyles = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400",
  secondary: "text-gray-600 hover:text-gray-800 disabled:text-gray-400",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400",
};

import { LoadingSpinner } from "./LoadingSpinner";

export function Button({
  variant = "primary",
  className = "",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "py-2 px-6 rounded-lg transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative";
  const variantStyle = variantStyles[variant];

  return (
    <button
      className={`${baseStyles} ${variantStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className={`flex items-center justify-center gap-2 ${isLoading ? 'invisible' : ''}`}>
        {children}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </button>
  );
}
