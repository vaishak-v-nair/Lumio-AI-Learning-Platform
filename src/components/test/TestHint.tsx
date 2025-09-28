'use client';

import { Lightbulb } from "lucide-react";

export default function TestHint({ explanation }: { explanation: string }) {
    return (
        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border-l-4 border-accent rounded-r-md">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-accent">Hint</h4>
                    <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
                </div>
            </div>
        </div>
    );
}
