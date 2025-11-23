import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "../../intregation/superbase/client";


const Redirect = () => {
  const { code } = useParams<{ code: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>("");

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the link
        const { data, error } = await supabase
          .from('links')
          .select('url')
          .eq('code', code)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setTargetUrl(data.url);

        // Increment click count
        await supabase.rpc('increment_link_clicks', { link_code: code });

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } catch (error) {
        console.error("Error handling redirect:", error);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    handleRedirect();
  }, [code]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Not Found</CardTitle>
            <CardDescription>
              The link code "{code}" does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This could mean:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>The link was deleted</li>
              <li>The code was typed incorrectly</li>
              <li>The link never existed</li>
            </ul>
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>You will be redirected shortly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Target:</span>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline truncate"
            >
              {targetUrl}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            If you are not redirected automatically, click the link above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Redirect;