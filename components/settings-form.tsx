import { useSettings } from "@/components/settings";
import { Input } from "@/components/input";
import { Toggle } from "@/components/toggle";

export default function SettingsForm() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="OpenAI API key"
        type="password"
        value={settings.openAiKey}
        onChange={(e) => updateSettings({ openAiKey: e.target.value })}
      />
      <Toggle
        enabled={settings.showPrompt}
        setEnabled={(value) => updateSettings({ showPrompt: value })}
      >
        Show System Prompt
      </Toggle>
    </div>
  );
}
