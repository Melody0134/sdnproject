import { useState } from 'react';
import { cn } from '../../utils/cn';

const TagInput = ({ label, value = [], onChange, placeholder = 'Nhập rồi nhấn Enter', hint }) => {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (!value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag]);
    }
    setDraft('');
  };

  const removeTag = (index) => onChange(value.filter((_, i) => i !== index));

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    } else if (event.key === 'Backspace' && !draft && value.length) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div>
      {label && <label className="label-base">{label}</label>}
      <div
        className={cn(
          'flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5',
          'focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100'
        )}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
          >
            {tag}
            <button type="button" onClick={() => removeTag(index)} className="text-brand-400 hover:text-brand-700">
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length ? '' : placeholder}
          className="flex-1 border-none bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

export default TagInput;
