function App() {
    try {
        const [isLoading, setIsLoading] = React.useState(true);
        const [isStarted, setIsStarted] = React.useState(false);
        const [images, setImages] = React.useState([]);

        React.useEffect(() => {
            const loadImages = async () => {
                const imageUrls = [
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/0de529f0-2958-4cc6-a264-635254963aca.jpeg',
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/4df3e655-f394-406c-80a5-072b9b89ce20.jpeg',
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/cd22354f-3de8-4dc4-b082-ccabc3aae8da.jpeg',
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/302a42cd-ca94-4d71-bfb9-379e19c4fc8f.jpeg',
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/e14b2334-5008-4bcd-9aa0-18db9342bc9d.jpeg',
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/88156987-d1a9-4501-b8cf-9767fd181b95.jpeg',
                    'https://app.trickle.so/storage/public/images/usr_0ff38ac768000001/da7ffe11-11a7-4c8a-8f87-5ccaf24440e8.jpeg'
                ];
                
                const loadedImages = await Promise.all(
                    imageUrls.map(url => {
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.src = url;
                            img.onload = () => resolve(url);
                            img.onerror = reject;
                        });
                    })
                );
                setImages(loadedImages);
                setTimeout(() => setIsLoading(false), 2000);
            };

            loadImages().catch(console.error);
        }, []);

        if (isLoading) {
            return <LoadingScreen />;
        }

        if (!isStarted) {
            return (
                <div data-name="start-screen" className="start-screen">
                    <button
                        data-name="start-button"
                        className="start-button text-white text-2xl md:text-3xl font-bold py-4 px-8 rounded-full border-2 border-white"
                        onClick={() => setIsStarted(true)}
                    >
                        Open Greeting Card
                    </button>
                </div>
            );
        }

        return (
            <div data-name="card-container" className="card-container">
                <AudioPlayer />
                <FallingFlowers />
                <h1 data-name="title" className="title text-4xl md:text-5xl font-bold text-center">
                    Happy Mother's Day
                </h1>
                <Slideshow images={images} />
                <MessageContent />
            </div>
        );
    } catch (error) {
        console.error('App error:', error);
        reportError(error);
        return null;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
