import './AnimeLoader.css';

export default function AnimeLoader() {
    // Anime symbols: shuriken, kunai, katana, scroll
    const symbols = ['✦', '🗡️', '⚔️', '📜'];

    return (
        <div className="anime-loader" id="anime-loader">
            <div className="anime-loader__symbols">
                {symbols.map((symbol, i) => (
                    <div key={i} className="anime-loader__item" style={{ '--delay': `${i * 0.15}s` }}>
                        {/* The bouncing symbol */}
                        <div className="anime-loader__bounce">
                            <div className="anime-loader__morph">
                                <span className="anime-loader__symbol">{symbol}</span>
                            </div>
                        </div>
                        {/* Impact ripple */}
                        <div className="anime-loader__ripple" />
                        {/* Shadow */}
                        <div className="anime-loader__shadow" />
                    </div>
                ))}
            </div>
            <p className="anime-loader__text">Loading...</p>
        </div>
    );
}
