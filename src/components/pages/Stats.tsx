import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Copy, ExternalLink, BarChart3, Calendar, MousePointerClick } from "lucide-react";
import { toast } from "../../hooks/use-toast";

interface LinkStats {
  id: string;
  code: string;
  url: string;
  clicks: number;
  last_clicked_at: string | null;
  created_at: string;
}

const Stats = () => {
  const { code } = useParams<{ code: string }>();
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/links/${code}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (code) {
      fetchStats();
    }
  }, [code]);

  const copyShortLink = () => {
    const shortUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    toast({
      title: "Copied!",
      description: "Short link copied to clipboard",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Not Found</CardTitle>
            <CardDescription>
              The link code "{code}" does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Link Statistics</h1>
          <p className="text-gray-600">Detailed analytics for your short link</p>
        </div>

        {/* Short Code Card */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Short Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold font-mono">{stats.code}</span>
                <code className="text-sm text-gray-600">
                  {window.location.origin}/{stats.code}
                </code>
              </div>
              <Button variant="outline" size="sm" onClick={copyShortLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Target URL Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Target URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={stats.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline break-all"
            >
              {stats.url}
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
            </a>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.clicks}</div>
              <p className="text-xs text-gray-600 mt-1">
                All-time clicks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Last Clicked</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {stats.last_clicked_at ? (
                  <>
                    <div className="text-lg font-bold">
                      {formatDate(stats.last_clicked_at).split(',')[0]}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(stats.last_clicked_at).split(',').slice(1).join(',')}
                    </p>
                  </>
                ) : (
                  <div className="text-lg font-bold text-gray-600">Never</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                <div className="text-lg font-bold">
                  {formatDate(stats.created_at).split(',')[0]}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formatDate(stats.created_at).split(',').slice(1).join(',')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;