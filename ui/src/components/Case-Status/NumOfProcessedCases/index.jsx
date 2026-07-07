import { useState, useEffect } from 'react';
import _service from '@netuno/service-client';

function NumOfProcessedCases() {
    const [totalCase, setTotalCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        _service({
            method: 'GET',
            url: 'case/process-pdfs/isProcessed',
            success: ({ json }) => {
                if (json && json.length > 0 && json[0].count !== undefined) {
                    setTotalCase(json[0].count);
                } else {
                    setError("No data received");
                }
                setLoading(false);
            },
            error: (err) => {
                setError(err.message || "Failed to fetch cases");
                setLoading(false);
            }
        });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return <p>Total Processed Cases: {totalCase}</p>;
}

export default NumOfProcessedCases;
