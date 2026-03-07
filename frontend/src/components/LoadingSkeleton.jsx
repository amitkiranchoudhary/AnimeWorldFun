import './LoadingSkeleton.css';

export function BlogCardSkeleton() {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-img"></div>
            <div className="skeleton-body">
                <div className="skeleton skeleton-badge" style={{ width: '60px' }}></div>
                <div className="skeleton skeleton-title" style={{ width: '90%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
                <div className="skeleton-meta">
                    <div className="skeleton skeleton-avatar"></div>
                    <div className="skeleton skeleton-text" style={{ width: '100px' }}></div>
                </div>
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="page-skeleton">
            <div className="skeleton" style={{ width: '200px', height: '20px', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ width: '60%', height: '40px', marginBottom: '2rem' }}></div>
            <div className="skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <BlogCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
