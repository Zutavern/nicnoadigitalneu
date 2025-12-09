'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  FileCode,
  Loader2,
  FileCode2,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  editorClassName?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Schreibe deinen Artikel...',
  className,
  editorClassName,
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [htmlDialogOpen, setHtmlDialogOpen] = useState(false)
  const [showHtmlPreview, setShowHtmlPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Unterstützte Tags Liste
  const supportedTags = ['h1', 'h2', 'h3', 'p', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 
    'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'img', 'hr', 'br', 'mark', 'span']
  
  // HTML Validierung und Warnung
  const htmlValidation = useMemo(() => {
    if (!htmlContent.trim()) return { isValid: true, warnings: [], unsupportedTags: [] }
    
    // Finde alle HTML-Tags im Content
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi
    const foundTags = new Set<string>()
    let match
    
    while ((match = tagRegex.exec(htmlContent)) !== null) {
      foundTags.add(match[1].toLowerCase())
    }
    
    // Prüfe auf nicht unterstützte Tags
    const unsupportedTags = Array.from(foundTags).filter(tag => !supportedTags.includes(tag))
    
    const warnings: string[] = []
    if (unsupportedTags.length > 0) {
      warnings.push(`Folgende Tags werden ignoriert: ${unsupportedTags.map(t => `<${t}>`).join(', ')}`)
    }
    
    // Prüfe auf div/section/article (häufige Fehler)
    if (unsupportedTags.includes('div') || unsupportedTags.includes('section') || unsupportedTags.includes('article')) {
      warnings.push('Tipp: <div>, <section> und <article> werden in <p> umgewandelt oder ignoriert.')
    }
    
    // Prüfe auf table (nicht unterstützt ohne Extension)
    if (unsupportedTags.includes('table') || unsupportedTags.includes('tr') || unsupportedTags.includes('td')) {
      warnings.push('Tipp: Tabellen sind nicht unterstützt. Verwende stattdessen Listen.')
    }
    
    return {
      isValid: unsupportedTags.length === 0,
      warnings,
      unsupportedTags
    }
  }, [htmlContent])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg shadow-lg max-w-full h-auto my-6',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg overflow-hidden my-6',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-zinc-900 text-zinc-100 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
          'prose-headings:font-bold prose-headings:tracking-tight',
          'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:underline',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-img:rounded-lg prose-img:shadow-lg',
          editorClassName
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/blog/posts/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen')
      }

      const { url } = await response.json()
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error('Bild-Upload fehlgeschlagen:', error)
    } finally {
      setIsUploading(false)
    }
  }, [editor])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    e.target.value = '' // Reset input
  }, [handleImageUpload])

  const addLink = useCallback(() => {
    if (!editor) return

    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setLinkDialogOpen(false)
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    setImageDialogOpen(false)
  }, [editor, imageUrl])

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return
    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
    setYoutubeUrl('')
    setYoutubeDialogOpen(false)
  }, [editor, youtubeUrl])

  const insertHtml = useCallback(() => {
    if (!editor || !htmlContent.trim()) return
    
    // Füge HTML an aktueller Cursor-Position ein
    editor.chain().focus().insertContent(htmlContent, {
      parseOptions: {
        preserveWhitespace: false,
      },
    }).run()
    
    setHtmlContent('')
    setHtmlDialogOpen(false)
  }, [editor, htmlContent])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-[400px] border rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        {/* History */}
        <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Rückgängig"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Wiederholen"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Fett"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Kursiv"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Unterstrichen"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Durchgestrichen"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="Hervorheben"
          >
            <Highlighter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Überschrift 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Überschrift 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Überschrift 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Linksbündig"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Zentriert"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Rechtsbündig"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Blocksatz"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists & Blocks */}
        <div className="flex items-center gap-0.5 pr-2 border-r mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Aufzählung"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Nummerierte Liste"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Zitat"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <FileCode className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Trennlinie"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Media & Links */}
        <div className="flex items-center gap-0.5">
          {/* Link Dialog */}
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <ToolbarButton
                isActive={editor.isActive('link')}
                title="Link einfügen"
                onClick={() => {
                  const previousUrl = editor.getAttributes('link').href
                  setLinkUrl(previousUrl || '')
                }}
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link einfügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {editor.isActive('link') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        editor.chain().focus().unsetLink().run()
                        setLinkDialogOpen(false)
                      }}
                    >
                      Link entfernen
                    </Button>
                  )}
                  <Button onClick={addLink}>
                    {editor.isActive('link') ? 'Aktualisieren' : 'Einfügen'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Dialog */}
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <ToolbarButton title="Bild einfügen" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </ToolbarButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bild einfügen</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="upload" className="py-4">
                <TabsList className="w-full">
                  <TabsTrigger value="upload" className="flex-1">Hochladen</TabsTrigger>
                  <TabsTrigger value="url" className="flex-1">URL eingeben</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Wird hochgeladen...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span>Klicken zum Auswählen oder Bild hierher ziehen</span>
                      </div>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Bild-URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addImage()}
                    />
                  </div>
                  <Button onClick={addImage} className="w-full" disabled={!imageUrl}>
                    Bild einfügen
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          {/* YouTube Dialog */}
          <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
            <DialogTrigger asChild>
              <ToolbarButton title="YouTube Video einfügen">
                <YoutubeIcon className="h-4 w-4" />
              </ToolbarButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>YouTube Video einfügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addYoutube()}
                  />
                </div>
                <Button onClick={addYoutube} className="w-full" disabled={!youtubeUrl}>
                  Video einfügen
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* HTML Import Dialog */}
          <Dialog open={htmlDialogOpen} onOpenChange={(open) => {
            setHtmlDialogOpen(open)
            if (!open) {
              setShowHtmlPreview(false)
            }
          }}>
            <DialogTrigger asChild>
              <ToolbarButton title="HTML einfügen">
                <FileCode2 className="h-4 w-4" />
              </ToolbarButton>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>HTML einfügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="html-content">HTML-Code</Label>
                  <Textarea
                    id="html-content"
                    placeholder="<h2>Überschrift</h2>
<p>Füge hier deinen <strong>HTML-Code</strong> ein...</p>
<ul>
  <li>Punkt 1</li>
  <li>Punkt 2</li>
</ul>"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                
                {/* Warnungen für nicht unterstützte Tags */}
                {htmlValidation.warnings.length > 0 && (
                  <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Hinweis zur HTML-Kompatibilität</span>
                    </div>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-6 list-disc">
                      {htmlValidation.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Vorschau Toggle */}
                {htmlContent.trim() && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showHtmlPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
                    </Button>
                    
                    {showHtmlPreview && (
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          So wird das HTML interpretiert:
                        </Label>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <strong>Unterstützte Tags:</strong> h1-h3, p, strong/b, em/i, u, s/strike/del, a, ul, ol, li, blockquote, code, pre, img, hr, br, mark
                </div>
                
                <Button 
                  onClick={insertHtml} 
                  className="w-full" 
                  disabled={!htmlContent.trim()}
                >
                  {htmlValidation.warnings.length > 0 ? 'Trotzdem einfügen' : 'HTML einfügen'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}

// Toolbar Button Component
interface ToolbarButtonProps {
  onClick?: () => void
  isActive?: boolean
  disabled?: boolean
  title?: string
  size?: 'default' | 'sm'
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  size = 'default',
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'rounded transition-colors flex items-center justify-center',
        size === 'default' ? 'h-8 w-8' : 'h-6 w-6',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted text-muted-foreground hover:text-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}

export default TiptapEditor


