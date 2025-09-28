'use client';

import { CheckCircle, XCircle } from "lucide-react";

export default function TestFeedback({ correct, message }: { correct: boolean, message: string }) {
    return (
        <div className={`p-4 border-l-4 rounded-r-md ${correct ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {correct ? (
                        <CheckCircle className="h-6 w-6 text-green-500 animate-pulse" />
                    ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                    )}
                </div>
                <div className="flex-1">
                    <h4 className={`font-bold ${correct ? 'text-green-400' : 'text-red-400'}`}>
                        {correct ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{message}</p>
                </div>
            </div>
        </div>
    );
}
