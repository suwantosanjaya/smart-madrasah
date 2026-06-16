import SettingsClient from "./SettingsClient";
import { getSettings } from "@/app/actions/settings";

export default async function SettingsPage() {
  const { data: initialSettings } = await getSettings();

  return (
    <SettingsClient initialSettings={initialSettings || {}} />
  );
}