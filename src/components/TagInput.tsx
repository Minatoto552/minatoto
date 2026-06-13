import { Plus, X } from "lucide-react";
import { useState } from "react";

export function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [value, setValue] = useState("");

  const addTag = () => {
    const tag = value.trim();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
            {tag}
            <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => onChange(tags.filter((item) => item !== tag))} aria-label={`${tag}を削除`}>
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
          className="field-control"
          placeholder="タグを追加"
        />
        <button type="button" className="icon-button" onClick={addTag} aria-label="タグを追加">
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
