import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lightbulb, ArrowRight, X, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ConversationStarterType {
  text: string;
  category: "greeting" | "question" | "religious" | "general";
}

interface ConversationStartersProps {
  contactId: number;
  onSelectStarter: (text: string) => void;
  onClose: () => void;
}

export default function ConversationStarters({ 
  contactId, 
  onSelectStarter, 
  onClose 
}: ConversationStartersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    data: starters, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<ConversationStarterType[]>({
    queryKey: [`/api/conversation-starters/${contactId}`],
    queryFn: getQueryFn(),
    enabled: !!contactId,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: "Failed to load conversation starters",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    }
  }, [isError, error, toast]);

  const filteredStarters = starters && selectedCategory 
    ? starters.filter(starter => starter.category === selectedCategory)
    : starters;

  const categories = starters?.reduce((acc: Record<string, number>, starter) => {
    acc[starter.category] = (acc[starter.category] || 0) + 1;
    return acc;
  }, {}) || {};

  // Handle starter selection
  const handleSelectStarter = (text: string) => {
    onSelectStarter(text);
    onClose();
  };

  // Get category display name
  const getCategoryDisplayName = (category: string): string => {
    const displayMap: Record<string, string> = {
      greeting: "Greetings",
      question: "Questions",
      religious: "Religious",
      general: "General"
    };
    return displayMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      greeting: "👋",
      question: "❓",
      religious: "🕌",
      general: "💬"
    };
    return iconMap[category] || "💬";
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 md:left-auto md:right-auto md:w-[450px] md:bottom-24 md:right-4 bg-background p-4 z-50 rounded-lg shadow-lg border animate-in fade-in-0 slide-in-from-bottom duration-300">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-lg">Conversation Starters</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
        <Badge 
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {Object.keys(categories).map(category => (
          <Badge 
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryIcon(category)} {getCategoryDisplayName(category)} ({categories[category]})
          </Badge>
        ))}
      </div>

      {/* Starters list */}
      <div className="overflow-y-auto max-h-60 flex flex-col gap-2">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="w-full h-12 bg-muted/50 rounded-lg" />
          ))
        ) : isError ? (
          <div className="text-center py-4 text-destructive">
            Failed to load suggestions. Please try again.
          </div>
        ) : starters?.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No conversation starters available.
          </div>
        ) : (
          filteredStarters?.map((starter, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-between h-auto py-2 px-3 text-left"
              onClick={() => handleSelectStarter(starter.text)}
            >
              <span className="mr-2 text-sm">{starter.text}</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Button>
          ))
        )}
      </div>
    </Card>
  );
}