// src/components/editor/rich-text-editor.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bold, Italic, List, Link, Image as ImageIcon, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ 
  initialContent = '', 
  onSave,
  placeholder = 'Start typing...' 
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true)
      await onSave(content)
      setIsSaving(false)
    }
  }

  const formatText = (command: string) => {
    document.execCommand(command, false)
  }

  return (
    <Card className="border-wedding-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display">Editor</CardTitle>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-wedding-gold to-wedding-blush"
          size="sm"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 mb-4 p-2 bg-wedding-blush/20 rounded-lg">
          <button
            onClick={() => formatText('bold')}
            className="p-2 hover:bg-white rounded"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatText('italic')}
            className="p-2 hover:bg-white rounded"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-wedding-gold/20 mx-1" />
          <button
            onClick={() => formatText('insertUnorderedList')}
            className="p-2 hover:bg-white rounded"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatText('createLink')}
            className="p-2 hover:bg-white rounded"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </button>
          <button
            onClick={() => formatText('insertImage')}
            className="p-2 hover:bg-white rounded"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Editor */}
        <div
          contentEditable
          className={cn(
            "min-h-[200px] p-4 border border-wedding-gold/20 rounded-lg",
            "focus:outline-none focus:border-wedding-gold bg-white",
            "prose prose-sm max-w-none"
          )}
          onInput={(e) => setContent(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: content || `<p>${placeholder}</p>` }}
        />

        {/* Character count */}
        <div className="flex justify-between items-center mt-4 text-sm text-wedding-navy/60">
          <span>
            {content.replace(/<[^>]*>/g, '').length} characters
          </span>
          <span>
            {content.split(' ').filter(word => word.length > 0).length} words
          </span>
        </div>
      </CardContent>
    </Card>
  )
}