import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Heart, MessageCircle, Calendar, HelpCircle, Lightbulb, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categoryConfig = {
  experience: { icon: Heart, label: 'Experience', color: 'bg-chart-5/10 text-chart-5' },
  tip: { icon: Lightbulb, label: 'Tip', color: 'bg-chart-3/10 text-chart-3' },
  question: { icon: HelpCircle, label: 'Question', color: 'bg-primary/10 text-primary' },
  event: { icon: Calendar, label: 'Event', color: 'bg-chart-4/10 text-chart-4' },
  meetup: { icon: Users, label: 'Meetup', color: 'bg-chart-2/10 text-chart-2' },
  support: { icon: Heart, label: 'Support', color: 'bg-accent/10 text-accent' },
};

export default function Community() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'experience', author_name: '' });
  const [commentText, setCommentText] = useState({});
  const [commentAuthor, setCommentAuthor] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 50),
  });

  const createPost = useMutation({
    mutationFn: (data) => base44.entities.CommunityPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setDialogOpen(false);
      setNewPost({ title: '', content: '', category: 'experience', author_name: '' });
      toast.success('Post shared!');
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ postId, comment }) => {
      const post = posts.find(p => p.id === postId);
      const updatedComments = [...(post.comments || []), { ...comment, date: new Date().toISOString() }];
      return base44.entities.CommunityPost.update(postId, { comments: updatedComments });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setCommentText({});
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const post = posts.find(p => p.id === postId);
      return base44.entities.CommunityPost.update(postId, { likes_count: (post.likes_count || 0) + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communityPosts'] }),
  });

  const filteredPosts = filterCategory === 'all' ? posts : posts.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Community</h1>
          <p className="text-muted-foreground text-sm mt-1">Share experiences and support each other</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Share with Community</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Input placeholder="Your name" value={newPost.author_name} onChange={e => setNewPost(p => ({ ...p, author_name: e.target.value }))} />
              </div>
              <Select value={newPost.category} onValueChange={v => setNewPost(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Title" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} />
              <Textarea placeholder="Share your experience, tip, or question..." className="min-h-[120px]" value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} />
              <Button onClick={() => createPost.mutate(newPost)} disabled={createPost.isPending || !newPost.title || !newPost.content} className="w-full">
                {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Share Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory('all')}>All</Button>
        {Object.entries(categoryConfig).map(([key, { label }]) => (
          <Button key={key} variant={filterCategory === key ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory(key)}>
            {label}
          </Button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredPosts.length === 0 ? (
        <Card className="border-border/50"><CardContent className="py-12 text-center text-muted-foreground text-sm">No posts yet. Be the first to share!</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const config = categoryConfig[post.category] || categoryConfig.experience;
            const PostIcon = config.icon;
            return (
              <Card key={post.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
                      <PostIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <Badge variant="secondary" className={cn("text-xs", config.color)}>{config.label}</Badge>
                      </div>
                      {post.author_name && <p className="text-xs text-muted-foreground mb-2">by {post.author_name}</p>}
                      <p className="text-sm text-foreground/80 leading-relaxed">{post.content}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => likeMutation.mutate(post.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors">
                          <Heart className="w-4 h-4" />
                          {post.likes_count || 0}
                        </button>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments?.length || 0}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {post.created_date ? format(new Date(post.created_date), 'MMM d, yyyy') : ''}
                        </span>
                      </div>

                      {/* Comments */}
                      {post.comments?.length > 0 && (
                        <div className="mt-4 space-y-2 border-t border-border pt-3">
                          {post.comments.map((c, i) => (
                            <div key={i} className="bg-muted/30 rounded-lg p-3 text-sm">
                              <span className="font-medium">{c.author_name || 'Anonymous'}</span>
                              <p className="text-foreground/80 mt-0.5">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Add a comment..."
                          className="text-sm"
                          value={commentText[post.id] || ''}
                          onChange={e => setCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!commentText[post.id]) return;
                            addComment.mutate({
                              postId: post.id,
                              comment: { author_name: commentAuthor || 'Anonymous', content: commentText[post.id] }
                            });
                          }}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}