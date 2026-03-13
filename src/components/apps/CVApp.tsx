export const CVApp = () => {
    // Add a unique query param to bypass browser cache
    const pdfUrl = `/cv.pdf?v=${new Date().getTime()}`;
    
    return (
        <div className="w-full h-full bg-slate-900 overflow-hidden">
            <iframe
                src={pdfUrl}
                className="w-full h-full border-none"
                title="Kadir Aydemir CV"
            />
        </div>
    );
};

