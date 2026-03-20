// Single Post API Route
import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, getPostsByAuthor, getRelatedPosts } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPostBySlug(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Fetch related data
    const [articlesByAuthor, relatedArticles] = await Promise.all([
      post.authorId ? getPostsByAuthor(post.authorId, post.id, 4) : Promise.resolve([]),
      post.categoryId ? getRelatedPosts(post.categoryId, post.id, 4) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      post,
      articlesByAuthor,
      relatedArticles,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
