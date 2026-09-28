import RichTextEditor from '../../../shared/components/RichTextEditor.jsx'

const LETTER_BUTTONS = [
  ['undo', 'redo'],
  ['formatBlock', 'fontSize'],
  ['bold', 'underline', 'italic', 'strike'],
  ['align', 'list', 'lineHeight'],
  ['link'],
  ['removeFormat', 'fullScreen'],
]

export default function CartaEditor(props) {
  return (
    <RichTextEditor
      {...props}
      buttonList={LETTER_BUTTONS}
      minHeight="360px"
      placeholder="Escribe aquí el contenido completo de la carta..."
    />
  )
}

