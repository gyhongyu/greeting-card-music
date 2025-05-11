function LoadingScreen() {
    try {
        return (
            <div data-name="loading-screen" className="loading-screen">
                <h1 data-name="loading-text" className="text-4xl font-bold text-white loading-text">
                    Loading your special message...
                </h1>
            </div>
        );
    } catch (error) {
        console.error('LoadingScreen error:', error);
        reportError(error);
        return null;
    }
}
