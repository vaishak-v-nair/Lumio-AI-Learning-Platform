import { useState, useEffect } from 'react';

type HeatmapDataItem = {
    student: string;
    data: { topic: string; time: number }[];
};

export function useTeacherData() {
    const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setHeatmapData([]); // Start with empty data as requested

            setIsLoading(false);
        };
        fetchData();
    }, []);

    const hasData = !isLoading && heatmapData.length > 0;

    return { heatmapData, isLoading, hasData };
}
