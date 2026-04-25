import { Mark, mergeAttributes } from "@tiptap/core";

export interface VariableSpanAttrs {
  varId: string | null;
  placeholderKey: string | null;
  originalValue: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    variableSpan: {
      setVariableSpan: (attrs: VariableSpanAttrs) => ReturnType;
      unsetVariableSpan: () => ReturnType;
    };
  }
}

export const VariableSpan = Mark.create({
  name: "variableSpan",
  inclusive: false,
  spanning: false,
  excludes: "_",
  keepOnSplit: false,

  addAttributes() {
    return {
      varId: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-var-id"),
        renderHTML: (attrs) => (attrs.varId ? { "data-var-id": attrs.varId } : {})
      },
      placeholderKey: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-placeholder-key"),
        renderHTML: (attrs) => (attrs.placeholderKey ? { "data-placeholder-key": attrs.placeholderKey } : {})
      },
      originalValue: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-original-value"),
        renderHTML: (attrs) => (attrs.originalValue ? { "data-original-value": attrs.originalValue } : {})
      }
    };
  },

  parseHTML() {
    return [{ tag: "span[data-var-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "var-span" }), 0];
  },

  addCommands() {
    return {
      setVariableSpan:
        (attrs: VariableSpanAttrs) =>
        ({ commands }) =>
          commands.setMark(this.name, attrs),
      unsetVariableSpan:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name)
    };
  }
});
