import { useState } from "react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";

interface LinkFormProps {
  onSuccess: () => void;
}

export function LinkForm({ onSuccess }: LinkFormProps) {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL (include http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    // Validate custom code if provided
    if (customCode && !/^[A-Za-z0-9]{6,8}$/.test(customCode)) {
      toast({
        title: "Error",
        description: "Custom code must be 6-8 alphanumeric characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            url: url.trim(),
            code: customCode.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: "Error",
            description: "This custom code is already taken. Please choose another.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to create link",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success!",
        description: `Short link created: ${data.code}`,
      });

      setUrl("");
      setCustomCode("");
      onSuccess();
    } catch (error) {
      console.error("Error creating link:", error);
      toast({
        title: "Error",
        description: "Failed to create link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Long URL</Label>
        <Input
          id="url"
          type="text"
          placeholder="https://example.com/very-long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="code">Custom Code (Optional)</Label>
        <Input
          id="code"
          type="text"
          placeholder="mycode (6-8 characters)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          disabled={isSubmitting}
          maxLength={8}
        />
        <p className="text-sm text-muted-foreground">
          Leave empty for random code. Must be 6-8 alphanumeric characters.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <LinkIcon className="mr-2 h-4 w-4" />
            Shorten URL
          </>
        )}
      </Button>
    </form>
  );
}