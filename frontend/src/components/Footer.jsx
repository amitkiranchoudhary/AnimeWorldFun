import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer" id="main-footer">
            <div className="footer__ticker">
                <div className="footer__ticker-track">
                    <span>WATCH ✦ READ ✦ TRACK ✦ DISCOVER ✦ ANIME ✦ MANGA ✦ BLOG ✦ CREATE ✦ </span>
                    <span>WATCH ✦ READ ✦ TRACK ✦ DISCOVER ✦ ANIME ✦ MANGA ✦ BLOG ✦ CREATE ✦ </span>
                </div>
            </div>

            <div className="footer__content container">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <img src="/images/logo.png" alt="AnimeWorldFun" className="footer__logo-img" />
                        </div>
                        <p className="footer__desc">
                            Your go-to destination for anime blogs, reviews, and tracking.
                            Built by an anime fan who has watched 300+ series.
                        </p>
                    </div>

                    <div className="footer__col">
                        <h4 className="footer__heading">Navigate</h4>
                        <Link to="/" className="footer__link">Home</Link>
                        <Link to="/blogs" className="footer__link">Blogs</Link>
                        <Link to="/anime-tracker" className="footer__link">Anime Tracker</Link>
                    </div>

                    <div className="footer__col">
                        <h4 className="footer__heading">Categories</h4>
                        <Link to="/blogs?category=Reviews" className="footer__link">Reviews</Link>
                        <Link to="/blogs?category=Top Lists" className="footer__link">Top Lists</Link>
                        <Link to="/blogs?category=News" className="footer__link">Anime News</Link>
                        <Link to="/blogs?category=Guides" className="footer__link">Guides</Link>
                    </div>

                    <div className="footer__col">
                        <h4 className="footer__heading">Connect</h4>
                        <a href="#" className="footer__link" target="_blank" rel="noopener">Twitter</a>
                        <a href="#" className="footer__link" target="_blank" rel="noopener">Discord</a>
                        <a href="#" className="footer__link" target="_blank" rel="noopener">GitHub</a>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>© {new Date().getFullYear()} AnimeWorldFun. Made with 💜 by an Otaku.</p>
                    <p className="footer__quote">"Believe in the you that believes in yourself."</p>
                </div>
            </div>
        </footer>
    );
}
