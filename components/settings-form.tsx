import { useSettings } from "@/components/settings";
import { Input } from "@/components/input";

export default function SettingsForm() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2">
        <Input
          label="OpenAI API key"
          type="password"
          value={settings.openAiKey}
          onChange={(e) => updateSettings({ openAiKey: e.target.value })}
        />
      </div>
    </div>
  );
}
