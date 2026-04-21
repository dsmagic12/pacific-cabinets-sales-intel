import { Upload, Wrench } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Upload className="w-6 h-6 text-amber" />
          Data Upload
        </h1>
        <p className="text-muted mt-1">Import Excel spreadsheets, order history, and document files</p>
      </div>
      <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
        <Wrench className="w-10 h-10 text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-navy mb-2">Coming in Phase 2</h2>
        <p className="text-muted text-sm max-w-sm mx-auto">
          Drag-and-drop Excel upload, document parsing, and ERP/CRM data import with preview and validation.
        </p>
      </div>
    </div>
  );
}
