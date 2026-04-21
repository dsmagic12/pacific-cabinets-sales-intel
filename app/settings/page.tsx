import { Settings, Key, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ApiKeyStatus() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${hasKey ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      {hasKey ? (
        <>
          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">API key configured</p>
            <p className="text-xs text-green-600">Claude AI features are active</p>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">API key not configured</p>
            <p className="text-xs text-red-600">Add ANTHROPIC_API_KEY to your .env.local file</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber" />
          Settings
        </h1>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4 text-amber" />
              Anthropic API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ApiKeyStatus />
            <div className="text-sm text-muted space-y-2">
              <p>To configure the API key:</p>
              <ol className="list-decimal pl-4 space-y-1 text-xs">
                <li>Create a <code className="bg-cream px-1 rounded">.env.local</code> file in the project root</li>
                <li>Add: <code className="bg-cream px-1 rounded">ANTHROPIC_API_KEY=your_key_here</code></li>
                <li>Restart the dev server</li>
              </ol>
              <p className="text-xs">
                Get your API key from{" "}
                <span className="text-amber font-medium">console.anthropic.com</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
