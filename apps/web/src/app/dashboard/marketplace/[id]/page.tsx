'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  GET_PLUGIN,
  GET_PLUGIN_REVIEWS,
  GET_INSTALLED_PLUGINS,
  INSTALL_PLUGIN,
  UNINSTALL_PLUGIN,
  TOGGLE_PLUGIN,
  CREATE_REVIEW,
} from '@/graphql/marketplace';
import { Star, Download, Check, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PluginDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pluginId = params.id as string;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: pluginData, loading: pluginLoading } = useQuery(GET_PLUGIN, {
    variables: { id: pluginId },
  });

  const { data: reviewsData, refetch: refetchReviews } = useQuery(GET_PLUGIN_REVIEWS, {
    variables: { pluginId },
  });

  const { data: installedData, refetch: refetchInstalled } = useQuery(GET_INSTALLED_PLUGINS);

  const [installPlugin, { loading: installing }] = useMutation(INSTALL_PLUGIN, {
    onCompleted: () => {
      refetchInstalled();
    },
  });

  const [uninstallPlugin, { loading: uninstalling }] = useMutation(UNINSTALL_PLUGIN, {
    onCompleted: () => {
      refetchInstalled();
    },
  });

  const [togglePlugin] = useMutation(TOGGLE_PLUGIN, {
    onCompleted: () => {
      refetchInstalled();
    },
  });

  const [createReview, { loading: submittingReview }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      refetchReviews();
      setComment('');
      setRating(5);
    },
  });

  const plugin = pluginData?.plugin;
  const reviews = reviewsData?.pluginReviews || [];
  const installedPlugins = installedData?.installedPlugins || [];

  const installedPlugin = installedPlugins.find((ip: any) => ip.plugin.id === pluginId);
  const isInstalled = !!installedPlugin;

  const handleInstall = async () => {
    await installPlugin({
      variables: {
        input: { pluginId },
      },
    });
  };

  const handleUninstall = async () => {
    await uninstallPlugin({
      variables: { pluginId },
    });
  };

  const handleToggle = async () => {
    await togglePlugin({
      variables: { pluginId },
    });
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) return;

    await createReview({
      variables: {
        input: {
          pluginId,
          rating,
          comment,
        },
      },
    });
  };

  if (pluginLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Plugin not found</p>
            <Button onClick={() => router.push('/dashboard/marketplace')} className="mt-4">
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/marketplace')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {plugin.name}
                    {plugin.isVerified && (
                      <Check className="h-6 w-6 text-primary" title="Verified" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plugin.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">{plugin.category}</Badge>
                {plugin.isFeatured && <Badge variant="default">Featured</Badge>}
                {plugin.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{plugin.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({plugin.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">{plugin.downloadCount.toLocaleString()}</span>
                  <span className="text-muted-foreground">downloads</span>
                </div>
              </div>

              {/* Long Description */}
              {plugin.longDescription && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{plugin.longDescription}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {plugin.homepageUrl && (
                  <a href={plugin.homepageUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Homepage
                    </Button>
                  </a>
                )}
                {plugin.documentationUrl && (
                  <a href={plugin.documentationUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentation
                    </Button>
                  </a>
                )}
                {plugin.repositoryUrl && (
                  <a href={plugin.repositoryUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Repository
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Write Review */}
              {isInstalled && (
                <div className="space-y-4 pb-6 border-b">
                  <h3 className="font-semibold">Write a Review</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setRating(value)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              value <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Share your experience with this plugin..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !comment.trim()}
                  >
                    Submit Review
                  </Button>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review.id} className="space-y-2 pb-4 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                className={`h-3 w-3 ${
                                  value <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Install</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstalled ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      {installedPlugin.isEnabled ? (
                        <Badge variant="default">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{installedPlugin.installedVersion}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleToggle} variant="outline" className="w-full">
                      {installedPlugin.isEnabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      onClick={handleUninstall}
                      variant="destructive"
                      disabled={uninstalling}
                      className="w-full"
                    >
                      Uninstall
                    </Button>
                  </div>
                </>
              ) : (
                <Button onClick={handleInstall} disabled={installing} className="w-full">
                  Install Plugin
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span>{plugin.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span>{plugin.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="capitalize">{plugin.category.replace('_', '/')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Downloads:</span>
                <span>{plugin.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Installs:</span>
                <span>{plugin.installCount.toLocaleString()}</span>
              </div>
              {plugin.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Published:</span>
                  <span>{new Date(plugin.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
