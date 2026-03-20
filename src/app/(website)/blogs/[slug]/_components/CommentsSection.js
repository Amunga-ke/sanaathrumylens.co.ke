// CommentsSection.js - Updated to use API routes instead of Firebase
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, ThumbsUp, MoreVertical, Trash2, Edit, Flag, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import { fetchComments, addComment, deleteComment, likeComment, reportComment, updateComment } from "@/lib/db";
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const SORT_OPTIONS = {
    NEWEST: { value: 'newest', label: 'Newest', icon: Clock },
    OLDEST: { value: 'oldest', label: 'Oldest', icon: Clock },
    MOST_LIKED: { value: 'most_liked', label: 'Most Liked', icon: TrendingUp }
};

const CommentsSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST.value);

    const { user, canComment, canModerate } = useAuth();
    const router = useRouter();

    // Fetch comments when component mounts or sortBy changes
    const loadComments = useCallback(async () => {
        if (!postId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const fetchedComments = await fetchComments(postId, 50);
            
            // Sort comments based on selected option
            let sortedComments = [...fetchedComments];
            switch (sortBy) {
                case SORT_OPTIONS.OLDEST.value:
                    sortedComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case SORT_OPTIONS.MOST_LIKED.value:
                    sortedComments.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
                    break;
                case SORT_OPTIONS.NEWEST.value:
                default:
                    sortedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }

            // If user is logged in, put their comments first
            if (user?.id) {
                const userComments = sortedComments.filter(c => c.userId === user.id);
                const otherComments = sortedComments.filter(c => c.userId !== user.id);
                sortedComments = [...userComments, ...otherComments];
            }

            setComments(sortedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [postId, sortBy, user?.id]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Handle click on comment area when not authenticated
    const handleCommentAreaClick = () => {
        if (!user) {
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/auth?redirect=${encodeURIComponent(currentPath + '#comments')}`);
        }
    };

    // Submit new comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim() || !user || !postId) {
            return;
        }

        if (!canComment()) {
            toast.error('Your account is not allowed to comment at this time.');
            return;
        }

        try {
            setSubmitting(true);
            const result = await addComment(postId, newComment);

            if (result.success) {
                setNewComment('');
                toast.success('Comment posted successfully!');
                // Reload comments
                await loadComments();
            } else {
                toast.error(result.error || 'Failed to post comment.');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            toast.error('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Start editing a comment
    const startEditingComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    // Save edited comment
    const saveEditedComment = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            const result = await updateComment(postId, commentId, editContent);

            if (result.success) {
                setEditingCommentId(null);
                setEditContent('');
                toast.success('Comment updated successfully!');
                await loadComments();
            } else {
                toast.error('Failed to update comment: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Failed to update comment. Please try again.');
        }
    };

    // Delete a comment
    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const result = await deleteComment(postId, commentId);

            if (result.success) {
                toast.success('Comment deleted successfully!');
                await loadComments();
            } else {
                toast.error('Failed to delete comment: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment. Please try again.');
        }
    };

    // Like a comment
    const handleLikeComment = async (commentId) => {
        if (!user?.id) {
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/auth?redirect=${encodeURIComponent(currentPath + '#comments')}`);
            return;
        }

        try {
            // Optimistic UI update
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        const wasLiked = comment.likedByUser;
                        return {
                            ...comment,
                            likeCount: wasLiked ? Math.max(0, (comment.likeCount || 0) - 1) : (comment.likeCount || 0) + 1,
                            likedByUser: !wasLiked,
                        };
                    }
                    return comment;
                })
            );

            const result = await likeComment(commentId);

            if (result.success) {
                toast.success(result.liked ? 'Comment liked!' : 'Comment unliked!');
            } else {
                // Revert optimistic update on failure
                await loadComments();
                toast.error(result.error || 'Failed to like comment');
            }
        } catch (error) {
            console.error('Error in handleLikeComment:', error);
            toast.error('An error occurred. Please try again.');
        }
    };

    // Report a comment
    const handleReportComment = async (commentId) => {
        if (!user?.id) {
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/auth?redirect=${encodeURIComponent(currentPath + '#comments')}`);
            return;
        }

        try {
            const result = await reportComment(commentId);

            if (result.success) {
                toast.success('Comment reported. Thank you for your feedback.');
                await loadComments();
            } else {
                toast.error(result.error || 'Failed to report comment');
            }
        } catch (error) {
            console.error('Error reporting comment:', error);
            toast.error('Error reporting comment. Please try again.');
        }
    };

    // Format timestamps
    const formatTimeAgo = (date) => {
        if (!date) return 'Just now';
        const commentDate = new Date(date);
        const now = new Date();
        const diffInSeconds = Math.floor((now - commentDate) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return commentDate.toLocaleDateString();
    };

    // Check if user can edit/delete comment
    const isCommentOwner = (commentUserId) => user?.id === commentUserId;
    const canDeleteComment = (commentUserId) => isCommentOwner(commentUserId) || canModerate();

    // Render comment action buttons
    const renderCommentActions = (comment) => {
        const canEdit = isCommentOwner(comment.userId);
        const canDelete = canDeleteComment(comment.userId);
        const showLikeButton = user !== null;

        return (
            <div className="flex gap-2 mt-2">
                {showLikeButton ? (
                    <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`text-xs flex items-center gap-1 ${comment.likedByUser ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <ThumbsUp size={12} className={comment.likedByUser ? 'fill-current' : ''} />
                        {comment.likeCount || 0}
                    </button>
                ) : (
                    <button
                        onClick={handleCommentAreaClick}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600"
                    >
                        <ThumbsUp size={12} />
                        {comment.likeCount || 0}
                    </button>
                )}

                <button className="text-xs text-gray-500 hover:text-gray-700">
                    Reply
                </button>

                {canEdit && (
                    <button
                        onClick={() => startEditingComment(comment)}
                        className="text-xs text-gray-500 hover:text-green-600"
                    >
                        Edit
                    </button>
                )}

                {canDelete && (
                    <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                    >
                        Delete
                    </button>
                )}

                {!isCommentOwner(comment.userId) && user && (
                    comment.reportedByUser ? (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Flag size={12} />
                            Reported
                        </span>
                    ) : (
                        <button
                            onClick={() => handleReportComment(comment.id)}
                            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                        >
                            <Flag size={12} />
                            Report
                        </button>
                    )
                )}
            </div>
        );
    };

    // Render sort options
    const renderSortOptions = () => (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex rounded-md overflow-hidden border border-gray-300">
                {Object.values(SORT_OPTIONS).map((option) => {
                    const Icon = option.icon;
                    return (
                        <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={`flex items-center gap-1 px-3 py-1 text-sm transition-colors ${sortBy === option.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon size={14} />
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div id="comments" className="w-full mx-auto space-y-10">
            {/* Comment Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">
                    Comments ({comments.length})
                </h3>

                {user ? (
                    <form onSubmit={handleSubmitComment} className="space-y-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment…"
                            rows={3}
                            disabled={!canComment()}
                            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm 
                     focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition"
                        />

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {!canComment()
                                    ? 'Your account is not allowed to comment'
                                    : `${comments.length} comments`}
                            </p>

                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim() || !canComment()}
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white 
                       hover:bg-gray-800 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Posting…' : 'Post comment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div
                        onClick={handleCommentAreaClick}
                        className="rounded-xl border border-gray-200 p-6 space-y-4 
                   hover:border-gray-300 transition cursor-pointer bg-gray-50"
                    >
                        <textarea
                            readOnly
                            rows={3}
                            placeholder="Sign in to comment"
                            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm bg-white"
                        />

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Sign in to join the discussion
                            </p>

                            <button
                                type="button"
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white 
                       hover:bg-gray-800 transition"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sort Options */}
            {renderSortOptions()}

            {/* Comments List */}
            <div className="space-y-6 max-h-150 overflow-y-auto pr-2">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                    <div className="space-y-1">
                                        <div className="h-3 w-24 bg-gray-200 rounded" />
                                        <div className="h-2 w-16 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded" />
                                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No comments yet. Be the first!
                    </div>
                ) : (
                    <>
                        {comments.map(comment => (
                            <div key={comment.id} className="border-b border-gray-200 pb-5 last:border-0">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                        <Image
                                            src={comment.user?.image || '/default-avatar.png'}
                                            alt={`Avatar of ${comment.user?.name || 'User'}`}
                                            width={32}
                                            height={32}
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                                {comment.user?.name || 'Anonymous'}
                                            </span>
                                            {comment.userId === user?.id && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {formatTimeAgo(comment.createdAt)}
                                            </span>
                                            {comment.isEdited && (
                                                <span className="text-xs text-gray-400">(edited)</span>
                                            )}
                                        </div>

                                        {editingCommentId === comment.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows={3}
                                                    className="w-full resize-none rounded-lg border border-gray-300 p-2 text-sm 
                                   focus:ring-2 focus:ring-gray-200"
                                                />

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveEditedComment(comment.id)}
                                                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-800 transition"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCommentId(null)}
                                                        className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-300 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                                {renderCommentActions(comment)}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
