// src/components/blogs/BlogContent.js
export default function BlogContent({ content }) {
    return (
        <div className="prose max-w-none">
            <pre>{content}</pre>
        </div>
    );
}
