'use client';

import { Lightbulb } from "lucide-react";

export default function TestHint({ explanation }: { explanation: string }) {
    return (
        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-md">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-primary">Hint</h4>
                    <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
                </div>
            </div>
        </div>
    );
}
