import { useState, useEffect } from 'react';
import _service from '@netuno/service-client';

function NumOfCases() {
    const [totalCase, setTotalCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        _service({
            method: 'GET',
            url: 'case/count',
            success: ({ json }) => {
                if (json.result && json.data && json.data.length > 0) {
                    const total = json.data[json.data.length - 1]["Total Count"];
                    setTotalCase(total);
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

    return <p>Total Cases: {totalCase}</p>;
}

export default NumOfCases;
