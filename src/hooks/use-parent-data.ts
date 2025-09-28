import { useState, useEffect } from 'react';

export function useParentData() {
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setInsights(''); // Start with empty data

            setIsLoading(false);
        };
        fetchData();
    }, []);

    const hasData = !isLoading && insights.length > 0;

    return { insights, isLoading, hasData };
}
