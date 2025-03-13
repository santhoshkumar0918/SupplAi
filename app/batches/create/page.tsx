"use client";

import React from "react";
import CreateBatchForm from "@/components/batches/CreateBatchForm";

export default function CreateBatchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Batch</h1>
      <CreateBatchForm />
    </div>
  );
}
