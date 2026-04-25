# Plan: 13 — Live variable replacement

## Dependencies
- 08 (editor), 12 (case page hosts inputs)

## Files to add
- `lib/var-replacement.ts` — DOM-walk replace utility
- Update `components/editor/rich-editor.tsx` — expose `replaceVarText(varId, value, originalText)`
- `components/cases/variable-input.tsx` — controlled input

## Implementation steps
1. Decision: **manual edit inside a span overrides the input.** When user types in the input next, we **do** overwrite (simpler model). Document this in `case-top-panel.tsx` with a one-line note if needed; spec allows either.
2. `RichEditor.replaceVarText(varId, value, originalText)`:
   - Use TipTap transaction to walk the doc and update text inside marks of type `variableSpan` matching `varId`.
   - Implementation:
     ```ts
     editor.state.doc.descendants((node, pos) => {
       if (!node.isText) return;
       const mark = node.marks.find(m => m.type.name === 'variableSpan' && m.attrs.varId === varId);
       if (!mark) return;
       const newText = value.length === 0 ? (mark.attrs.originalValue || originalText) : value;
       if (node.text === newText) return;
       tr.replaceWith(pos, pos + node.nodeSize, editor.schema.text(newText, [mark]));
     });
     editor.view.dispatch(tr);
     ```
3. `VariableInput`:
   - Props: `{ variable, value, onChange }`.
   - `onChange(e)` → call `editor.replaceVarText(variable.id, e.target.value, variable.originalText)` then `onValueChange(e.target.value)`.
   - No debounce needed for typical doc sizes; profile if >500 spans.
4. On editor mount, ensure each existing span has `data-original-value` (set on creation in feature 09 from `originalText`); use it for revert.
5. Final HTML on save (feature 12) is `editor.getHTML()`, which by now contains replaced text inside the spans.

## Verification
- Type into input "Nguyễn Văn B" → all spans for that variable show "Nguyễn Văn B" instantly.
- Clear input → spans revert to `originalValue` ("Nguyễn Văn A").
- Save case + reload → editor renders with replaced values; inputs hydrate from DB values; spans match.
- Manual edit inside one span persists until user retypes the input (documented behavior).
