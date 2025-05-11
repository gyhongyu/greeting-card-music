function AudioPlayer() {
    try {
        const audioRef = React.useRef(null);
        
        React.useEffect(() => {
            if (audioRef.current) {
                audioRef.current.volume = 0.5;
                const playPromise = audioRef.current.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Audio playback failed:', error);
                    });
                }
            }
        }, []);

        return (
            <audio
                data-name="background-music"
                ref={audioRef}
                src="https://gyhongyu.github.io/greeting-card-music/In%20Love%20With%20You.mp3"
                loop
                autoPlay
                className="hidden"
            />
        );
    } catch (error) {
        console.error('AudioPlayer error:', error);
        reportError(error);
        return null;
    }
}
