import React, { useId } from "react";
import { classNames } from "@/libs/class-names";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name?: string;
  required?: boolean;
  error?: { message?: string };
  type?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, name = label, type = "text", error, ...props }, ref) {
    const uid = useId();
    return (
      <div
        className={classNames(
          "relative rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 bg-white",
          error &&
            "border-red-900 focus-within:ring-red-900 focus-within:border-red-900"
        )}
      >
        <label
          htmlFor={`${name}-${uid}`}
          className="absolute -top-2 left-2 -mt-px px-0.5 text-xs font-medium text-gray-900 rounded-full bg-gradient-to-t from-white via-white"
        >
          {label}
          {props.required && " *"}
        </label>
        <input
          ref={ref}
          name={name}
          id={`${name}-${uid}`}
          type={type}
          className={
            "block w-full border-0 p-0 text-gray-700 focus:ring-0 sm:text-sm placeholder-gray-400 leading-none"
          }
          {...props}
          aria-invalid={error ? "true" : "false"}
          {...(error && { "aria-describedby": `${name}-${uid}-error` })}
        />
        {error && (
          <div
            id={`${name}-${uid}-error`}
            className="text-xs text-red-900 text-right absolute -top-2 -mt-px right-2 px-0.5 font-medium text-gray-900 rounded-full bg-gradient-to-t from-white via-white"
          >
            {error.message || "Not valid"}
          </div>
        )}
      </div>
    );
  }
);
