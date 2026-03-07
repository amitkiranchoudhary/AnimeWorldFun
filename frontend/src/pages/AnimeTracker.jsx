import { useState, useEffect } from 'react';
import { animeAPI } from '../utils/api';
import './AnimeTracker.css';

const STATUS_LABELS = {
    watching: '📺 Watching',
    completed: '✅ Completed',
    plan_to_watch: '📋 Plan to Watch',
    on_hold: '⏸ On Hold',
    dropped: '❌ Dropped'
};

export default function AnimeTracker() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [trackerEntries, setTrackerEntries] = useState([]);
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [searching, setSearching] = useState(false);
    const [sessionId] = useState(() => {
        let id = localStorage.getItem('awf_session');
        if (!id) { id = 'user_' + Math.random().toString(36).substr(2, 9); localStorage.setItem('awf_session', id); }
        return id;
    });

    useEffect(() => { fetchTracker(); }, []);

    const fetchTracker = async () => {
        try {
            const res = await animeAPI.getTracker(sessionId);
            setTrackerEntries(res.data.entries);
            setStats(res.data.stats);
        } catch (err) { console.error(err); }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.length < 2) return;
        setSearching(true);
        try {
            const res = await animeAPI.search(searchQuery);
            setSearchResults(res.data.anime);
        } catch (err) { console.error(err); }
        finally { setSearching(false); }
    };

    const addToTracker = async (anime, status = 'plan_to_watch') => {
        try {
            await animeAPI.addToTracker({
                sessionId,
                animeId: anime.malId,
                title: anime.title,
                titleJapanese: anime.titleJapanese,
                imageUrl: anime.imageUrl,
                totalEpisodes: anime.episodes,
                status
            });
            fetchTracker();
        } catch (err) { alert(err.message); }
    };

    const updateEntry = async (id, updates) => {
        try {
            await animeAPI.updateTracker(id, updates);
            fetchTracker();
        } catch (err) { console.error(err); }
    };

    const removeEntry = async (id) => {
        if (!confirm('Remove from tracker?')) return;
        try {
            await animeAPI.removeFromTracker(id);
            fetchTracker();
        } catch (err) { console.error(err); }
    };

    const filteredEntries = activeTab === 'all'
        ? trackerEntries
        : trackerEntries.filter(e => e.status === activeTab);

    return (
        <div className="tracker" id="anime-tracker-page">
            <div className="tracker__header">
                <div className="container">
                    <span className="home__section-tag">Anime</span>
                    <h1 className="tracker__title">
                        Anime <span className="gradient-text">Tracker</span>
                    </h1>
                    <p className="tracker__subtitle">Search, track, and manage your anime watchlist</p>

                    <form className="tracker__search" onSubmit={handleSearch} id="anime-search-form">
                        <input
                            type="text"
                            placeholder="Search anime (e.g., Naruto, Death Note)..."
                            className="bloglist__search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            id="anime-search-input"
                        />
                        <button type="submit" className="btn btn-primary btn-sm" disabled={searching}>
                            {searching ? '...' : 'Search'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="container">
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <section className="tracker__results">
                        <h3 className="tracker__results-title">Search Results</h3>
                        <div className="tracker__results-grid">
                            {searchResults.map(anime => (
                                <div key={anime.malId} className="search-card glass">
                                    <img src={anime.imageUrl} alt={anime.title} className="search-card__img" />
                                    <div className="search-card__info">
                                        <h4 className="search-card__title">{anime.title}</h4>
                                        <div className="search-card__meta">
                                            <span className="badge badge-pink">{anime.type}</span>
                                            <span>★ {anime.score || 'N/A'}</span>
                                            {anime.episodes > 0 && <span>{anime.episodes} eps</span>}
                                        </div>
                                        <p className="search-card__synopsis">{anime.synopsis?.substring(0, 120)}...</p>
                                        <div className="search-card__genres">
                                            {anime.genres?.slice(0, 3).map(g => (
                                                <span key={g} className="badge badge-purple">{g}</span>
                                            ))}
                                        </div>
                                        <div className="search-card__actions">
                                            <button className="btn btn-primary btn-sm" onClick={() => addToTracker(anime, 'watching')}>+ Watching</button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => addToTracker(anime, 'plan_to_watch')}>+ Plan</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Stats Bar */}
                <div className="tracker__stats">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <div key={key} className="tracker__stat-item">
                            <span className="tracker__stat-number">{stats[key === 'plan_to_watch' ? 'planToWatch' : key] || 0}</span>
                            <span className="tracker__stat-label">{label}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="tracker__tabs">
                    <button className={`tracker__tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        All ({stats.total || 0})
                    </button>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <button key={key} className={`tracker__tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tracker List */}
                <div className="tracker__list">
                    {filteredEntries.length > 0 ? (
                        filteredEntries.map(entry => (
                            <div key={entry._id} className="tracker-entry glass">
                                <img src={entry.imageUrl} alt={entry.title} className="tracker-entry__img" />
                                <div className="tracker-entry__info">
                                    <h4 className="tracker-entry__title">{entry.title}</h4>
                                    {entry.titleJapanese && <span className="tracker-entry__jp">{entry.titleJapanese}</span>}
                                    <div className="tracker-entry__progress">
                                        <span>Ep {entry.currentEpisode}/{entry.totalEpisodes || '?'}</span>
                                        {entry.totalEpisodes > 0 && (
                                            <div className="tracker-entry__bar">
                                                <div className="tracker-entry__bar-fill" style={{ width: `${(entry.currentEpisode / entry.totalEpisodes) * 100}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="tracker-entry__controls">
                                    <select
                                        value={entry.status}
                                        onChange={e => updateEntry(entry._id, { status: e.target.value })}
                                        className="tracker-entry__select"
                                    >
                                        {Object.entries(STATUS_LABELS).map(([k, l]) => (
                                            <option key={k} value={k}>{l}</option>
                                        ))}
                                    </select>
                                    <div className="tracker-entry__ep-controls">
                                        <button className="btn btn-secondary btn-sm" onClick={() => updateEntry(entry._id, { currentEpisode: Math.max(0, entry.currentEpisode - 1) })}>−</button>
                                        <span>{entry.currentEpisode}</span>
                                        <button className="btn btn-primary btn-sm" onClick={() => updateEntry(entry._id, { currentEpisode: entry.currentEpisode + 1 })}>+</button>
                                    </div>
                                    <div className="tracker-entry__score">
                                        <label>Score:</label>
                                        <select value={entry.score} onChange={e => updateEntry(entry._id, { score: parseInt(e.target.value) })} className="tracker-entry__select tracker-entry__select--sm">
                                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s}>{s === 0 ? '-' : s}</option>)}
                                        </select>
                                    </div>
                                    <button className="btn btn-danger btn-sm" onClick={() => removeEntry(entry._id)}>✕</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="home__empty">
                            <span className="home__empty-icon">🎌</span>
                            <p>No anime in this list yet. Search and add some!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
