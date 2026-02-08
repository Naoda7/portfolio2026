import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '../ui/Button';
import { 
  Bold, 
  Italic, 
  List, 
  Heading1,
  Code
} from 'lucide-react';

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 rounded-lg"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 rounded-lg"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 w-8 rounded-lg"
        >
          <Heading1 size={16} />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 rounded-lg"
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('codeBlock') ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className="h-8 w-8 rounded-lg"
        >
          <Code size={16} />
        </Button>
      </div>

      {/* Editor Area */}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[250px] max-h-[500px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none focus:outline-none" 
      />
    </div>
  );
};