import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/store/editorStore";

export function Editor() {
  const code = useEditorStore((s) => s.code);
  const setCode = useEditorStore((s) => s.setCode);

  return (
    <Textarea
      value={code}
      onChange={(e) => setCode(e.target.value)}
      className="font-mono resize-none rounded-sm bg-white h-full"
    />
  );
}