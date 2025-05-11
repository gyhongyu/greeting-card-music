function Slideshow({ images }) {
    try {
        const [currentIndex, setCurrentIndex] = React.useState(0);

        React.useEffect(() => {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 3000);
            return () => clearInterval(interval);
        }, [images.length]);

        return (
            <div data-name="slideshow" className="slideshow-container fade-in">
                <img
                    data-name="slide-image"
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                    className="w-full h-full object-cover object-center"
                />
            </div>
        );
    } catch (error) {
        console.error('Slideshow error:', error);
        reportError(error);
        return null;
    }
}
