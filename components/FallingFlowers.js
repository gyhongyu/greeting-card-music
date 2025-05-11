function FallingFlowers() {
    try {
        const [flowers, setFlowers] = React.useState([]);

        React.useEffect(() => {
            const createFlower = () => {
                const flower = {
                    id: Math.random(),
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    size: `${Math.random() * 20 + 10}px`,
                    delay: `${Math.random() * 2}s`
                };
                setFlowers(prev => [...prev, flower]);
                setTimeout(() => {
                    setFlowers(prev => prev.filter(f => f.id !== flower.id));
                }, (parseFloat(flower.animationDuration) + parseFloat(flower.delay)) * 1000);
            };

            const interval = setInterval(createFlower, 300);
            return () => clearInterval(interval);
        }, []);

        return (
            <div data-name="falling-flowers">
                {flowers.map(flower => (
                    <div
                        key={flower.id}
                        data-name="flower"
                        className="flower text-pink-400"
                        style={{
                            left: flower.left,
                            animation: `fallFlower ${flower.animationDuration} linear ${flower.delay}`,
                            fontSize: flower.size
                        }}
                    >
                        🌸
                    </div>
                ))}
            </div>
        );
    } catch (error) {
        console.error('FallingFlowers error:', error);
        reportError(error);
        return null;
    }
}
