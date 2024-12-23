import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "text-gray-600 hover:text-gray-800",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "py-2 px-6 rounded-lg transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyle = variantStyles[variant];

  return (
    <button
      className={`${baseStyles} ${variantStyle} ${className}`}
      {...props}
    />
  );
}
