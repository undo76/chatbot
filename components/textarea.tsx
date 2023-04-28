import React, { useId } from "react";
import { classNames } from "@/libs/class-names";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name?: string;
  error?: { message?: string };
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, name = label, error, ...props }, ref) {
    const uid = useId();
    return (
      <div>
        {/*<label*/}
        {/*  htmlFor="comment"*/}
        {/*  className="block text-sm font-medium leading-6 text-gray-900"*/}
        {/*>*/}
        {/*  {label}*/}
        {/*</label>*/}
        <div className="mt-2">
          <textarea
            ref={ref}
            rows={4}
            name={name}
            id={`${name}-${uid}`}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            {...props}
          />
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error.message || "Not valid"}
          </div>
        )}
      </div>
    );
  }
);
