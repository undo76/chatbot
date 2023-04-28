import React, {
  ComponentClass,
  FunctionComponent,
  ReactComponentElement,
  ReactHTMLElement,
  ReactNode,
} from "react";
import { classNames } from "@/libs/class-names";

interface ActionButtonProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "danger" | "success";
  type?: "button" | "submit" | "reset";
  rounded?: boolean;
  icon?:
    | FunctionComponent<{ className?: any }>
    | ComponentClass<{ className?: any }>;
  disabled?: boolean;
  children?: React.ReactNode;
  props?: ReactHTMLElement<HTMLButtonElement>;
}

const ActionButton = React.forwardRef(function ActionButton(
  {
    size = "md",
    type = "button",
    rounded = false,
    color,
    icon,
    className,
    disabled = false,
    children,
    ...props
  }: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={classNames(
        "inline-flex justify-around items-center border border-gray-300 font-medium text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        size == "xs"
          ? "px-2.5 py-1.5 text-xs"
          : size == "sm"
          ? "px-4 py-2 text-xs"
          : size == "md"
          ? "px-4 py-2 text-sm"
          : size == "lg"
          ? "px-4 py-2 text-base"
          : size == "xl"
          ? "px-6 py-3 text-base"
          : "",
        color == "primary"
          ? "text-white border bg-indigo-800 bg-indigo-600 hover:bg-indigo-700"
          : color == "secondary"
          ? "text-white border bg-gray-600 bg-gray-600 hover:bg-gray-700"
          : color == "danger"
          ? "text-white border bg-red-800 bg-red-600 hover:bg-red-700"
          : color == "success"
          ? "text-white border bg-green-800 bg-green-600 hover:bg-green-700"
          : "bg-white hover:bg-gray-50",
        rounded ? "rounded rounded-full" : "rounded rounded-md",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="flex gap-2">
        {icon &&
          React.createElement(icon, {
            className: classNames(
              size === "xs" && "h-4 w-4",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-5 w-5",
              size === "lg" && "h-5 w-5",
              size === "xl" && "h-6 w-6",
              color === "primary" && "text-white"
            ),
          })}
        {children}
      </div>
    </button>
  );
});

export default ActionButton;
