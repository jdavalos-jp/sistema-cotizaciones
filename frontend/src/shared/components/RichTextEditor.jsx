import React from 'react';
import SunEditorModule from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

// Compatibilidad para Vite/ESM
const SunEditor = SunEditorModule.default || SunEditorModule;

const styleId = 'suneditor-responsive-style'

function ensureResponsiveStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(styleId)) return
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .sun-editor .se-toolbar {
      flex-wrap: wrap !important;
      gap: 2px !important;
    }
    .sun-editor .se-toolbar .se-btn-group {
      flex-wrap: wrap !important;
    }
    @media (max-width: 480px) {
      .sun-editor .se-toolbar .se-btn {
        width: 28px !important;
        height: 28px !important;
        font-size: 12px !important;
      }
    }
  `
  document.head.appendChild(style)
}

const defaultButtonList = [
  ['undo', 'redo'],
  ['formatBlock', 'font', 'fontSize'],
  ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
  ['fontColor', 'hiliteColor'],
  ['align', 'list', 'lineHeight'],
  ['link', 'image', 'video'],
  ['fullScreen', 'showBlocks', 'codeView'],
  ['preview', 'print'],
  ['removeFormat'],
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  buttonList = defaultButtonList,
  minHeight = '200px',
}) {
  ensureResponsiveStyles()

  const handleChange = (content) => {
    const textLength = content.replace(/<[^>]*>/g, '').trim().length
    if (maxLength && textLength > maxLength) return
    onChange?.(content)
  };

  return (
    <div className="suneditor-container">
      <SunEditor
        setContents={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        setOptions={{
          buttonList,
          defaultTag: 'p',
          minHeight,
          showPathLabel: false,
          resizingBar: false,
        }}
      />
    </div>
  );
}
