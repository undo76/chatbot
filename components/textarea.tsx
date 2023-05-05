import React, {
  ChangeEvent,
  FormEvent,
  FormEventHandler,
  useEffect,
  useId,
} from "react";

function autoGrow(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto"; // Reset height, so that it not only grows but also shrinks
  textarea.style.height = textarea.scrollHeight + "px";
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name?: string;
  error?: { message?: string };
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, name = label, error, ...props }, ref) {
    const uid = useId();

    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        autoGrow(ref.current as HTMLTextAreaElement);
      }
    });

    return (
      <div>
        {/*<label*/}
        {/*  htmlFor="comment"*/}
        {/*  className="block text-sm font-medium leading-6 text-gray-900"*/}
        {/*>*/}
        {/*  {label}*/}
        {/*</label>*/}
        <div className="">
          <textarea
            ref={ref}
            name={name}
            id={`${name}-${uid}`}
            className="block max-h-[600px] w-full resize-none rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            // onInput={(ev: FormEvent<HTMLTextAreaElement>) =>
            //   autoGrow(ev.target as HTMLTextAreaElement)
            // }
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
