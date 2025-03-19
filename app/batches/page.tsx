// "use client";

// import React from "react";
// import BatchList from "../../components/batches/BatchList";

// export default function BatchesPage() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <BatchList />
//     </div>
//   );
// }


"use client";

import React from "react";
import BatchList from "../../components/batches/BatchList";

export default function BatchesPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-950 min-h-screen">
      <BatchList />
    </div>
  );
}