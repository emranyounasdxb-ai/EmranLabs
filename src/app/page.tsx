import { MacDesktop } from "@/components/workspace/mac-desktop";
import { DesktopEntry } from "@/components/workspace/desktop-entry";

export default function Home() {
  return (
    <DesktopEntry>
      <MacDesktop />
    </DesktopEntry>
  );
}
