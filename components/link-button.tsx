import React from "react";
import { classNames } from "@/libs/class-names";

function LinkButton({
  size = "md",
  icon,
  underline = false,
  className,
  children,
  ...props
}: {
  size?: string;
  className?: string;
  icon?: React.FunctionComponent<any> | React.ComponentClass<any>;
  underline?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "cursor-pointer",
        size === "xs" && "text-xs",
        size === "sm" && "text-sm",
        size === "md" && "text-md",
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        underline && "underline",
        className
      )}
      {...props}
    >
      <div className="flex gap-0.5 items-center">
        {icon &&
          React.createElement(icon, {
            className: classNames(
              size === "xs" && "h-4 w-4",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-5 w-5",
              size === "lg" && "h-5 w-5",
              size === "xl" && "h-6 w-6"
            ),
          })}
        {children}
      </div>
    </button>
  );
}

export default LinkButton;
