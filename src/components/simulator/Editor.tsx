import { Textarea } from "@/components/ui/textarea";
import { useEditorStore } from "@/store/editorStore";
import { useRef } from "react";

export function Editor() {
  const code = useEditorStore((s) => s.code);
  const setCode = useEditorStore((s) => s.setCode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  // Sincronizar scroll entre textarea e numeração de linhas
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Auto-indent e melhorias de digitação
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      
      // Reposicionar cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex h-full bg-gray-50 border rounded-sm overflow-hidden shadow">
      {/* Numeração de linhas */}
      <div 
        ref={lineNumbersRef}
        className="bg-muted border-r px-3 py-2 w-10 text-sm text-gray-600 select-none overflow-hidden"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="text-right leading-5">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Editor de código */}
      <div className="flex-1 relative bg-white overflow-auto">
        <Textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          wrap="off"
          spellCheck={false}
          placeholder="# Digite seu código assembly aqui...
# Exemplo:
# LW R1, 0(R2)
# ADD R3, R1, R4
# SW R3, 4(R2)"
          className="font-mono resize-none rounded-none appearance-none border-none bg-transparent h-full text-sm text-gray-800 px-4 py-2"
        />
      </div>
    </div>
  );
}