import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Reset selection after inserting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      insertText(`[${linkText}](${linkUrl})`);
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      insertText(`![${imageAlt || 'Image'}](${imageUrl})`);
      setImageUrl('');
      setImageAlt('');
      setShowImageDialog(false);
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="border border-b-0 rounded-t-md bg-muted/30 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('**', '**')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('*', '*')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('~~', '~~')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('\n- ')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('\n1. ')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Insert Link">
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Input
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <Input
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button onClick={insertLink} size="sm">Insert Link</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover open={showImageDialog} onOpenChange={setShowImageDialog}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Insert Image">
              <Image className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Alt text (optional)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <Button onClick={insertImage} size="sm">Insert Image</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Insert Emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText(emoji)}
                  className="h-8 w-8 p-0"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] rounded-t-none border-t-0 resize-none focus-visible:ring-0"
      />
    </div>
  );
}