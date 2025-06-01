import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface MessageContentProps {
  content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
        components={{
          code(props) {
            const {className, children, ...rest} = props;
            const match = /language-(\w+)/.exec(className || '');
            const isCodeBlock = match !== null;

            if (isCodeBlock) {
              return (
                <div className="relative group">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        const code = String(children).replace(/\n$/, '');
                        navigator.clipboard.writeText(code);
                      }}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </div>
              );
            }

            return (
              <code className={`${className} bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5`} {...rest}>
                {children}
              </code>
            );
          },
          p(props) {
            return <p className="mb-4 last:mb-0" {...props} />;
          },
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 