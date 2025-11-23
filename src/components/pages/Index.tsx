import { useEffect, useState } from "react";
import { LinksTable } from "../LinksTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Link as LinkIcon } from "lucide-react";
import { LinkForm } from "../LinkForm";

interface LinkData {
    id: string;
    code: string;
    url: string;
    clicks: number;
    last_clicked_at: string | null;
    created_at: string;
}

const Index = () => {
    const [links, setLinks] = useState<LinkData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLinks = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/links`,
                {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setLinks(data);
            }
        } catch (error) {
            console.error("Error fetching links:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <header className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                        <LinkIcon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
                        TinyLink
                    </h1>
                    <p className="text-gray-600">
                        Shorten your URLs and track clicks with ease
                    </p>
                </header>

                {/* Create Link Section */}
                <Card className="mb-8 border-gray-200 shadow-lg">
                    <CardHeader>
                        <CardTitle>Create Short Link</CardTitle>
                        <CardDescription>
                            Enter a long URL and optionally choose a custom short code
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LinkForm onSuccess={fetchLinks} />
                    </CardContent>
                </Card>

                <Separator className="my-8" />

                {/* Links List Section */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold">Your Links</h2>
                        <p className="text-gray-600">
                            Manage and track all your shortened URLs
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                        </div>
                    ) : (
                        <LinksTable links={links} onDelete={fetchLinks} />
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-sm text-gray-600">
                    <p>
                        <a href="/healthz" className="text-blue-600 hover:underline">
                            Health Check
                        </a>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Index;