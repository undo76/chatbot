import React, {ReactNode} from "react";

export default function Panel({children}: {children: ReactNode}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6"> {children} </div>
    </div>
  )
}
