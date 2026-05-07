import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from 'lexical'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { Button, Space, Divider, theme } from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import './RichTextEditor.css'

/**
 * Toolbar
 */
function Toolbar() {
  const [editor] = useLexicalComposerContext()
  const { token } = theme.useToken()

  const handleBold = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  const handleItalic = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  const handleUnderline = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  const handleStrike = () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
  const handleUndo = () => editor.dispatchCommand(UNDO_COMMAND)
  const handleRedo = () => editor.dispatchCommand(REDO_COMMAND)
  const handleUnorderedList = () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
  const handleOrderedList = () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
  const handleClear = () => {
    editor.update(() => {
      const root = $getRoot()
      root.clear()
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 12px',
        borderBottom: `1px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgContainer,
        flexWrap: 'wrap',
      }}
    >
      <Space size={2}>
        <Button orientation="text" icon={<UndoOutlined />} onClick={handleUndo} size="small" />
        <Button orientation="text" icon={<RedoOutlined />} onClick={handleRedo} size="small" />
      </Space>

      <Divider orientation="vertical" style={{ margin: 0 }} />

      <Space size={2}>
        <Button orientation="text" icon={<BoldOutlined />} onClick={handleBold} size="small" />
        <Button orientation="text" icon={<ItalicOutlined />} onClick={handleItalic} size="small" />
        <Button orientation="text" icon={<UnderlineOutlined />} onClick={handleUnderline} size="small" />
        <Button orientation="text" icon={<StrikethroughOutlined />} onClick={handleStrike} size="small" />
      </Space>

      <Divider orientation="vertical" style={{ margin: 0 }} />

      <Space size={2}>
        <Button
          orientation="text"
          icon={<UnorderedListOutlined />}
          onClick={handleUnorderedList}
          size="small"
        />
        <Button
          orientation="text"
          icon={<OrderedListOutlined />}
          onClick={handleOrderedList}
          size="small"
        />
      </Space>

      <Divider orientation="vertical" style={{ margin: 0 }} />

      <Button orientation="text" icon={<DeleteOutlined />} onClick={handleClear} danger size="small" />
    </div>
  )
}

/**
 * Editor content
 */
function EditorContent({ value, onValueChange, placeholder, maxLength }) {
  const [editor] = useLexicalComposerContext()
  const [initialized, setInitialized] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const { token } = theme.useToken()

  // Cargar valor inicial
  useEffect(() => {
    if (!initialized && value && value.trim()) {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(value))
        root.append(paragraph)
        setCharCount(value.length)
      })
      setInitialized(true)
    }
  }, [editor, value, initialized])

  // Manejar cambios
  const handleChange = useCallback(
    (editorState) => {
      editorState.read(() => {
        const root = $getRoot()
        const text = root.getTextContent()
        setCharCount(text.length)
        console.log('📝 RichTextEditor onChange:', text) // DEBUG
        onValueChange?.(text)
      })
    },
    [onValueChange]
  )

  const isExceeded = charCount > maxLength

  return (
    <>
      <Toolbar />

      <div
        style={{
          border: `1px solid ${isExceeded ? token.colorError : token.colorBorder}`,
          borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
          backgroundColor: 'white',
          minHeight: '150px',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                outline: 'none',
                minHeight: '150px',
                padding: '12px',
                resize: 'vertical',
                overflow: 'auto',
              }}
            />
          }
          placeholder={
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                opacity: 0.4,
                color: token.colorTextSecondary,
                fontSize: '14px',
                userSelect: 'none',
                fontStyle: 'italic',
              }}
            >
              {placeholder}
            </div>
          }
          ErrorBoundary={(props) => <div {...props} />}
        />
      </div>

      <ListPlugin />
      <LinkPlugin />
      <HistoryPlugin />
      <OnChangePlugin onChange={handleChange} />

      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: isExceeded ? token.colorError : token.colorTextSecondary,
          fontWeight: isExceeded ? 600 : 400,
        }}
      >
        {charCount} / {maxLength} caracteres
        {isExceeded && ' ⚠️ Límite excedido'}
      </div>
    </>
  )
}

/**
 * RichTextEditor - Componente controlado para Ant Form
 */
const RichTextEditor = forwardRef(
  ({ value = '', onChange, placeholder = 'Escribe aquí...', maxLength = 500, disabled = false }, ref) => {
    const config = useMemo(
      () => ({
        namespace: 'RichTextEditor',
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
        onError: (error) => {
          console.error('Lexical error:', error)
        },
      }),
      []
    )

    return (
      <div ref={ref} style={{ width: '100%' }}>
        <LexicalComposer initialConfig={config}>
          <EditorContent
            value={value}
            onValueChange={(text) => {
              console.log('🔄 RichTextEditor: onChange llamado con:', text) // DEBUG
              onChange?.(text)
            }}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        </LexicalComposer>
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
