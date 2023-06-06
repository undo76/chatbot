import { Switch } from "@headlessui/react";
import { classNames } from "@/libs/class-names";
import React from "react";

export interface ToggleProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  children?: React.ReactNode;
}

export function Toggle({ enabled, setEnabled, children }: ToggleProps) {
  return (
    <Switch.Group as="div" className="flex items-center gap-3 justify-between">
      {children ? (
        <Switch.Label
          as="span"
          className="text-sm font-medium text-gray-500 cursor-pointer"
        >
          {children}
        </Switch.Label>
      ) : null}
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={classNames(
          enabled ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
    </Switch.Group>
  );
}
