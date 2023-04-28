import React, { useId } from "react";
import { classNames } from "@/libs/class-names";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name?: string;
  error?: { message?: string };
  type?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Input({ label, name = label, type = "text", error, ...props }, ref) {
    const uid = useId();
    return (
      <div className="relative w-full bg-white">
        <label
          htmlFor={`${name}-${uid}`}
          className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-900 rounded  bg-white"
        >
          {label}
        </label>

        <select
          ref={ref}
          id={`${name}-${uid}`}
          name={name}
          className={classNames(
            "block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-700 ring-1 ring-inset  focus:ring-2 focus:ring-indigo-600 text-xs leading-6",
            error
              ? "ring-red-900 focus-within:ring-red-900 focus-within:border-red-900"
              : "ring-gray-300"
          )}
          value={props.value}
          {...props}
        >
          {props.children}
        </select>

        {error && (
          <div
            id={`${name}-${uid}-error`}
            className="text-xs text-red-900 text-right absolute -top-2 right-2 inline-block bg-white px-1 font-medium text-gray-900 rounded bg-white"
          >
            {error.message || "Not valid"}
          </div>
        )}
      </div>
    );
  }
);
