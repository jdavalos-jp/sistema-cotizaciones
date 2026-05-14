import React from 'react';
import SunEditorModule from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

// Compatibilidad para Vite/ESM
const SunEditor = SunEditorModule.default || SunEditorModule;

export default function RichTextEditor({ value, onChange, placeholder, maxLength }) {
  // Manejador del cambio para integrarse con Ant Design Form.Item
  const handleChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div className="suneditor-container">
      <SunEditor
        setContents={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        setOptions={{
          buttonList: [
            ['undo', 'redo'],
            ['formatBlock', 'font', 'fontSize'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor'],
            ['align', 'list', 'lineHeight'],
            ['link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print'],
            ['removeFormat']
          ],
          defaultTag: 'p',
          minHeight: '200px',
          showPathLabel: false,
          resizingBar: false,
        }}
      />
    </div>
  );
}
