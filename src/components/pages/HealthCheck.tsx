import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Database, Zap, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { supabase } from "../../intregation/superbase/client";

const HealthCheck = () => {
    const [health, setHealth] = useState({
        ok: false,
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        database: false,
        api: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkHealth = async () => {
            const startTime = Date.now();

            try {
                // Check database connection
                const { error: dbError } = await supabase
                    .from('links')
                    .select('count')
                    .limit(1);

                const databaseHealthy = !dbError;

                // Check API
                const apiResponse = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/links`,
                    {
                        headers: {
                            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        },
                    }
                );

                const apiHealthy = apiResponse.ok;

                setHealth({
                    ok: databaseHealthy && apiHealthy,
                    version: "1.0.0",
                    timestamp: new Date().toISOString(),
                    database: databaseHealthy,
                    api: apiHealthy,
                });
            } catch (error) {
                console.error("Health check error:", error);
                setHealth({
                    ok: false,
                    version: "1.0.0",
                    timestamp: new Date().toISOString(),
                    database: false,
                    api: false,
                });
            } finally {
                setIsLoading(false);
            }
        };

        checkHealth();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
    <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>

        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">System Health Check</CardTitle>
                        <CardDescription>Current system status and diagnostics</CardDescription>
                    </div>
                    {!isLoading && (
                        <Badge
                            variant={health.ok ? "default" : "destructive"}
                            className="text-sm"
                        >
                            {health.ok ? (
                                <>
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    Healthy
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Unhealthy
                                </>
                            )}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex h-32 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-slate-50 p-4">
                                <div className={`rounded-full p-2 ${health.database ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Database className={`h-5 w-5 ${health.database ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                                <div>
                                    <div className="font-medium">Database</div>
                                    <div className="text-sm text-gray-600">
                                        {health.database ? "Connected" : "Disconnected"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-slate-50 p-4">
                                <div className={`rounded-full p-2 ${health.api ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Zap className={`h-5 w-5 ${health.api ? 'text-green-600' : 'text-red-600'}`} />
                                </div>
                                <div>
                                    <div className="font-medium">API</div>
                                    <div className="text-sm text-gray-600">
                                        {health.api ? "Operational" : "Down"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Globe className="h-5 w-5 text-blue-600" />
                                <div className="font-medium">System Information</div>
                            </div>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">Version:</dt>
                                    <dd className="font-mono">{health.version}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">Status:</dt>
                                    <dd className={health.ok ? "text-green-600" : "text-red-600"}>
                                        {health.ok ? "OK" : "ERROR"}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-gray-600">Timestamp:</dt>
                                    <dd className="font-mono text-xs">
                                        {new Date(health.timestamp).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h3 className="font-medium mb-2">JSON Response</h3>
                            <pre className="text-xs font-mono overflow-x-auto">
                                {JSON.stringify({ ok: health.ok, version: health.version }, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
</div>
    );
};

export default HealthCheck;