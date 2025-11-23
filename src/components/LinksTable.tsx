import { useState } from "react";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Trash2, ExternalLink, Copy, Search, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";

interface LinkData {
    id: string;
    code: string;
    url: string;
    clicks: number;
    last_clicked_at: string | null;
    created_at: string;
}

interface LinksTableProps {
    links: LinkData[];
    onDelete: () => void;
}

export function LinksTable({ links, onDelete }: LinksTableProps) {
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const filteredLinks = links.filter(
        (link) =>
            link.code.toLowerCase().includes(search.toLowerCase()) ||
            link.url.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (code: string) => {
        if (!confirm("Are you sure you want to delete this link?")) {
            return;
        }

        setDeleting(code);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/links/${code}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete link");
            }

            toast({
                title: "Deleted",
                description: "Link deleted successfully",
            });

            onDelete();
        } catch (error) {
            console.error("Error deleting link:", error);
            toast({
                title: "Error",
                description: "Failed to delete link",
                variant: "destructive",
            });
        } finally {
            setDeleting(null);
        }
    };

    const copyShortLink = (code: string) => {
        const shortUrl = `${window.location.origin}/${code}`;
        navigator.clipboard.writeText(shortUrl);
        toast({
            title: "Copied!",
            description: "Short link copied to clipboard",
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleString();
    };

    const truncateUrl = (url: string, maxLength = 40) => {
        return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by code or URL..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {filteredLinks.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        {search ? "No links match your search" : "No links yet. Create your first one!"}
                    </p>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Short Code</TableHead>
                                <TableHead>Target URL</TableHead>
                                <TableHead className="text-center">Clicks</TableHead>
                                <TableHead>Last Clicked</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLinks.map((link) => (
                                <TableRow key={link.id}>
                                    <TableCell className="font-mono font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{link.code}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyShortLink(link.code)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:underline"
                                            title={link.url}
                                        >
                                            {truncateUrl(link.url)}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {link.clicks}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(link.last_clicked_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link to={`/code/${link.code}`}>
                                                    <BarChart3 className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(link.code)}
                                                disabled={deleting === link.code}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}